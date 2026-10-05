// Migration from the old worker. HTTP/CDN caching now handles public assets.
// Keep this URL available so existing browsers can replace their old worker.
self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key.startsWith('devtiendang-')).map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});
