/**
 * Offline Service Worker
 * Caches HTML, CSS, JavaScript, vendor libraries, site JSON datasets, and map tiles.
 * Implements Cache-First strategy for app shell and Dynamic Cache for tile requests.
 */

const CACHE_NAME = 'digital-heritage-explorer-v3';
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
  './vendor/leaflet/leaflet.css',
  './vendor/leaflet/leaflet.js',
  './data/sites.json',
  './data/trails.json',
  './images/icon-192.png',
  './images/icon-512.png'
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

// Activate Event — Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME && cache !== TILE_CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event — Handle requests
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Handle map tile requests (OpenStreetMap or external tile providers)
  if (url.hostname.includes('tile.openstreetmap.org') || url.pathname.includes('/tile/')) {
    event.respondWith(
      caches.open(TILE_CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(event.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => {
            // Return empty transparent tile pixel or null if offline and not cached
            return new Response('', { status: 404, statusText: 'Offline tile missing' });
          });
        });
      })
    );
    return;
  }

  // Handle static app shell & local assets (Cache-First)
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            if (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html')) {
              return caches.match('./index.html');
            }
          });
      })
  );
});
