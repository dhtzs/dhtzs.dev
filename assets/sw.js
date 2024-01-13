import * as params from "@params";

var cacheStorage = "cache_" + params.md5Hash,
    assetsToCache = [
        "/",
        "/about-me/",
        "/write-ups/",
        "/search/",
        "/404",
        "/assets/css/stylesheet.css",
        "/assets/js/search.js",
        "/site.webmanifest",
        "/images/profile.jpg",
        "/images/profile.webp"
    ];

self.addEventListener("install", function(event) {
    event.waitUntil(caches.open(cacheStorage).then(function(cache) {
        return cache.addAll([].concat.apply([], assetsToCache));
    }).then(function() {
        return self.skipWaiting();
    }));
});

self.addEventListener("fetch", function(event) {
    if (!event.request.headers.get("Save-Data"))
        event.respondWith(fetch(event.request).catch(function() {
            return caches.match(event.request);
        }));
});

self.addEventListener("activate", function(event) {
    event.waitUntil(caches.keys().then(function(keyList) {
        return Promise.all(keyList.map(function(key) {
            if (cacheStorage.indexOf(key) === -1)
                return caches.delete(key);
            })
        ).then(function() {
            return self.clients.claim();
        });
    }));
});