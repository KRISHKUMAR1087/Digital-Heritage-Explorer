/**
 * Offline Service Worker
 * Caches HTML, CSS, JavaScript, vendor libraries, site JSON datasets, and map tiles.
 * Implements Cache-First strategy for app shell and Dynamic Cache for tile & image requests.
 */

// Bump Cache Name to v6 to force cache invalidation & update precached modules
const CACHE_NAME = 'digital-heritage-explorer-v6';
const TILE_CACHE_NAME = 'digital-heritage-map-tiles-v1';

const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/app.js',
  './js/cards.js',
  './js/map.js',
  './js/gallery.js',
  './js/recognition.js',
  './js/search.js',
  './js/seo.js',
  './js/a11y.js',
  './js/imageFallback.js',
  './js/pwa.js',
  './js/stepwell.js',
  './js/sun.js',
  './js/audio.js',
  './js/compare.js',
  './js/living.js',
  './js/siteCompare.js',
  './js/postcard.js',
  './js/threeDExplorer.js',
  './js/passport.js',
  './js/i18n.js',
  './js/trails.js',
  './js/touristTools.js',
  './js/planner.js',
  './js/routing.js',
  './js/weather.js',
  './js/panorama.js',
  './js/quiz.js',
  './js/timeline.js',
  './js/community.js',
  './js/sitesData.js',
  './vendor/leaflet/leaflet.css',
  './vendor/leaflet/leaflet.js',
  './data/sites.json',
  './data/trails.json',
  './images/icon-192.png',
  './images/icon-512.png',
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23e2d8c3"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%235c4033">🏛️ Image Unavailable</text></svg>'
];

// Install Event — Cache static shell and assets resiliently
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async (cache) => {
        console.log('[SW] Pre-caching offline static assets...');
        await Promise.all(
          STATIC_ASSETS.map(url => 
            cache.add(url).catch(err => console.warn('[SW] Could not precache asset:', url, err))
          )
        );
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Event — Delete ALL old caches immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME && cache !== TILE_CACHE_NAME) {
            console.log('[SW] Purging old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event — Network-First for Data & JS, Cache-First for Tiles/Images
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Map Tiles (Cache-First)
  if (url.hostname.includes('tile.openstreetmap.org') || url.pathname.includes('/tile/')) {
    event.respondWith(
      caches.open(TILE_CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          return fetch(event.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => new Response('', { status: 404, statusText: 'Offline tile missing' }));
        });
      })
    );
    return;
  }

  // Remote & Local Images (Runtime Caching)
  if (url.hostname.includes('upload.wikimedia.org') || url.pathname.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i)) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
          }
          return networkResponse;
        }).catch(() => {
          return caches.match('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23e2d8c3"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%235c4033">🏛️ Image Unavailable</text></svg>');
        });
      })
    );
    return;
  }

  // Network-First strategy for HTML, CSS, JS, JSON (fresh updates when online, cached when offline)
  if (
    url.pathname.endsWith('.html') || 
    url.pathname.endsWith('/') || 
    url.pathname.endsWith('.css') || 
    url.pathname.endsWith('.js') || 
    url.pathname.endsWith('.json') ||
    url.search.includes('v=')
  ) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(event.request).then(cached => {
            if (cached) return cached;
            if (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html')) {
              return caches.match('./index.html');
            }
          });
        })
    );
    return;
  }

  // Fallback for remaining requests
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(event.request);
      })
  );
});
