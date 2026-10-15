// Cache-First Service Worker for Map Tiles & Vector Assets (Browser Cache + CDN)
const TILE_CACHE_NAME = 'aurora-map-tiles-v1';
const TILE_HOSTS_AND_PATTERNS = [
  'tiles.openfreemap.org',
  'api.maptiler.com',
  '/planet/',
  '/styles/',
  '.pbf',
  '.mvt',
  '/fonts/',
  '/sprites/'
];

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== TILE_CACHE_NAME && key.startsWith('aurora-map-tiles-')) {
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  const isMapTile = TILE_HOSTS_AND_PATTERNS.some((pattern) => url.includes(pattern));

  if (!isMapTile || event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.open(TILE_CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(event.request);
      if (cached) {
        return cached;
      }

      try {
        const response = await fetch(event.request);
        if (response && (response.status === 200 || response.type === 'opaque')) {
          // Store copy in browser CacheStorage
          cache.put(event.request, response.clone()).catch(() => {});
        }
        return response;
      } catch (err) {
        if (cached) return cached;
        throw err;
      }
    })
  );
});
