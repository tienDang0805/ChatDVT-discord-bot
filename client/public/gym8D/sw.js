const CACHE_NAME = "8d-bear-sherpa-pwa-v21";
const PRECACHE_ICONS = [
  "/gym8D/manifest.webmanifest",
  "/gym8D/assets/mascots/app_icon_sherpa_512.png",
  "/gym8D/assets/mascots/app_icon_512.png",
  "/gym8D/assets/mascots/app_icon_sherpa_256.webp",
  "/gym8D/assets/mascots/mascot_bench_press.webp",
  "/gym8D/assets/mascots/mascot_lat_pulldown.webp",
  "/gym8D/assets/mascots/mascot_leg_press.webp",
  "/gym8D/assets/mascots/mascot_pr_trophy.webp"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ICONS).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith("8d-bear-") && k !== CACHE_NAME)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const reqUrl = event.request.url || "";
  if (/\/api\//i.test(reqUrl)) return;

  const isMascotImage = /\/gym8D\/assets\/.*\.(webp|png|jpg|jpeg|svg)(\?|$)/i.test(reqUrl);
  if (isMascotImage) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        const net = fetch(event.request)
          .then((res) => {
            if (res && res.status === 200) {
              const copy = res.clone();
              caches.open(CACHE_NAME).then((c) => c.put(event.request, copy));
            }
            return res;
          })
          .catch(() => cached);
        return cached || net;
      })
    );
  }
});

self.addEventListener("push", (event) => {
  let payload = {
    title: "Gấu Gym 8D",
    body: "Đến giờ kiểm tra lịch tập & nhịp sinh học hôm nay!",
    icon: "/gym8D/assets/mascots/app_icon_sherpa_512.png",
    badge: "/gym8D/assets/mascots/app_icon_sherpa_512.png",
    tag: "gym8d-push",
    url: "/gym8D"
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      payload = Object.assign(payload, parsed);
    } catch (_err) {
      payload.body = event.data.text() || payload.body;
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon || "/gym8D/assets/mascots/app_icon_sherpa_512.png",
      badge: payload.badge || "/gym8D/assets/mascots/app_icon_sherpa_512.png",
      tag: payload.tag || "gym8d-push",
      renotify: true,
      data: { url: payload.url || "/gym8D" }
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || "/gym8D";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes("/gym8D") && "focus" in client) {
          if ("navigate" in client) {
            client.navigate(targetUrl).catch(() => {});
          }
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
