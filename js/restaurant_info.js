let restaurant;
var map;

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  const addReviewForm = document.getElementById('review-add-form');
  addReviewForm.addEventListener('submit', reviewAdd);
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const star = document.getElementById('restaurant-favorite');
  star.innerHTML = restaurant.is_favorite === 'true' ? '★': '☆';
  star.setAttribute('is_favorite', restaurant.is_favorite);
  star.setAttribute('id', restaurant.id);
  star.onclick = handleFavorite;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img';
  image.alt = `Image of ${restaurant.name} Restaurant`;
  image.title = restaurant.name;
  const urlX1 = DBHelper.imageUrlForRestaurant(restaurant, '2x', 640);
  const urlX2 = DBHelper.imageUrlForRestaurant(restaurant, 'large_2x', 1280);
  image.srcset = `${urlX1} 1x, ${urlX2} 2x`
  image.src = urlX1;

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h3');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const header = document.createElement('div');
  header.classList.add('review-header');
  const name = document.createElement('span');
  name.classList.add('review-header-name');
  name.innerHTML = review.name;
  header.appendChild(name);

  const date = document.createElement('span');
  date.innerHTML = new Date(review.updatedAt).toDateString();
  header.appendChild(date);

  li.appendChild(header);
  const rating = document.createElement('span');
  rating.classList.add('review-rating');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant = self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

/**
 * Handle marking restaurant as favorite
 */
handleFavorite=({target})=> {
  const is_favorite = target.getAttribute('is_favorite') === 'true';
  const id = target.getAttribute('id');
  
  console.log('is_favorite from', id, is_favorite, 'to', !is_favorite);
  const callback = (err, data)=>{
    if(!err){
      target.setAttribute('is_favorite', !is_favorite);
      target.innerHTML = !is_favorite? '★': '☆';
    }else{
      alert('Something when wrong! we are working on it.');
    }

  }
  DBHelper.handleFavorite(id, !is_favorite, callback);
}

reviewAdd = (e)=>{
  e.preventDefault();
  const formEl = e.target;
  const formData = new FormData(formEl);
  formData.append('restaurant_id', getParameterByName('id'));
  const data = {
    restaurant_id: getParameterByName('id'),
    isValid: true
  };
  for (var [key, value] of formData.entries()) {
    if(value.length === 0) {
      const msg = formEl.querySelector('#msg');
      msg.style.display= 'block';
      Object.assign(data, {isValid:false});
    }else{
      Object.assign(data, {[key]:value});
    }
 }
 if(data.isValid){
   DBHelper.reviewAdd(formData,(err,response)=>{
     console.log('err', err, 'data', response);
     if(err){
      alert('Something when wrong! we are working on it.');
      return;
     }
     const reviewsContainer  =document.getElementById('reviews-list');
     reviewsContainer.appendChild(createReviewHTML(response));
     formEl.reset();
   });
 }

}