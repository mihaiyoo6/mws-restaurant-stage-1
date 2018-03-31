const CACHE_NAME = 'restaurant-review-';
const CACHE_VERSION = 'v1';
self.addEventListener('fetch', event => {
  console.log('event', event.request.url);
  event.respondWith(
    caches.open(`${CACHE_NAME}${CACHE_VERSION}`).then(function (cache) {
      return cache.match(event.request).then(function (response) {
        return response || fetch(event.request).then(function (response) {
          cache.put(event.request, response.clone());
          return response;
        });
      });
    })
  )
});

self.addEventListener('install', event => {
  const urlToCache = [
    '/',
    '/js/main.js',
    'js/dbhelper.js',
    '/js/restaurant_info.js',
    '/data/restaurants.json',
    '/css/styles.css'
  ]
  event.waitUntil(
    caches.open(`${CACHE_NAME}${CACHE_VERSION}`).then(cache => cache.addAll(urlToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames
          .filter(name => name.startsWith(CACHE_NAME) && name !== `${CACHE_NAME}${CACHE_VERSION}`)
          .map(cacheName => cache.delete(cacheName)))
    )
  );
});