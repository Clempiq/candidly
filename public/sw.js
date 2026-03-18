const CACHE_VERSION = 'v2'
const CACHE_NAME = `candidly-${CACHE_VERSION}`
const ASSETS_TO_CACHE = ['/index.html', '/manifest.json']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.map((name) => name !== CACHE_NAME && caches.delete(name)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => response || fetch(event.request))
      .catch(() => caches.match('/index.html'))
  )
})

self.addEventListener('push', (event) => {
  let data = {}
  try { data = event.data?.json() ?? {} } catch (_) {}

  const title = data.title || 'Candidly'
  const options = {
    body: data.body || 'Nouvelles offres disponibles',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    tag: data.alertId ? `alert-${data.alertId}` : 'candidly-alert',
    data: { url: data.url || '/job-alerts' },
    requireInteraction: false,
    vibrate: [200, 100, 200],
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/job-alerts'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus()
          client.navigate(url)
          return
        }
      }
      if (clients.openWindow) return clients.openWindow(url)
    })
  )
})
