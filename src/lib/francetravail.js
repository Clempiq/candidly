/**
 * France Travail API (ex-Pôle Emploi)
 * Docs: https://francetravail.io/data/api/offres-emploi
 *
 * Required env vars:
 *   VITE_FT_CLIENT_ID
 *   VITE_FT_CLIENT_SECRET
 */

const TOKEN_CACHE_KEY = 'ft_token'
const TOKEN_EXPIRY_KEY = 'ft_token_expiry'

async function getAccessToken() {
  // Check cached token
  const cached = sessionStorage.getItem(TOKEN_CACHE_KEY)
  const expiry = Number(sessionStorage.getItem(TOKEN_EXPIRY_KEY) ?? 0)
  if (cached && Date.now() < expiry) return cached

  const clientId = import.meta.env.VITE_FT_CLIENT_ID
  const clientSecret = import.meta.env.VITE_FT_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('France Travail API credentials not configured')
  }

  const response = await fetch(
    'https://entreprise.francetravail.fr/connexion/oauth2/access_token?realm=%2Fpartenaire',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
        scope: 'api_offresdemploiv2 o2dsoffre',
      }),
    }
  )

  if (!response.ok) throw new Error('Impossible d\'obtenir le token France Travail')

  const data = await response.json()
  sessionStorage.setItem(TOKEN_CACHE_KEY, data.access_token)
  sessionStorage.setItem(TOKEN_EXPIRY_KEY, String(Date.now() + (data.expires_in - 30) * 1000))
  return data.access_token
}

/**
 * Search job offers
 * @param {Object} params
 * @param {string} params.motsCles - Keywords
 * @param {string} [params.commune] - INSEE code of commune
 * @param {string} [params.typeContrat] - CDI, CDD, MIS, etc.
 * @param {number} [params.distance] - km radius (requires commune)
 * @param {string} [params.range] - e.g. "0-14" (max 150)
 */
export async function searchOffres({ motsCles, commune, typeContrat, distance = 20, range = '0-14' }) {
  const token = await getAccessToken()

  const params = new URLSearchParams({ range })
  if (motsCles) params.set('motsCles', motsCles)
  if (commune) {
    params.set('commune', commune)
    params.set('distance', String(distance))
  }
  if (typeContrat) params.set('typeContrat', typeContrat)

  const response = await fetch(
    `https://api.francetravail.io/partenaire/offresdemploi/v2/offres/search?${params}`,
    { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }
  )

  if (response.status === 204) return { resultats: [], filtresPossibles: [] }
  if (!response.ok) {
    const err = await response.text()
    throw new Error(`France Travail API error: ${err}`)
  }

  return response.json()
}

/**
 * Get a single offer by id
 */
export async function getOffre(id) {
  const token = await getAccessToken()
  const response = await fetch(
    `https://api.francetravail.io/partenaire/offresdemploi/v2/offres/${id}`,
    { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }
  )
  if (!response.ok) throw new Error('Offre introuvable')
  return response.json()
}

/** Contract type labels */
export const CONTRACT_TYPES = [
  { value: '', label: 'Tous types' },
  { value: 'CDI', label: 'CDI' },
  { value: 'CDD', label: 'CDD' },
  { value: 'MIS', label: 'Intérim' },
  { value: 'SAI', label: 'Saisonnier' },
  { value: 'CCE', label: 'Indépendant / Freelance' },
]
