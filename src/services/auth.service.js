const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { env } = require('../config/env');
const { AppError } = require('../utils/AppError');

async function register({ username, password }) {
  const existing = await User.findOne({ username });
  if (existing) throw new AppError('Username already exists', 409, 'USERNAME_TAKEN');

  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ username, password: hash, role: 'User' });

  return { id: user._id.toString(), username: user.username, role: user.role };
}

async function login({ username, password }) {
  const user = await User.findOne({ username });
  if (!user) throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');

  const token = jwt.sign(
    { sub: user._id.toString(), role: user.role, username: user.username },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );

  return { token, user: { id: user._id.toString(), username: user.username, role: user.role } };
}

module.exports = { register, login };
