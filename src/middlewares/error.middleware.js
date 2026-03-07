const { logger } = require('../utils/logger');

function notFound(req, res, next) { // eslint-disable-line
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found',
    },
  });
}

function errorHandler(err, req, res, next) { // eslint-disable-line
  const status = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';

  const isProduction = process.env.NODE_ENV === 'production';

  const payload = {
    error: {
      code,
      message:
        status === 500 && isProduction
          ? 'Internal server error'
          : err.message || 'Unexpected error',
    },
  };

  // Logga alltid full error i servern
  logger.error({ err, code, status }, 'Request failed');

  // Visa stack bara i development
  if (!isProduction && err.stack) {
    payload.error.stack = err.stack;
  }

  res.status(status).json(payload);
}

module.exports = { notFound, errorHandler };