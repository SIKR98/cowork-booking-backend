const mongoose = require('mongoose');
const { AppError } = require('../utils/AppError');

function validateObjectId(paramName = 'id') {
  return (req, res, next) => {
    const value = req.params[paramName];

    if (!mongoose.Types.ObjectId.isValid(value)) {
      return next(new AppError(`Invalid ${paramName}`, 400, 'VALIDATION_ERROR'));
    }

    next();
  };
}

module.exports = { validateObjectId };