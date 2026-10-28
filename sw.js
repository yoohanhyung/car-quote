// 오프라인 캐시: 앱 셸을 미리 저장하고, 이후에는 캐시 우선 + 백그라운드 갱신
const CACHE = 'quote-compare-v1.2.1';
const SHELL = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './ppt.js',
  './quotes/s1.jpg',
  './quotes/s2.jpg',
  './quotes/s3.jpg',
  './quotes/n1.jpg',
  './quotes/n2.jpg',
  './quotes/n3.jpg',
  './quotes/n4.jpg',
  './quotes/n5.jpg',
  './quotes/n6.jpg',
  './quotes/n7.jpg',
  './vendor/pptxgen.bundle.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-512.png',
  './icons/apple-touch-icon.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL.map((u) => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const key = req.mode === 'navigate' ? './index.html' : req;
      const cached = await cache.match(key, { ignoreSearch: true });
      const network = fetch(req, { cache: 'no-cache' })
        .then((res) => {
          if (res.ok) cache.put(key, res.clone());
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
