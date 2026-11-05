const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `smart-shopping-${CACHE_VERSION}`;

// Cài đặt: bỏ qua chờ, kích hoạt ngay
self.addEventListener('install', (e) => {
  self.skipWaiting();
});

// Kích hoạt: xóa cache cũ
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Nhận lệnh từ app
self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

// Chiến lược: Network-first cho HTML, cache-first cho còn lại
self.addEventListener('fetch', (e) => {
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, copy));
        return res;
      }).catch(() => caches.match(e.request))
    );
  } else {
    e.respondWith(
      caches.match(e.request).then(r => r || fetch(e.request))
    );
  }
});