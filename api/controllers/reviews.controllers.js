const Hotel = require('../data/hotels.model');

async function findHotel(req, res) {
  const hotel = await Hotel.findById(req.params.hotelId).select('reviews');
  if (!hotel) res.status(404).json({ message: 'Hotel ID not found' });
  return hotel;
}

function findOwnReview(hotel, req, res) {
  const review = hotel.reviews.id(req.params.reviewId);
  if (!review) {
    res.status(404).json({ message: 'Review ID not found' });
    return null;
  }
  if (review.username !== req.user) {
    res.status(403).json({ message: 'You can only change your own reviews' });
    return null;
  }
  return review;
}

exports.reviewsGetAll = async (req, res) => {
  const hotel = await findHotel(req, res);
  if (hotel) res.json(hotel.reviews);
};

exports.reviewsGetOne = async (req, res) => {
  const hotel = await findHotel(req, res);
  if (!hotel) return;
  const review = hotel.reviews.id(req.params.reviewId);
  if (!review) return res.status(404).json({ message: 'Review ID not found' });
  res.json(review);
};

exports.reviewsAddOne = async (req, res) => {
  const hotel = await findHotel(req, res);
  if (!hotel) return;
  hotel.reviews.push({
    name: req.user,
    username: req.user,
    rating: Number.parseInt(req.body?.rating, 10),
    review: req.body?.review,
  });
  await hotel.save();
  res.status(201).json(hotel.reviews[hotel.reviews.length - 1]);
};

exports.reviewsUpdateOne = async (req, res) => {
  const hotel = await findHotel(req, res);
  if (!hotel) return;
  const review = findOwnReview(hotel, req, res);
  if (!review) return;
  review.rating = Number.parseInt(req.body?.rating, 10);
  review.review = req.body?.review;
  await hotel.save();
  res.status(204).end();
};

exports.reviewsDeleteOne = async (req, res) => {
  const hotel = await findHotel(req, res);
  if (!hotel) return;
  const review = findOwnReview(hotel, req, res);
  if (!review) return;
  review.deleteOne();
  await hotel.save();
  res.status(204).end();
};
