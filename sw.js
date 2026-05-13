// Service Worker for Ethio-ICD E11 Tool
// Uses a stale-while-revalidate strategy for cached assets

const CACHE_NAME = 'ethio-icd-v1';
const ASSETS_TO_CACHE = [
    'index.html',
    'script.js',
    'icd_data.js',
    'icd_data.json',
    'manifest.json',
    'app-icon.png',
    'sw.js'
];

// Install Event: Cache all essential assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(ASSETS_TO_CACHE);
        }).then(() => self.skipWaiting())
    );
});

// Activate Event: Clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch Event: Stale-While-Revalidate for same-origin GET requests
self.addEventListener('fetch', event => {
    const request = event.request;
    const requestUrl = new URL(request.url);

    if (request.method !== 'GET' || requestUrl.origin !== self.location.origin) {
        return;
    }

    event.respondWith(
        caches.match(request).then(cachedResponse => {
            const networkFetch = fetch(request)
                .then(networkResponse => {
                    if (networkResponse && networkResponse.status === 200) {
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(request, networkResponse.clone());
                        });
                    }
                    return networkResponse;
                })
                .catch(() => null);

            if (cachedResponse) {
                return networkFetch.then(response => response || cachedResponse);
            }

            return networkFetch.then(response => {
                if (response) {
                    return response;
                }
                if (request.mode === 'navigate') {
                    return caches.match('index.html');
                }
                return new Response('Offline - Resource not available', {
                    status: 503,
                    statusText: 'Service Unavailable',
                    headers: new Headers({ 'Content-Type': 'text/plain' })
                });
            });
        })
    );
});