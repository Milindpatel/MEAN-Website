const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../data/users.model');

module.exports = ({ jwtSecret, jwtExpiresIn }) => ({
  async register(req, res) {
    const { username, name, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    if (String(password).length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }
    if (await User.exists({ username: String(username).toLowerCase().trim() })) {
      return res.status(409).json({ message: 'That username is taken' });
    }
    const user = await User.create({ username, name, password: await bcrypt.hash(String(password), 12) });
    res.status(201).json(user);
  },

  async login(req, res) {
    const { username, password } = req.body || {};
    const user = username && (await User.findOne({ username: String(username).toLowerCase().trim() }));
    // Same response whether the user is missing or the password is wrong.
    if (!user || !password || !(await bcrypt.compare(String(password), user.password))) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    const token = jwt.sign({ username: user.username }, jwtSecret, { expiresIn: jwtExpiresIn, algorithm: 'HS256' });
    res.json({ success: true, token });
  },
});
