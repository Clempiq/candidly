import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

let ftToken: string | null = null
let ftTokenExpiry = 0

async function getFTToken(): Promise<string> {
  if (ftToken && Date.now() < ftTokenExpiry) return ftToken
  const res = await fetch(
    'https://entreprise.francetravail.fr/connexion/oauth2/access_token?realm=%2Fpartenaire',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: Deno.env.get('FT_CLIENT_ID')!,
        client_secret: Deno.env.get('FT_CLIENT_SECRET')!,
        scope: 'api_offresdemploiv2 o2dsoffre',
      }),
    }
  )
  if (!res.ok) throw new Error(`FT token error: ${await res.text()}`)
  const data = await res.json()
  ftToken = data.access_token
  ftTokenExpiry = Date.now() + (data.expires_in - 30) * 1000
  return ftToken!
}

async function searchFTOffers(keywords: string, contractType?: string): Promise<any[]> {
  const token = await getFTToken()
  const params = new URLSearchParams({ motsCles: keywords, range: '0-9' })
  if (contractType) params.set('typeContrat', contractType)
  const res = await fetch(
    `https://api.francetravail.io/partenaire/offresdemploi/v2/offres/search?${params}`,
    { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }
  )
  if (res.status === 204) return []
  if (!res.ok) return []
  const data = await res.json()
  return data.resultats ?? []
}

function b64urlToUint8(b64url: string): Uint8Array {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/')
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
}

function uint8ToB64url(buf: Uint8Array): string {
  return btoa(String.fromCharCode(...buf)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function buildVapidAuth(audience: string): Promise<string> {
  const privateKey = await crypto.subtle.importKey(
    'pkcs8', b64urlToUint8(Deno.env.get('VAPID_PRIVATE_KEY')!),
    { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']
  )
  const header  = uint8ToB64url(new TextEncoder().encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })))
  const payload = uint8ToB64url(new TextEncoder().encode(JSON.stringify({
    aud: audience, exp: Math.floor(Date.now() / 1000) + 43200, sub: 'mailto:candidly@app.local',
  })))
  const sigDer = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, privateKey, new TextEncoder().encode(`${header}.${payload}`))
  const der = new Uint8Array(sigDer)
  let o = 2
  const rLen = der[o + 1]; o += 2
  const r = der.slice(o + (rLen > 32 ? 1 : 0), o + rLen); o += rLen
  const sLen = der[o + 1]; o += 2
  const s = der.slice(o + (sLen > 32 ? 1 : 0), o + sLen)
  const sig = new Uint8Array(64)
  sig.set(r.slice(-32), 32 - r.length); sig.set(s.slice(-32), 64 - s.length)
  return `vapid t=${header}.${payload}.${uint8ToB64url(sig)},k=${Deno.env.get('VAPID_PUBLIC_KEY')}`
}

async function sendPush(subscription: any, payload: string): Promise<void> {
  const endpoint: string = subscription.endpoint
  const vapidAuth = await buildVapidAuth(new URL(endpoint).origin)
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { Authorization: vapidAuth, 'Content-Type': 'application/json', TTL: '86400' },
    body: payload,
  })
  if (!res.ok && res.status !== 201) console.warn(`Push failed ${res.status}`)
}

Deno.serve(async (_req) => {
  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    const { data: alerts, error } = await supabase.from('job_alerts').select('*').eq('is_active', true)
    if (error) throw error
    if (!alerts?.length) return new Response(JSON.stringify({ ok: true, message: 'No active alerts' }))

    let totalNotifications = 0
    for (const alert of alerts) {
      try {
        const offers = await searchFTOffers(alert.keywords, alert.contract_type || undefined)
        if (!offers.length) continue
        const { data: seen } = await supabase.from('seen_offers').select('offer_id').eq('alert_id', alert.id)
        const seenIds = new Set((seen ?? []).map((s: any) => s.offer_id))
        const newOffers = offers.filter((o: any) => !seenIds.has(o.id))
        if (!newOffers.length) continue
        await supabase.from('seen_offers').insert(newOffers.map((o: any) => ({
          user_id: alert.user_id, alert_id: alert.id, offer_id: o.id,
          offer_title: o.intitule, offer_company: o.entreprise?.nom ?? '',
          offer_url: o.origineOffre?.urlOrigine ?? `https://candidat.francetravail.fr/offres/recherche/detail/${o.id}`,
        })))
        const { data: subs } = await supabase.from('push_subscriptions').select('subscription').eq('user_id', alert.user_id)
        if (!subs?.length) continue
        const title = newOffers.length === 1 ? `Nouvelle offre : ${newOffers[0].intitule}` : `${newOffers.length} nouvelles offres pour "${alert.name}"`
        const body  = newOffers.length === 1 ? `${newOffers[0].entreprise?.nom ?? ''} · ${newOffers[0].lieuTravail?.libelle ?? ''}` : newOffers.slice(0,3).map((o:any)=>o.intitule).join(', ')
        const pushPayload = JSON.stringify({ title, body, url: '/job-alerts', alertId: alert.id })
        for (const sub of subs) { await sendPush(sub.subscription, pushPayload); totalNotifications++ }
      } catch (e) { console.error(`Alert ${alert.id}:`, e) }
    }
    return new Response(JSON.stringify({ ok: true, alerts: alerts.length, notifications: totalNotifications }), { headers: { 'Content-Type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
