/**
 * Offline Service Worker
 * Caches HTML, CSS, JavaScript, vendor libraries, site JSON dataset, and WebP photographs.
 * Implements Cache-First strategy for instant offline access.
 */

const CACHE_NAME = 'digital-heritage-explorer-v1';

const STATIC_ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './js/cards.js',
  './js/map.js',
  './js/gallery.js',
  './js/recognition.js',
  './vendor/leaflet/leaflet.css',
  './vendor/leaflet/leaflet.js',
  './data/sites.json',
  './images/rani-ki-vav/1.webp',
  './images/rani-ki-vav/2.webp',
  './images/modhera-sun-temple/1.webp',
  './images/modhera-sun-temple/2.webp',
  './images/adalaj-stepwell/1.webp',
  './images/adalaj-stepwell/2.webp',
  './images/sarkhej-roza/1.webp',
  './images/sarkhej-roza/2.webp',
  './images/champaner-pavagadh/1.webp',
  './images/champaner-pavagadh/2.webp',
  './images/dholavira/1.webp',
  './images/dholavira/2.webp',
  './images/somnath-temple/1.webp',
  './images/somnath-temple/2.webp',
  './images/lothal/1.webp',
  './images/lothal/2.webp',
  './images/uparkot-fort/1.webp',
  './images/uparkot-fort/2.webp',
  './images/prag-mahal/1.webp',
  './images/prag-mahal/2.webp',
  './images/dwarkadhish-temple/1.webp',
  './images/dwarkadhish-temple/2.webp'
];

// Install Event — Cache static shell and assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Pre-caching offline static assets...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Event — Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event — Cache-First strategy with Network fallback
self.addEventListener('fetch', (event) => {
  // Ignore non-GET requests or external tile servers like OSM tiles if needed
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request)
          .then((networkResponse) => {
            // Cache successful HTTP 200 responses
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            // Fallback for HTML navigation if offline
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('./index.html');
            }
          });
      })
  );
});
