self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('rocket-v1').then((cache) => cache.addAll(['/', '/manifest.json']))
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return (
        response ||
        fetch(e.request).then((resp) => {
          const copy = resp.clone();
          caches.open('rocket-v1').then((cache) => cache.put(e.request, copy));
          return resp;
        })
      );
    })
  );
});
