const CACHE_NAME = 'vesp-v1';
const STATIC_ASSETS = [
  '/offline.html',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
];

// Install — pre-cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch — Network First for navigations, Cache First for static
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension, webpack HMR, and Next.js internal requests in dev
  if (request.url.startsWith('chrome-extension://')) return;
  if (request.url.includes('/_next/webpack')) return;
  if (request.url.includes('/__nextjs')) return;
  if (request.url.includes('/_next/data')) return;

  // Skip RSC (React Server Components) flight requests
  const url = new URL(request.url);
  if (url.searchParams.has('_rsc')) return;
  if (request.headers.get('RSC') === '1') return;
  if (request.headers.get('Next-Router-State-Tree')) return;

  // Navigation requests (HTML pages) — Network First
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Only cache successful responses
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match('/offline.html'))
        )
        .then((response) => response || new Response('Offline', { status: 503, statusText: 'Service Unavailable' }))
    );
    return;
  }

  // Static assets — Cache First
  if (
    request.url.match(/\.(js|css|png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|eot)$/)
  ) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return response;
          })
      )
      .catch(() => new Response('', { status: 404 }))
    );
    return;
  }

  // All other GET requests — just let the network handle it, don't intercept
});
