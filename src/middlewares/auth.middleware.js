const jwt = require('jsonwebtoken');
const { env } = require('../config/env');
const { AppError } = require('../utils/AppError');

function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const [type, token] = header.split(' ');

  if (type !== 'Bearer' || !token) {
    return next(new AppError('Missing or invalid Authorization header', 401, 'UNAUTHORIZED'));
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = decoded; // { sub, role, username }
    return next();
  } catch (e) {
    return next(new AppError('Invalid or expired token', 401, 'UNAUTHORIZED'));
  }
}

module.exports = { auth };
