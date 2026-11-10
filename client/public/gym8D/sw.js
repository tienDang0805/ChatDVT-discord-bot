const CACHE_NAME = "8d-bear-sherpa-pwa-v12";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./src/gym-core.js",
  "./manifest.webmanifest",
  "./assets/mascots/app_icon_sherpa_512.png",
  "./assets/mascots/app_icon_512.png",
  "./assets/mascots/mascot_bench_press.png",
  "./assets/mascots/mascot_dumbbell_curl.png",
  "./assets/mascots/mascot_lat_pulldown.png",
  "./assets/mascots/mascot_leg_press.png",
  "./assets/mascots/mascot_incline_walk.png",
  "./assets/mascots/mascot_rest_hydration.png",
  "./assets/mascots/mascot_nutrition_vn.png",
  "./assets/mascots/mascot_sleep_6am.png",
  "./assets/mascots/mascot_body_calc.png",
  "./assets/mascots/mascot_pr_trophy.png",
  "./assets/mascots/mascot_gym_sheet_9x.png",
  "./assets/mascots/mascot_warmup_stretch.png",
  "./assets/mascots/mascot_deadlift_rdl.png",
  "./assets/mascots/mascot_coach_thumbsup.png",
  "./assets/mascots/mascot_shoulder_press.png",
  "./assets/mascots/mascot_cable_row.png",
  "./assets/mascots/mascot_plank_core.png",
  "./assets/mascots/mascot_plate_calc.png",
  "./assets/mascots/mascot_morning_banana_coffee.png",
  "./assets/mascots/mascot_deload_recovery.png",
  "./assets/mascots/mascot_chest_fly.png",
  "./assets/mascots/mascot_lateral_raise.png",
  "./assets/mascots/mascot_tricep_pushdown.png",
  "./assets/mascots/mascot_incline_db_press.png",
  "./assets/mascots/mascot_machine_chest_press.png",
  "./assets/mascots/mascot_iso_incline_press.png",
  "./assets/mascots/mascot_smith_incline_press.png",
  "./assets/mascots/mascot_assisted_chest_dip.png",
  "./assets/mascots/mascot_cable_crossover_fly.png",
  "./assets/mascots/mascot_machine_shoulder_press.png",
  "./assets/mascots/mascot_smith_shoulder_press.png",
  "./assets/mascots/mascot_cable_lateral_raise.png",
  "./assets/mascots/mascot_machine_lateral_raise.png",
  "./assets/mascots/mascot_reverse_pec_deck.png",
  "./assets/mascots/mascot_overhead_tricep_ext.png",
  "./assets/mascots/mascot_seated_dip_machine.png",
  "./assets/mascots/mascot_iso_high_row.png",
  "./assets/mascots/mascot_close_neutral_pulldown.png",
  "./assets/mascots/mascot_assisted_pull_up.png",
  "./assets/mascots/mascot_tbar_row.png",
  "./assets/mascots/mascot_machine_seated_row.png",
  "./assets/mascots/mascot_one_arm_db_row.png",
  "./assets/mascots/mascot_rope_face_pull.png",
  "./assets/mascots/mascot_preacher_curl.png",
  "./assets/mascots/mascot_cable_hammer_curl.png",
  "./assets/mascots/mascot_ab_crunch_machine.png",
  "./assets/mascots/mascot_hack_squat.png",
  "./assets/mascots/mascot_smith_box_squat.png",
  "./assets/mascots/mascot_leg_extension.png",
  "./assets/mascots/mascot_seated_leg_curl.png",
  "./assets/mascots/mascot_hip_thrust.png",
  "./assets/mascots/mascot_seated_calf_raise.png",
  "./assets/mascots/mascot_stair_stepper.png",
  "./assets/mascots/mascot_rowing_machine.png",
  "./assets/mascots/mascot_elliptical.png",
  "./assets/mascots/mascot_calendar_notify.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS).catch(() => {})).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const reqUrl = event.request.url || "";
  const isImage = /\.(png|webp|jpg|jpeg|svg|ico)(\?|$)/i.test(reqUrl);
  if (!isImage) {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(event.request, copy));
          }
          return res;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }
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
});

self.addEventListener("push", (event) => {
  let payload = {
    title: "Gấu Gym 8D — Nhắc Ngủ Sớm 21:15",
    body: "Soạn sẵn đồ tập & bình nước 1L để 06:00 sáng mai bước vào ca tập sung sức nhất!",
    icon: "./assets/mascots/app_icon_sherpa_512.png"
  };
  if (event.data) {
    try {
      payload = Object.assign(payload, event.data.json());
    } catch (e) {
      payload.body = event.data.text();
    }
  }
  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon,
      badge: "./assets/mascots/app_icon_sherpa_512.png",
      vibrate: [200, 100, 200]
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ("focus" in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow("./index.html");
    })
  );
});
