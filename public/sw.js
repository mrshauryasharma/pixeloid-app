const CACHE_NAME = 'pixeloid-v4';
const ASSETS = [
  '/',
  '/chat',
  '/dashboard',
  '/pricing',
  '/login',
  '/signup',
  '/manifest.json',
  '/icons/icon-72.png',
  '/icons/icon-96.png',
  '/icons/icon-128.png',
  '/icons/icon-144.png',
  '/icons/icon-152.png',
  '/icons/icon-192.png',
  '/icons/icon-384.png',
  '/icons/icon-512.png',
];

// Install - Cache all assets
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Activate - Clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  event.waitUntil(clients.claim());
});

// Fetch - Cache first, network fallback
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Offline fallback
          if (event.request.mode === 'navigate') {
            return new Response(
              `<!DOCTYPE html>
              <html>
              <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Pixeloid - Offline</title></head>
              <body style="margin:0;background:linear-gradient(135deg,#0f0c29,#302b63,#24243e);color:white;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;text-align:center">
                <div>
                  <div style="font-size:80px">🚀</div>
                  <h1 style="font-size:28px;margin:16px 0">Pixeloid AI</h1>
                  <p style="color:rgba(255,255,255,0.6);margin:8px 0">You are offline</p>
                  <p style="color:#667eea;font-size:14px">Please check your internet connection</p>
                </div>
              </body>
              </html>`,
              { headers: { 'Content-Type': 'text/html' } }
            );
          }
          return new Response('Offline', { status: 503 });
        });
    })
  );
});