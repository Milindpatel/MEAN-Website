const mongoose = require('mongoose');
const config = require('./api/config');
const { createApp } = require('./app');

async function main() {
  await mongoose.connect(config.mongoUri);
  console.log(`Connected to ${config.mongoUri.replace(/\/\/[^@]*@/, '//***@')}`);

  const server = createApp(config).listen(config.port, () => console.log(`Listening on http://localhost:${config.port}`));

  const shutdown = async (signal) => {
    console.log(`${signal} received, shutting down`);
    server.close();
    await mongoose.disconnect();
    process.exit(0);
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
