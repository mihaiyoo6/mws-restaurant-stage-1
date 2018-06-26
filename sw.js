const CACHE_NAME = 'restaurant-review-';
const CACHE_VERSION = 'v1';
const DB_NAME = 'restaurants'
importScripts('./dist/idb.min.js');


const dbPromise = idb.open("udacity-restaurant", 1, upgradeDB => {
  switch (upgradeDB.oldVersion) {
    case 0:
      upgradeDB.createObjectStore(DB_NAME, { keyPath: "id" });
  }
});

self.addEventListener('fetch', event => {
  console.log('event', event.request.url);

  const checkURL = new URL(event.request.url);
  if (checkURL.port === "1337") {
    console.log('check for IDB');
    event.respondWith(
      dbPromise
      .then(db=>db
        .transaction(DB_NAME)
        .objectStore(DB_NAME)
        .get(DB_NAME)
      )
      .then(data => {
        return (
          (data && data.data) ||
          fetch(event.request)
            .then(fetchResponse => fetchResponse.json())
            .then(json => {
              return dbPromise.then(db => {
                const tx = db.transaction(DB_NAME, "readwrite");
                tx.objectStore(DB_NAME).put({
                  id: DB_NAME,
                  data: json
                });
                return json;
              });
            })
        );
      })
      .then(finalResponse => {
        return new Response(JSON.stringify(finalResponse));
      })
      .catch(error => {
        return new Response("Error fetching data", { status: 500 });
      })
    )
  }else{
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
  }

});

self.addEventListener('install', event => {
  const urlToCache = [
    '/',
    '/dist/main.min.js',
    '/dist/dbhelper.min.js',
    '/dist/restaurant_info.min.js',
    '/dist/idb.min.js',
    '/dist/styles.min.css'
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