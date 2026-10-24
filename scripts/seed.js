// Loads api/data/hotel-data.json into MongoDB (replacing existing hotels).
const mongoose = require('mongoose');
const config = require('../api/config');
const Hotel = require('../api/data/hotels.model');
const hotels = require('../api/data/hotel-data.json');

(async () => {
  await mongoose.connect(config.mongoUri);
  await Hotel.deleteMany({});
  await Hotel.insertMany(hotels);
  console.log(`Seeded ${hotels.length} hotels`);
  await mongoose.disconnect();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
