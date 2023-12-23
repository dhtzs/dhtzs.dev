var cacheName = "cache_v1",
	urlsToCache = [
		"/",
		"about-me",
		"overview",
		"site.webmanifest",
		"assets/css/custom.css",
		"assets/images/profile.jpg"
	];

self.addEventListener("install", function(event) {
	event.waitUntil(caches.open(cacheName).then(function(cache) {
		return cache.addAll([].concat.apply([], urlsToCache));
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
			if (cacheName.indexOf(key) === -1)
				return caches.delete(key);
			})
		).then(function() {
			return self.clients.claim();
		});
	}));
});