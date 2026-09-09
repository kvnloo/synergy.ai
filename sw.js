const VERSION = "2026-09-09-c2";
const CACHE = `synergy-${VERSION}`;
const SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./board.js",
  "./content.js",
  "./companion-bot.js",
  "./recall.js",
  "./trust.js",
  "./favicon.svg",
  "./manifest.webmanifest"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith("synergy-") && key !== CACHE)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

function cacheablePath(pathname) {
  if (pathname.endsWith("/") || pathname.endsWith("/index.html")) return true;
  if (pathname.includes("/data/")) return true;
  if (pathname.includes("/icons/")) return true;
  return SHELL.some((entry) => {
    const bare = entry.replace(/^\.\//, "/");
    return pathname.endsWith(bare) || pathname.endsWith(entry.slice(1));
  });
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.includes("/v1/")) return;

  event.respondWith(
    (async () => {
      try {
        const response = await fetch(request);
        if (response && response.ok && cacheablePath(url.pathname)) {
          const copy = response.clone();
          const cache = await caches.open(CACHE);
          cache.put(request, copy);
        }
        return response;
      } catch {
        const cached = await caches.match(request);
        if (cached) return cached;
        if (request.mode === "navigate") {
          const shell = await caches.match("./index.html") || await caches.match("./");
          if (shell) return shell;
        }
        throw new Error("Offline and uncached");
      }
    })()
  );
});
