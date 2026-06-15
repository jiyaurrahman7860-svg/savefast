/**
 * SaveFast.in Service Worker
 * Handles network interception and client caching strategies for offline accessibility.
 */

const CACHE_NAME = 'savefast-cache-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/about.html',
  '/contact.html',
  '/blog.html',
  '/privacy.html',
  '/dmca.html',
  '/terms.html',
  '/css/styles.css',
  '/js/theme.js',
  '/js/firebase-config.js',
  '/js/components.js',
  '/js/downloader.js',
  '/manifest.json'
];

// Perform install & cache assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Clean outdated caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Network-First fall backing to Cache strategy
self.addEventListener('fetch', (e) => {
  // Avoid intercepting Firebase analytics or Cloud Functions API requests
  if (e.request.url.includes('firebase') || e.request.url.includes('resolveMedia') || e.request.url.includes('googleapis')) {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // If valid response, cache it dynamically
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache if offline
        return caches.match(e.request);
      })
  );
});
