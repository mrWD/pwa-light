const staticCacheName = 's-app-v2';
const dynamicCacheName = 'd-app-v2';
const assetUrls = [
  'index.html',
  'offline.html',
  '/js/app.js',
  '/css/styles.css',
];

self.addEventListener('install', async event => {
  const cache = await caches.open(staticCacheName);

  await cache.addAll(assetUrls);
});

self.addEventListener('activate', async event => {
  const cachesNames = await caches.keys();
  await Promise.all(
    cachesNames
      .filter(name => name !== staticCacheName && name !== dynamicCacheName)
      .map(name => caches.delete(name))
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;

  const url = new URL(request.url);

  if (url.origin === location.origin) {
    event.respondWith(cacheFirst(request));
  } else {
    event.respondWith(networkFirst(request));
  }
});

async function cacheFirst(req) {
  const cached = await caches.match(req);
  return cached ?? fetch(req);
}

async function networkFirst(req) {
  const cache = await caches.open(dynamicCacheName);

  try {
    const res = await fetch(req);

    await cache.put(req, res.clone());

    return res;
  } catch (err) {
    const cached = await cache.match(req);
    return cached ?? await caches.match('offline.html');
  }
}
