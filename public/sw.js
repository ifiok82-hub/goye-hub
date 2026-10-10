const CACHE_NAME = 'goye-hub-cache-v3';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/goye_gold_logo_1790428812570.jpg',
  '/icon-192.png',
  '/icon-512.png'
];

// Automatically unregister and clear all caches if running in development / preview (run.app or localhost)
if (
  self.location.hostname.includes('run.app') || 
  self.location.hostname === 'localhost' || 
  self.location.hostname === '127.0.0.1'
) {
  self.addEventListener('install', () => self.skipWaiting());
  self.addEventListener('activate', event => {
    event.waitUntil(
      caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
        .then(() => self.registration.unregister())
        .then(() => self.clients.claim())
    );
  });
} else {
  // Production PWA lifecycle (for goye-hub.vercel.app)
  self.addEventListener('install', event => {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then(cache => cache.addAll(ASSETS_TO_CACHE))
        .then(() => self.skipWaiting())
    );
  });

  self.addEventListener('activate', event => {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cache => {
            if (cache !== CACHE_NAME) {
              return caches.delete(cache);
            }
          })
        );
      }).then(() => self.clients.claim())
    );
  });

  self.addEventListener('fetch', event => {
    const url = event.request.url;

    // Skip API, external SDKs, Vite modules, and Pi Browser validation requests (return network only, no cache)
    if (
      url.includes('/@') ||
      url.includes('/src/') ||
      url.includes('/node_modules/') ||
      url.includes('/api/') || 
      url.includes('minepi.com') || 
      url.includes('paystack') || 
      url.includes('flutterwave') ||
      url.includes('validation-key.txt') ||
      url.includes('manifest.json') ||
      url.includes('pi-domain-verification.txt')
    ) {
      return; // Let browser make standard network request directly
    }

    if (event.request.method !== 'GET') {
      return;
    }

    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) {
            fetch(event.request)
              .then(networkResponse => {
                if (networkResponse && networkResponse.status === 200) {
                  caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, networkResponse);
                  });
                }
              })
              .catch(() => {});
            return cachedResponse;
          }
          return fetch(event.request);
        })
        .catch(() => fetch(event.request))
    );
  });
}
