
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('image-cache').then(cache => {
      return cache.addAll([
        "/illustrations/no_internet_dark.svg",
        "/illustrations/no_internet_light.svg",
        "/illustrations/server_down_light.svg",
        "/illustrations/server_down_dark.svg",
        "/illustrations/error_dark.svg",
        "/illustrations/error_light.svg",

      ]);
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
