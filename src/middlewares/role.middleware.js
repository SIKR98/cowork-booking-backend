const { AppError } = require('../utils/AppError');

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return next(new AppError('Unauthorized', 401, 'UNAUTHORIZED'));
    if (req.user.role !== role) return next(new AppError('Forbidden', 403, 'FORBIDDEN'));
    return next();
  };
}

module.exports = { requireRole };
