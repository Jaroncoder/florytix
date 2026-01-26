const CACHE_NAME = 'florytix-v2';
const urlsToCache = [
  'index.html',
  'shop.html',
  'cart.html',
  'contact.html',
  'styles.css',
  'script.js',
  'logo.png',
  'manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache).catch((error) => {
          console.log('Cache addAll failed, adding files individually:', error);
          // If addAll fails, try adding files one by one
          return Promise.all(
            urlsToCache.map((url) => {
              return fetch(url)
                .then((response) => {
                  if (response.ok) {
                    return cache.put(url, response);
                  }
                })
                .catch((err) => {
                  console.log(`Failed to cache ${url}:`, err);
                });
            })
          );
        });
      })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Fetch from cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        
        // Fetch from network
        return fetch(event.request).then(
          (response) => {
            // Check if valid response
            if (!response || response.status !== 200) {
              return response;
            }

            // Clone the response for caching
            const responseToCache = response.clone();

            // Cache the response (only same-origin or explicitly listed URLs)
            caches.open(CACHE_NAME)
              .then((cache) => {
                // Only cache if it's a basic response (same-origin) or in our cache list
                if (response.type === 'basic' || urlsToCache.includes(event.request.url)) {
                  cache.put(event.request, responseToCache);
                }
              })
              .catch((err) => {
                console.log('Cache put failed:', err);
              });

            return response;
          }
        ).catch((error) => {
          console.log('Fetch failed:', error);
          // If fetch fails and it's a navigation request, return cached index.html
          if (event.request.mode === 'navigate') {
            return caches.match('index.html');
          }
          throw error;
        });
      })
  );
});

// Update Service Worker
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control of all pages immediately
  return self.clients.claim();
});
