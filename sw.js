// Service Worker for Ethio-ICD E11 Tool
// Enables offline functionality with Network-first, fallback to cache strategy

const CACHE_NAME = 'ethio-icd-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/script.js',
    '/icd_data.js',
    '/icd_data.json',
    '/manifest.json',
    '/app-icon.png',
    '/sw.js'
];

// Install Event: Cache all essential assets
self.addEventListener('install', event => {
    console.log('Service Worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Caching essential assets');
            return cache.addAll(ASSETS_TO_CACHE).catch(error => {
                console.warn('Some assets failed to cache:', error);
                // Continue even if some assets fail to cache
                return Promise.resolve();
            });
        }).then(() => {
            // Force the waiting service worker to become the active service worker
            self.skipWaiting();
        })
    );
});

// Activate Event: Clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker activating...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            // Claim all clients immediately
            return self.clients.claim();
        })
    );
});

// Fetch Event: Network-first strategy with fallback to cache
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests and cross-origin requests
    if (request.method !== 'GET') {
        return;
    }

    // Handle requests
    event.respondWith(
        // Try network first
        fetch(request)
            .then(response => {
                // Only cache successful responses
                if (!response || response.status !== 200 || response.type === 'error') {
                    return response;
                }

                // Clone the response for caching
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(request, responseToCache);
                });

                return response;
            })
            .catch(() => {
                // Fall back to cache on network failure
                return caches.match(request).then(response => {
                    if (response) {
                        console.log('Serving from cache:', request.url);
                        return response;
                    }

                    // If request is for a page and it's not cached, return index.html
                    if (request.mode === 'navigate') {
                        return caches.match('/index.html');
                    }

                    // Return a generic offline response for other requests
                    return new Response(
                        'Offline - Resource not available',
                        {
                            status: 503,
                            statusText: 'Service Unavailable',
                            headers: new Headers({
                                'Content-Type': 'text/plain'
                            })
                        }
                    );
                });
            })
    );
});

// Background Sync (optional enhancement)
self.addEventListener('sync', event => {
    if (event.tag === 'sync-cache') {
        event.waitUntil(
            caches.open(CACHE_NAME).then(cache => {
                return cache.addAll(ASSETS_TO_CACHE).catch(error => {
                    console.warn('Background sync cache update failed:', error);
                });
            })
        );
    }
});