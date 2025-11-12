// Cache version - increment when making breaking changes
const CACHE_VERSION = '5';
const CACHE_NAMES = {
  PAGES: `habika-pages-v${CACHE_VERSION}`,
  ASSETS: `habika-assets-v${CACHE_VERSION}`,
  IMAGES: `habika-images-v${CACHE_VERSION}`,
};

const CRITICAL_URLS = [
  '/',
  '/app',
  '/offline',
  '/manifest.json',
];

const APP_URLS = [
  '/app/actividades',
  '/app/habitos',
  '/app/estadisticas',
  '/app/perfil',
  '/landing'
];

// Instalar service worker - cache critical resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    // Cache critical pages first
    caches.open(CACHE_NAMES.PAGES).then((cache) => {
      return cache.addAll(CRITICAL_URLS).catch(() => Promise.resolve());
    }).then(() => {
      // Then cache app pages (non-critical)
      return caches.open(CACHE_NAMES.PAGES).then((cache) => {
        return cache.addAll(APP_URLS).catch(() => Promise.resolve());
      });
    })
  );
  self.skipWaiting();
});

// Activate and clean up old caches
self.addEventListener('activate', (event) => {
  const validCacheNames = Object.values(CACHE_NAMES);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter(name => !validCacheNames.includes(name))
          .map(cacheName => caches.delete(cacheName))
      );
    })
  );
  self.clients.claim();
});

// Fetch strategy: Cache First for assets, Network First for pages
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Cache First strategy for images (long-lived assets)
  if (url.pathname.match(/\.(jpg|jpeg|png|gif|svg)$/i)) {
    event.respondWith(
      caches.match(request).then((response) => {
        return (
          response ||
          fetch(request).then((response) => {
            if (response?.status === 200) {
              const cache = caches.open(CACHE_NAMES.IMAGES);
              cache.then(c => c.put(request, response.clone()));
            }
            return response;
          }).catch(() => {
            // Return placeholder or cached fallback
            return caches.match('/app/offline');
          })
        );
      })
    );
    return;
  }

  // Cache First for static assets (css, js fonts)
  if (url.pathname.match(/\.(css|js|woff|woff2|eot|ttf|otf)$/i)) {
    event.respondWith(
      caches.match(request).then((response) => {
        return (
          response ||
          fetch(request).then((response) => {
            if (response?.status === 200) {
              // Clone BEFORE using the response
              const clonedResponse = response.clone();
              const cache = caches.open(CACHE_NAMES.ASSETS);
              cache.then(c => c.put(request, clonedResponse));
            }
            return response;
          }).catch(() => null)
        );
      })
    );
    return;
  }

  // Stale-while-revalidate pattern for pages
  // Improved: Returns cached immediately if available, fetches in background
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      // Start fetching in background regardless
      const fetchPromise = fetch(request)
        .then((response) => {
          // Only cache successful responses for navigation requests
          if (response?.status === 200 && request.mode === 'navigate') {
            // Clone BEFORE using the response
            const clonedResponse = response.clone();
            const cache = caches.open(CACHE_NAMES.PAGES);
            cache.then(c => c.put(request, clonedResponse));
          }
          return response;
        })
        .catch(() => {
          // Network failed - fallback to offline page for navigation
          if (request.mode === 'navigate') {
            return caches.match('/app/offline');
          }
          return null;
        });

      // Return cached immediately, or wait for network if no cache
      return cachedResponse || fetchPromise;
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
