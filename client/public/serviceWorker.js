const cacheVersion = 'v1';

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(`image-cache-${cacheVersion}`).then(cache => {
      return cache.addAll([
        "/illustrations/no_internet_dark.svg",
        "/illustrations/no_internet_light.svg",
        "/illustrations/server_down_light.svg",
        "/illustrations/server_down_dark.svg",
        "/illustrations/error_dark.svg",
        "/illustrations/error_light.svg",
        "/loading_dark.gif",
        "/loading_light.gif",
        "/trashcan-close.svg",
        "/trashcan-open.svg",
      ]);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          // Delete old caches except for the current cache version
          return cacheName.startsWith('image-cache-') && cacheName !== `image-cache-${cacheVersion}`;
        }).map(cacheName => {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

/*In our fetch listener (specifically, event.respondWith), we pass along a promise from caches.match() which looks at the request and will find any cached results from entries the service worker created. If there’s a matching response, the cached value is returned.*/
