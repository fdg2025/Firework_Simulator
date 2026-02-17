/**
 * Service Worker for Firework Simulator
 * Provides offline support and caching strategy
 */

const CACHE_NAME = 'firework-simulator-v1';
const RUNTIME_CACHE = 'firework-runtime-v1';

// Resources to cache on install
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './fonts/css.css',
  './js/script.js',
  './js/fscreen.js',
  './js/MyMath.js',
  './js/Stage.js',
  './js/app/audio.js',
  './js/app/colors.js',
  './js/app/constants.js',
  './js/app/input.js',
  './js/app/loop.js',
  './js/app/main.js',
  './js/app/particles.js',
  './js/app/perf.js',
  './js/app/shells.js',
  './js/app/state.js',
  './js/app/ui.js',
  './js/app/words.js',
  './audio/burst1.mp3',
  './audio/burst2.mp3',
  './audio/burst-sm-1.mp3',
  './audio/burst-sm-2.mp3',
  './audio/crackle1.mp3',
  './audio/crackle-sm-1.mp3',
  './audio/lift1.mp3',
  './audio/lift2.mp3',
  './audio/lift3.mp3',
  './images/favicon.png',
  './manifest.json'
];

/**
 * Install event - cache all static assets
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Precaching static assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        console.log('[SW] Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Installation failed:', error);
      })
  );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
            })
            .map((cacheName) => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[SW] Activation complete');
        return self.clients.claim();
      })
  );
});

/**
 * Fetch event - cache-first strategy for static assets,
 * network-first for API calls
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome extensions
  if (url.protocol === 'chrome-extension:') {
    return;
  }
  
  // Cache-first strategy for same-origin requests
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          return fetch(request)
            .then((response) => {
              // Don't cache non-successful responses
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }
              
              // Clone the response
              const responseToCache = response.clone();
              
              caches.open(RUNTIME_CACHE)
                .then((cache) => {
                  cache.put(request, responseToCache);
                });
              
              return response;
            })
            .catch((error) => {
              console.error('[SW] Fetch failed:', error);
              
              // Return offline page if available
              return caches.match('./index.html');
            });
        })
    );
  }
});

/**
 * Message event - handle messages from clients
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(RUNTIME_CACHE)
        .then((cache) => cache.addAll(event.data.urls))
    );
  }
});
