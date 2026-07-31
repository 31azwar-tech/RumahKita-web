/* RumahKita — service worker
   (1) cache shell agar bisa dibuka offline, (2) network-first untuk HTML. */

const CACHE = 'rumahkita-v1';
const SHELL = ['./', './index.html', './manifest.json',
  './icon-192.png', './icon-512.png', './favicon.png', './apple-touch-icon.png'];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).catch(() => {}));
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  // Jangan campur tangan permintaan Firebase / lintas-origin.
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(req).then(r => r || fetch(req)).catch(() => caches.match('./index.html')));
});
