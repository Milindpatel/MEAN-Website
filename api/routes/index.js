const express = require('express');
const hotels = require('../controllers/hotels.controllers');
const reviews = require('../controllers/reviews.controllers');
const usersController = require('../controllers/users.controllers');
const requireAuth = require('../middleware/auth');

module.exports = (config) => {
  const router = express.Router();
  const auth = requireAuth(config.jwtSecret);
  const users = usersController(config);

  router.route('/hotels').get(hotels.hotelsGetAll).post(auth, hotels.hotelsAddOne);
  router
    .route('/hotels/:hotelId')
    .get(hotels.hotelsGetOne)
    .put(auth, hotels.hotelsUpdateOne)
    .delete(auth, hotels.hotelsDeleteOne);

  router.route('/hotels/:hotelId/reviews').get(reviews.reviewsGetAll).post(auth, reviews.reviewsAddOne);
  router
    .route('/hotels/:hotelId/reviews/:reviewId')
    .get(reviews.reviewsGetOne)
    .put(auth, reviews.reviewsUpdateOne)
    .delete(auth, reviews.reviewsDeleteOne);

  router.post('/users/register', users.register);
  router.post('/users/login', users.login);

  return router;
};
