const jwt = require('jsonwebtoken');

/** Requires "Authorization: Bearer <token>" and sets req.user to the username. */
module.exports = (secret) => (req, res, next) => {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  try {
    req.user = jwt.verify(token, secret, { algorithms: ['HS256'] }).username;
    return next();
  } catch {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};
