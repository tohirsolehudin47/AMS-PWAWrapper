const cacheName = 'ams-lite-plus-wrapper-v2';
const assets = ['./', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
const shell = new URL('./', self.registration.scope);
const assetUrls = new Set(assets.map(path => new URL(path, shell).href));

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(cacheName);
    await cache.addAll(assets);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    await caches.delete('ams-lite-plus-v1');
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== shell.origin) return;
  const launch = event.request.mode === 'navigate' && [shell.pathname, shell.pathname + 'index.html'].includes(url.pathname);
  if (!launch && !assetUrls.has(url.href)) return;
  event.respondWith(fetch(event.request).catch(async () => {
    const cache = await caches.open(cacheName);
    return await cache.match(launch ? shell.href : url.href) || Response.error();
  }));
});
