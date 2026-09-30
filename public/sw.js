/* GameVault shell service worker: same-origin app shell + thumbs only.
   Cross-origin game content is never cached (opaque, huge, evictable). */
const VERSION = 'gv-shell-v1';
const SHELL = ['/', '/search', '/manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()).catch(() => {})
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  // Thumbs: cache-first, cap count.
  if (url.pathname.startsWith('/thumbs/')) {
    event.respondWith(
      caches.open(VERSION).then(async (cache) => {
        const hit = await cache.match(event.request);
        if (hit) return hit;
        const res = await fetch(event.request);
        if (res.ok) {
          const keys = await cache.keys();
          if (keys.filter((r) => new URL(r.url).pathname.startsWith('/thumbs/')).length > 400) {
            const oldest = keys.find((r) => new URL(r.url).pathname.startsWith('/thumbs/'));
            if (oldest) await cache.delete(oldest);
          }
          cache.put(event.request, res.clone());
        }
        return res;
      })
    );
    return;
  }
  // Navigations + shell: network-first, offline fallback to cached shell.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((cache) => cache.put(event.request, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(event.request).then((hit) => hit || caches.match('/')))
    );
  }
});
