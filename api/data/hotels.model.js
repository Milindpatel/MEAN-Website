const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  // Username of the author; only they can edit or delete the review.
  username: { type: String },
  rating: { type: Number, min: 1, max: 5, required: true },
  review: { type: String, required: true, trim: true, maxlength: 2000 },
  createdOn: { type: Date, default: Date.now },
});

const roomSchema = new mongoose.Schema({
  type: String,
  number: Number,
  description: String,
  photos: [String],
  price: Number,
});

const hotelSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  stars: { type: Number, min: 0, max: 5, default: 0 },
  services: [String],
  description: String,
  photos: [String],
  currency: String,
  reviews: [reviewSchema],
  rooms: [roomSchema],
  location: {
    address: String,
    // GeoJSON order: [longitude, latitude]
    coordinates: { type: [Number], index: '2dsphere' },
  },
});

module.exports = mongoose.models.Hotel || mongoose.model('Hotel', hotelSchema, 'hotels');
