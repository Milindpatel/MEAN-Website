const Hotel = require('../data/hotels.model');

const MAX_COUNT = 10;

const splitList = (input) =>
  Array.isArray(input) ? input : typeof input === 'string' && input ? input.split(';').map((s) => s.trim()).filter(Boolean) : [];

function hotelFromBody(body = {}) {
  const hotel = {
    name: body.name,
    description: body.description,
    stars: Number.parseInt(body.stars, 10) || 0,
    services: splitList(body.services),
    photos: splitList(body.photos),
    currency: body.currency,
    location: { address: body.address },
  };
  const lng = Number.parseFloat(body.lng);
  const lat = Number.parseFloat(body.lat);
  if (Number.isFinite(lng) && Number.isFinite(lat)) hotel.location.coordinates = [lng, lat];
  return hotel;
}

exports.hotelsGetAll = async (req, res) => {
  const { lat, lng } = req.query;
  if (lat !== undefined && lng !== undefined) {
    const point = { type: 'Point', coordinates: [Number.parseFloat(lng), Number.parseFloat(lat)] };
    if (point.coordinates.some((n) => !Number.isFinite(n))) {
      return res.status(400).json({ message: 'lat and lng must be numbers' });
    }
    const results = await Hotel.aggregate([
      { $geoNear: { near: point, distanceField: 'distance', maxDistance: 2000, spherical: true } },
      { $limit: 5 },
      { $project: { reviews: 0, rooms: 0 } },
    ]);
    return res.json(results);
  }

  const offset = req.query.offset === undefined ? 0 : Number.parseInt(req.query.offset, 10);
  const count = req.query.count === undefined ? 5 : Number.parseInt(req.query.count, 10);
  if (!Number.isInteger(offset) || !Number.isInteger(count) || offset < 0 || count < 1) {
    return res.status(400).json({ message: 'If supplied in querystring, count and offset should be positive numbers' });
  }
  if (count > MAX_COUNT) {
    return res.status(400).json({ message: `Count limit of ${MAX_COUNT} exceeded` });
  }

  const hotels = await Hotel.find().select('-reviews -rooms').sort({ name: 1 }).skip(offset).limit(count);
  res.json(hotels);
};

exports.hotelsGetOne = async (req, res) => {
  const hotel = await Hotel.findById(req.params.hotelId);
  if (!hotel) return res.status(404).json({ message: 'Hotel ID not found' });
  res.json(hotel);
};

exports.hotelsAddOne = async (req, res) => {
  const hotel = await Hotel.create(hotelFromBody(req.body));
  res.status(201).json(hotel);
};

exports.hotelsUpdateOne = async (req, res) => {
  const hotel = await Hotel.findById(req.params.hotelId).select('-reviews -rooms');
  if (!hotel) return res.status(404).json({ message: 'Hotel ID not found' });
  hotel.set(hotelFromBody(req.body));
  await hotel.save();
  res.status(204).end();
};

exports.hotelsDeleteOne = async (req, res) => {
  const hotel = await Hotel.findByIdAndDelete(req.params.hotelId);
  if (!hotel) return res.status(404).json({ message: 'Hotel ID not found' });
  res.status(204).end();
};
