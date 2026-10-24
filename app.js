const path = require('node:path');
const express = require('express');
const mongoose = require('mongoose');
const routes = require('./api/routes');

/** Builds the Express app: JSON API under /api and the Angular app from public/. */
function createApp(config) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '100kb' }));

  app.use('/api', routes(config));
  app.use('/api', (req, res) => res.status(404).json({ message: 'Not found' }));

  const publicDir = path.join(__dirname, 'public');
  app.use(express.static(publicDir));
  // Client-side routes (e.g. /hotels/123) fall back to the Angular app.
  app.get('/{*path}', (req, res, next) =>
    res.sendFile(path.join(publicDir, 'index.html'), (err) => err && next()),
  );

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err instanceof mongoose.Error.CastError) return res.status(404).json({ message: 'Not found' });
    if (err instanceof mongoose.Error.ValidationError) return res.status(400).json({ message: err.message });
    if (err.type === 'entity.parse.failed') return res.status(400).json({ message: 'Invalid JSON' });
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  });

  return app;
}

module.exports = { createApp };
