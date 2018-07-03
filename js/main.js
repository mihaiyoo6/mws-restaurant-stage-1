let restaurants,
  neighborhoods,
  cuisines
var map
var markers = []

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  fetchNeighborhoods();
  fetchCuisines();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  const mapContainer = document.getElementById('map');
  // let loc = {
  //   lat: 40.722216,
  //   lng: -73.987501
  // };
  // self.map = new google.maps.Map(document.getElementById('map'), {
  //   zoom: 12,
  //   center: loc,
  //   scrollwheel: false
  // });
  mapContainer.addEventListener('click', showMap)
  updateRestaurants();
}

function showMap(e) {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(e.target, {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  addMarkersToMap();
  e.target.removeEventListener(e.type, showMap);
}

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  lazyloadImages();
}

function lazyloadImages() {
  inView('.restaurant-img').on('enter', image => image.srcset = image.getAttribute('data-src-set'));
}
/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');
  li.className = 'favorite';
  const image = document.createElement('img');
  image.alt = `Image of ${restaurant.name} Restaurant`;
  image.title = restaurant.name;
  image.className = 'restaurant-img';
  const urlX1 = DBHelper.imageUrlForRestaurant(restaurant, '1x', 320);
  const urlX2 = DBHelper.imageUrlForRestaurant(restaurant, '2x', 640);
  image.srcset = 'icons/1px.png';
  image.setAttribute('data-src-set', `${urlX1} 1x, ${urlX2} 2x`);
  image.src = urlX1;
  li.append(image);
  const textHolder = document.createElement('div');
  textHolder.classList.add('restaurant-text');

  const name = document.createElement('h2');
  name.innerHTML = restaurant.name;
  textHolder.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  textHolder.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  textHolder.append(address);
  const star = document.createElement('span');
  const favoriteFlag = typeof restaurant.is_favorite === 'string' ? restaurant.is_favorite === 'true' : restaurant.is_favorite;
  star.innerHTML = favoriteFlag ? '★' : '☆';
  star.setAttribute('is_favorite', restaurant.is_favorite);
  star.setAttribute('aria-label', `Add restaurant ${restaurant.name} to your favorites`);
  star.setAttribute('role', 'button');
  star.setAttribute('id', restaurant.id);
  star.onclick = handleFavorite;
  textHolder.append(star);
  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  textHolder.append(more)
  li.append(textHolder);

  return li
}

/**
 * Handle marking restaurant as favorite
 */
handleFavorite = ({ target }) => {
  const is_favorite = target.getAttribute('is_favorite') === 'true';
  const id = target.getAttribute('id');

  console.log('is_favorite from', id, is_favorite, 'to', !is_favorite);
  const callback = (err, data) => {
    if (!err) {
      target.setAttribute('is_favorite', !is_favorite);
      target.innerHTML = !is_favorite ? '★' : '☆';
    } else {
      alert('Something when wrong! we are working on it.');
    }

  }
  DBHelper.handleFavorite(id, !is_favorite, callback);
}

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
}
