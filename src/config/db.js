const mongoose = require('mongoose');
const { logger } = require('../utils/logger');

async function connectDB(mongoUri) {
  mongoose.set('strictQuery', true);
  await mongoose.connect(mongoUri);
  logger.info('MongoDB connected');
}

module.exports = { connectDB };
