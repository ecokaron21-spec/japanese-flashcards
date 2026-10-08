const cacheName = "minna-cards-v44";
const files = ["./", "./index.html", "./manifest.webmanifest", "./styles.css", "./data.v10.js", "./lesson-11.js", "./lesson-11-finalize.js", "./lesson-12.js", "./lesson-13.js", "./lesson-14.js", "./lesson-15.js", "./lesson-16.js", "./lesson-17.js", "./lesson-18.js", "./lesson-19.js", "./lesson-20.js", "./lesson-21.js", "./lesson-22.js", "./lesson-23.js", "./lesson-24.js", "./lesson-25.js", "./lesson-25-select.js", "./app.v10.js"];
self.addEventListener("install", (event) => event.waitUntil(caches.open(cacheName).then((cache) => cache.addAll(files))));
self.addEventListener("fetch", (event) => event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request))));

