const dotenv = require('dotenv');

dotenv.config();

function required(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT || 3000),
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:5173',

  MONGO_URI: required('MONGO_URI'),

  JWT_SECRET: required('JWT_SECRET'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  REDIS_URL: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  REDIS_TTL_SECONDS: Number(process.env.REDIS_TTL_SECONDS || 120),
};

module.exports = { env };
