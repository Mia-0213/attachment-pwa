// Attachment PWA Service Worker
const CACHE_NAME = "attachment-v2.0";

const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/globals.css",
];

// 安裝 Service Worker 並預先快取 Static Assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// 啟用 Service Worker 並清理舊版 Cache
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 攔截請求：網路優先 (Network First)，若離線則使用 Cache 備援 (Cache Fallback)
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  // 不快取 AI API 請求與遠端 API 通訊
  const url = new URL(event.request.url);
  if (url.pathname.startsWith("/api/") || url.hostname.includes("openai") || url.hostname.includes("openrouter")) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 如果回應有效，複製一份放入快取
        if (response && response.status === 200 && response.type === "basic") {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // 網路斷線時，由 快取 (Cache) 提供
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // 導向根目錄 App Shell
          return caches.match("/");
        });
      })
  );
});
