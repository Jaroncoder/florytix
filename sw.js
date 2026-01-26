const CACHE_NAME = 'florytix-v3';

const relativeUrls = [
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
    (async () => {
      // Create Request objects which will properly resolve relative URLs
      // relative to the service worker's location
      const requestsToCache = relativeUrls.map(url => new Request(url));
      
      const cache = await caches.open(CACHE_NAME);
      console.log('Opened cache');
      console.log('Caching URLs:', relativeUrls);
      
      try {
        await cache.addAll(requestsToCache);
        console.log('All files cached successfully');
      } catch (error) {
        console.log('Cache addAll failed, adding files individually:', error);
        // If addAll fails, try adding files one by one
        const results = await Promise.allSettled(
          requestsToCache.map(async (request) => {
            try {
              const response = await fetch(request);
              if (response.ok) {
                await cache.put(request, response);
                console.log(`Successfully cached: ${request.url}`);
              } else {
                console.log(`Failed to cache ${request.url}: status ${response.status}`);
              }
            } catch (err) {
              console.log(`Failed to cache ${request.url}:`, err);
            }
          })
        );
        console.log('Individual cache results:', results);
      }
    })()
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
            return caches.match('index.html') || caches.match(new Request('index.html'));
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
