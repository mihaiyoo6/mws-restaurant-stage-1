const CACHE_NAME = 'restaurant-review-';
const CACHE_VERSION = 'v1';
const DB_NAME = 'restaurants'
importScripts('./dist/idb.min.js');


const dbPromise = idb.open('udacity-restaurant', 2, upgradeDB => {
  switch (upgradeDB.oldVersion) {
    case 0:
      upgradeDB.createObjectStore(DB_NAME, { keyPath: 'id' });
    case 1:
      const reviewsStore = upgradeDB.createObjectStore('reviews', { keyPath: 'id' });
      reviewsStore.createIndex('restaurant_id', 'restaurant_id');
  }
});

self.addEventListener('fetch', event => {
  // console.log('event', event.request.url);

  const checkURL = new URL(event.request.url);
  if (checkURL.port === '1337') {
    console.log('check for IDB');
    console.log('event', event.request.method === 'GET');
    const parts = checkURL
      .pathname
      .split('/');
    let id = checkURL
      .searchParams
      .get('restaurant_id') - 0;
    if (!id) {
      if (checkURL.pathname.indexOf('restaurants')) {
        id = parts[parts.length - 1] === 'restaurants'
          ? '-1'
          : parts[parts.length - 1];
      } else {
        id = checkURL
          .searchParams
          .get('restaurant_id');
      }
    }
    console.log('id', id);
    getFromAPI(event, id);
  } else {
    checkCache(event);
  }
});
getFromAPI = (event, id) => {
  if (event.request.method !== 'GET') {
    return fetch(event.request).then(r => r.json());
  }
  if (event.request.url.includes('reviews')) {
    getReviews(event, id);
  } else {
    getRestaurant(event, id);
  }
}

getReviews = (event, id) => {
  event.respondWith(
    dbPromise.then(db =>
      db
        .transaction('reviews')
        .objectStore('reviews')
        .index('restaurant_id')
        .getAll(id)
    )
      .then(data =>
        (data.length && data)
        || fetch(event.request)
          .then(r => r.json())
          .then(reviewsData =>
            dbPromise.then(idb => {
              const itx = idb.transaction('reviews', 'readwrite');
              const store = itx.objectStore('reviews');
              reviewsData.forEach(review => store.put({ id: review.id, 'restaurant_id': review['restaurant_id'], data: review }))
              return reviewsData;
            })
          )
      ).then(finalResponse => {
        if (finalResponse[0].data) {
          const mapResponse = finalResponse.map(review => review.data);
          return new Response(JSON.stringify(mapResponse));
        }
        return new Response(JSON.stringify(finalResponse));
      })
      .catch(err => new Response('Error getting reviews', { status: 500 }))
  )
}

getRestaurant = (event, id) => {
  event.respondWith(
    dbPromise
      .then(db => db
        .transaction(DB_NAME)
        .objectStore(DB_NAME)
        .get(id)
      )
      .then(data => {
        console.log('data', data);
        return (
          (data && data.data) ||
          fetch(event.request)
            .then(fetchResponse => fetchResponse.json())
            .then(json => {
              return dbPromise.then(db => {
                const tx = db.transaction('restaurants', 'readwrite');
                const store = tx.objectStore('restaurants');
                store.put({ id: id, data: json });
                return json;
              });
            })
        );
      })
      .then(finalResponse => {
        return new Response(JSON.stringify(finalResponse));
      })
      .catch(error => {
        return new Response('Error fetching restaurants', { status: 500 });
      })
  )
}

checkCache = event => {
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