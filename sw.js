const CACHE = "frog-house-village-v42-ground2-flat";
const ASSETS = ["./village-world.js", "./village-art.js", "./village.js", "./village.css", "./village-npc.webp", "./village-props.webp", "./village-map.webp", "./index.html", "./manifest.webmanifest", "./icon-180.png", "./icon-512.png", "./album-cover-lilac.webp", "./album-cover-fish.webp", "./album-photo-01.webp", "./album-photo-02.webp", "./album-photo-03.webp", "./album-photo-04.webp", "./album-photo-05.webp", "./album-photo-06.webp", "./album-photo-07.webp", "./album-photo-08.webp", "./album-photo-09.webp", "./album-photo-10.webp", "./album-photo-11.webp", "./album-photo-12.webp", "./album-photo-13.webp", "./album-photo-14.webp", "./album-photo-15.webp", "./album-photo-16.webp", "./album-photo-17.webp", "./album-photo-18.webp", "./album-photo-19.webp", "./album-photo-20.webp", "./album-photo-21.webp", "./album-photo-22.webp", "./album-photo-23.webp", "./album-photo-24.webp", "./album-photo-25.webp", "./album-photo-26.webp", "./album-photo-27.webp", "./album-photo-28.webp", "./album-photo-29.webp", "./album-photo-30.webp"];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  if (new URL(event.request.url).origin !== self.location.origin) return;
  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).then(response => {
      if (response.ok) { const copy = response.clone(); caches.open(CACHE).then(cache => cache.put(event.request, copy)); }
      return response;
    }).catch(() => caches.match(event.request).then(cached => cached || caches.match("./index.html"))));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    const copy = response.clone();
    caches.open(CACHE).then(cache => cache.put(event.request, copy));
    return response;
  }).catch(() => caches.match("./index.html"))));
});
