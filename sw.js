const CACHE_NAME = 'chatbot-cache-v4';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    'https://cdnjs.cloudflare.com/ajax/libs/mathjs/10.6.4/math.min.js'
];

self.addEventListener('install', event => {
    try {
        event.waitUntil(
            caches.open(CACHE_NAME).then(cache => {
                console.log('Caching files:', urlsToCache);
                return cache.addAll(urlsToCache);
            }).catch(err => {
                console.error('Cache open error:', err);
                throw err;
            })
        );
    } catch (error) {
        console.error('Service Worker install error:', error);
    }
});

self.addEventListener('fetch', event => {
    try {
        event.respondWith(
            caches.match(event.request).then(response => {
                if (response) {
                    console.log('Serving from cache:', event.request.url);
                    return response;
                }
                console.log('Fetching from network:', event.request.url);
                return fetch(event.request);
            }).catch(err => {
                console.error('Fetch error:', err);
                throw err;
            })
        );
    } catch (error) {
        console.error('Service Worker fetch error:', error);
    }
});

self.addEventListener('activate', event => {
    try {
        const cacheWhitelist = [CACHE_NAME];
        event.waitUntil(
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (!cacheWhitelist.includes(cacheName)) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }).catch(err => {
                console.error('Cache cleanup error:', err);
                throw err;
            })
        );
    } catch (error) {
        console.error('Service Worker activate error:', error);
    }
});