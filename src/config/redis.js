const Redis = require('ioredis');
const { env } = require('./env');
const { logger } = require('../utils/logger');

let redis;

function getRedis() {
  if (!redis) {
    const useTLS = env.REDIS_URL.startsWith('rediss://');

    redis = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 2,
      enableReadyCheck: true,
      ...(useTLS ? { tls: {} } : {}),
    });

    redis.on('connect', () => logger.info('Redis connecting...'));
    redis.on('ready', () => logger.info('Redis ready'));
    redis.on('error', (err) => logger.warn({ err }, 'Redis error'));
  }
  return redis;
}

module.exports = { getRedis };