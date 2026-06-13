/* DairyBook service worker — hand-written, no workbox.
   Caches the app shell + hashed assets + Google Fonts on first load so the
   app works fully offline afterwards. Bump CACHE to force-refresh clients. */
const CACHE = 'dairybook-v1'
const CORE = ['/', '/index.html', '/manifest.webmanifest', '/favicon.svg']

self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE).catch(() => {})))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  const sameOrigin = url.origin === self.location.origin
  const isFont = /fonts\.(googleapis|gstatic)\.com$/.test(url.host)
  // let other cross-origin calls (e.g. open-meteo weather) hit the network directly
  if (!sameOrigin && !isFont) return

  // SPA navigations: network-first, fall back to the cached shell when offline
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).catch(() => caches.match('/index.html').then((r) => r || caches.match('/'))))
    return
  }

  // everything else (hashed JS/CSS, icons, fonts): cache-first, then fill cache
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached
      return fetch(req)
        .then((res) => {
          if (res && (res.status === 200 || res.type === 'opaque')) {
            const copy = res.clone()
            caches.open(CACHE).then((c) => c.put(req, copy))
          }
          return res
        })
        .catch(() => cached)
    }),
  )
})
