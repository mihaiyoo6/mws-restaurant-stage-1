
const dbPromise = idb.open('udacity-restaurant', 3, upgradeDB => {
  switch (upgradeDB.oldVersion) {
    case 0:
      upgradeDB.createObjectStore('restaurants', { keyPath: 'id' });
    case 1:
      const reviewsStore = upgradeDB.createObjectStore('reviews', { keyPath: 'id' });
      reviewsStore.createIndex('restaurant_id', 'restaurant_id');
    case 2:
      upgradeDB.createObjectStore('toSync', {
        keyPath: 'id',
        autoIncrement: true
      });
  }
});

window.addEventListener('online', function getFromCache() {
  return dbPromise.then(db => {
    const tx = db.transaction('toSync', 'readwrite');
    tx
      .objectStore('toSync')
      .openCursor()
      .then(function cursorIterate(cursor) {
        if (!cursor) {
          return;
        }
        const { url, method, payload } = cursor.value;
        console.log('form SW', { url, method, payload });
        // delete payload.updatedAt;
        fetch(url, { method, body: JSON.stringify(payload) })
          .then(r => {
            console.log('r', r);
            if (r.ok) {
              const deltx = db.transaction('toSync', 'readwrite');
              deltx
                .objectStore('toSync')
                .openCursor()
                .then(cursor => {
                  cursor
                    .delete()
                    .then(getFromCache)
                })
            }
          })
        // return fetch(url, method, payload)
        //   .then(r => {
        //     if (r.ok) {
        //       cursor.delete();
        //       return cursor.continue().then(cursorIterate);
        //     }
        //   })
        //   .catch(err => {
        //     console.log(err);
        //     return cursor.continue().then(cursorIterate)
        //   })
      })
  });
});
/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    fetch(DBHelper.DATABASE_URL,
      { method: 'GET' }
    )
      .then(r => {
        if (!r.ok) {
          throw Error(r.statusText);
        }
        return r.json()
      })
      .then(result => callback(null, result))
      .catch(err => callback(err, null));
    // let xhr = new XMLHttpRequest();
    // xhr.open('GET', DBHelper.DATABASE_URL);
    // xhr.onload = () => {
    //   if (xhr.status === 200) { // Got a success response from server!
    //     const json = JSON.parse(xhr.responseText);
    //     const restaurants = json.restaurants;
    //     callback(null, restaurants);
    //   } else { // Oops!. Got an error from server.
    //     const error = (`Request failed. Returned status of ${xhr.status}`);
    //     callback(error, null);
    //   }
    // };
    // xhr.send();
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    Promise.all([
      fetch(`${this.DATABASE_URL}/${id}`),
      fetch(`${this.DATABASE_URL.replace('restaurants', 'reviews')}/?restaurant_id=${id}`)
    ])
      .then(r =>
        Promise.all(r.map(response => {
          if (!response.ok) {
            throw Error(r.statusText);
          }
          return response.json();
        })
        ))
      .then(([restaurant, reviews]) => {
        callback(null, { ...restaurant, reviews });
      })
      .catch(err => console.error(err));
    // DBHelper.fetchRestaurants((error, restaurants) => {
    //   if (error) {
    //     callback(error, null);
    //   } else {
    //     const restaurant = restaurants.find(r => r.id == id);
    //     if (restaurant) { // Got the restaurant
    //       callback(null, restaurant);
    //     } else { // Restaurant does not exist in the database
    //       callback('Restaurant does not exist', null);
    //     }
    //   }
    // });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant, dpr = '1x', sufix = '', extension = 'jpg') {
    const dynamicUrl = sufix ? `-${sufix}_${dpr}.${extension}` : `-${dpr}.${extension}`;
    return (`/img/${restaurant.photograph || restaurant.id}${dynamicUrl}`);
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP
    }
    );
    return marker;
  }

  /**
   * update favorite api
   */
  static handleFavorite(restaurant_id, isFavorite, callback) {
    this.updateRestaurantsIdb(restaurant_id, isFavorite);
    const url = `${this.DATABASE_URL}/${restaurant_id}/?is_favorite=${isFavorite}`;
    const method = 'PUT';

    if (navigator.onLine) {
      return fetch(url, { method })
        .then(r => {
          if (r.ok) {
            return r;
          }
        })
        .then(r => r.json())
        .then(data => callback(null, data))
        .catch(err => callback(err, null))
    } else {
      this.addToCacheQue({ url, method, payload: { isFavorite }, callback });
    }

  }

  static updateRestaurantsIdb(restaurant_id, is_favorite) {
    console.log('isFavorite update', restaurant_id, is_favorite);
    console.log('type of', typeof is_favorite);
    // const dbPromise = idb.open('udacity-restaurant');
    //update all restaurant data
    dbPromise
      .then(db => {
        const tx = db.transaction('restaurants', 'readwrite');
        const value = tx
          .objectStore('restaurants')
          .get('-1')
          .then(rData => {
            if (!rData) {
              console.log('data is not cached');
              return;
            }
            const data = rData.data;
            const updatedData = data.map(restaurant => {
              if (restaurant.id !== parseInt(restaurant_id)) {
                return restaurant;
              }
              console.log('assign', restaurant, is_favorite);
              return Object.assign(restaurant, { is_favorite });
            });
            dbPromise.then(db1 => {
              const tx1 = db1.transaction('restaurants', 'readwrite');
              tx1
                .objectStore('restaurants')
                .put({ id: '-1', data: updatedData });
              return tx1.complete;
            })
          })
      })
    //Update id restaurant data 
    dbPromise
      .then(db => {
        const tx = db.transaction('restaurants', 'readwrite');
        const value = tx
          .objectStore('restaurants')
          .get(restaurant_id)
          .then(rData => {
            if (!rData || !rData.data) {
              console.log(`data for restaurant_id=${restaurant_id} is not cached`);
              return;
            }
            const data = rData.data;
            dbPromise.then(db1 => {
              const tx1 = db1.transaction('restaurants', 'readwrite');
              tx1
                .objectStore('restaurants')
                .put({ id: restaurant_id, data: Object.assign(data, { is_favorite }) });
              return tx1.complete;
            })
          })
      });
  }

  static reviewAdd(body, callback) {
    const url = `${this.DATABASE_URL.replace('restaurants', 'reviews')}`;
    const method = 'POST';
    const payload = {};
    for (const [key, value] of body.entries()) {
      payload[key] = value;
    }
    this.uprateReviesIdb(payload);
    //body.delete('updatedAt');
    if (navigator.onLine) {
      return fetch(url, {
        method,
        body
      })
        .then(r => {
          if (r.ok) {
            return r;
          }
        })
        .then(r => r.json())
        .then(data => callback(null, data))
        .catch(err => callback(err, null));
    } else {
      this.addToCacheQue({ url, method, payload, callback });
    }

  }

  static uprateReviesIdb(data) {
    console.log('data', data);
    Object.assign(data, { updatedAt: Date.now() });
    dbPromise
      .then(db => {
        const tx = db.transaction('reviews', 'readwrite');
        const store = tx.objectStore('reviews');
        store.put({ id: Date.now(), 'restaurant_id': parseInt(data['restaurant_id']), data })
      })
  }

  static addToCacheQue({ url, method, payload, callback }) {
    dbPromise
      .then(db => {
        const tx = db.transaction('toSync', 'readwrite');
        tx
          .objectStore('toSync')
          .add({ url, method, payload });
        callback(null, payload);
        return tx.complete;
      });
  }
}
