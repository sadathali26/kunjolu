const CACHE_NAME = 'anniversary-v5';

// Only cache truly static assets (images), NOT the code files
const STATIC_ASSETS = [
  './photos/adeeba.png',
  './photos/logo.png',
];

// Install: pre-cache only images
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: delete old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: NETWORK FIRST for code files, cache first for images
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  const ext = url.pathname.split('.').pop().toLowerCase();

  // For JS/CSS/HTML and large media files (mp3/wav/mp4): always go to network directly (prevent 206 status error)
  if (['jsx', 'js', 'css', 'html', 'mp3', 'wav', 'mp4', 'm4a'].includes(ext) || url.pathname.endsWith('/')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // For images/fonts: cache first, network fallback with standard 200-only cache safety check
  event.respondWith(
    caches.match(event.request).then(cached =>
      cached || fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
    )
  );
});
