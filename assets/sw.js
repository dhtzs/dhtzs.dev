import * as params from "@params";

var cacheStorage = "cache_" + params.buildHash,
    assetsToCache = [
        "/",
        "/about-me/",
        "/write-ups/",
        "/contact-me/",
        "/search/",
        "/404",
        "/index.json",
        "/assets/css/stylesheet.css",
        "/assets/js/search.js",
        "/site.webmanifest",
        "/images/profile.jpg",
        "/images/profile.webp",
        "/images/screenshot-1280x800.jpg",
        "/images/screenshot-720x1280.jpg",
        "/.well-known/security.txt",
        "/pubkey.asc",
        "/favicon.ico",
        "/favicons/favicon.svg",
        "/favicons/favicon-16x16.png",
        "/favicons/favicon-32x32.png",
        "/favicons/favicon-72x72.png",
        "/favicons/favicon-96x96.png",
        "/favicons/favicon-128x128.png",
        "/favicons/favicon-144x144.png",
        "/favicons/favicon-152x152.png",
        "/favicons/favicon-180x180.png",
        "/favicons/favicon-192x192.png",
        "/favicons/favicon-384x384.png",
        "/favicons/favicon-512x512.png"
    ].concat(params.extraAssetsToCache);

self.addEventListener("install", function(event) {
    event.waitUntil(caches.open(cacheStorage).then(function(cache) {
        return cache.addAll(assetsToCache);
    }).then(function() {
        return self.skipWaiting();
    }));
});

self.addEventListener("activate", function(event) {
    event.waitUntil(Promise.all([
        caches.keys().then(function(keyList) {
            return Promise.all(keyList.map(function(key) {
                if (key.indexOf(cacheStorage) === -1 && key.indexOf("offline-access") === -1)
                    return caches.delete(key);
            }));
        }),

        fetch("/index.json?t=" + Date.now()).then(function(res) {
            return res.json();
        }).then(function(data) {
            data = [].concat.apply([], data.map(function(data) {
                return [data.permalink].concat(data.resources);
            }));
            return caches.open("offline-access").then(function(cache) {
                return cache.keys().then(function(keyList) {
                    return Promise.all(keyList.map(function(key) {
                        if (data.indexOf(key.url) === -1)
                            return cache.delete(key);
                    }));
                });
            });
        }),

        self.clients.claim()
    ]));
});

self.addEventListener("fetch", function(event) {
    if (!event.request.headers.get("Save-Data"))
        event.respondWith(fetch(event.request).catch(function(e) {
            console.error(e.message);
            return caches.match(event.request);
        }));
});