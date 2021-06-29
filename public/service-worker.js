const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/index.js',
    '/style.css',
    '/manifest.webmanifest',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    "https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css",
    "https://cdn.jsdelivr.net/npm/chart.js@2.8.0"
]
const STATIC_CACHE = "static-cache-v1";
const DATA_CACHE = "data-cache-v1";

self.addEventListener("install", function (event) {
    event.waitUntil(
        caches.open(STATIC_CACHE).then(cache => {
            console.log("cache uploaded");
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    self.skipWaiting();
});

self.addEventListener("activate", function (event) {
    event.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(
                keyList.map(key => {
                    if (key !== STATIC_CACHE && key !== DATA_CACHE) {
                        console.log("Deleting old cache", key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );

    self.clients.claim();
});

self.addEventListener("fetch", event => {
    if (event.request.url.includes('/api/')) {
        console.log('fetching data', event.request.url);

        event.respondWith(
            caches.open(DATA_CACHE).then(cache => {
                return fetch(event.request)
                    .then(response => {
                        if (response.status === 200) {
                            cache.put(event.request.url, response.clone());
                        }
                        return response;
                    })
                    .catch(err => {
                        return cache.match(event.request);
                    });
            })
        );
        return;
    }

    event.respondWith(caches.open(STATIC_CACHE).then(cache => {
        return cache.match(event.request).then(response => {
            return response || fetch(event.request);
        });
    })
    );
});