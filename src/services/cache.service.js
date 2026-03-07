const { env } = require('../config/env');
const { getRedis } = require('../config/redis');
const { logger } = require('../utils/logger');

async function getJSON(key) {
  try {
    const redis = getRedis();
    const raw = await redis.get(key);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    logger.warn({ err, key }, 'Redis get failed (fallback to DB)');
    return null;
  }
}

async function setJSON(key, value, ttlSeconds = env.REDIS_TTL_SECONDS) {
  try {
    const redis = getRedis();
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch (err) {
    logger.warn({ err, key }, 'Redis set failed (ignored)');
  }
}

async function del(key) {
  try {
    const redis = getRedis();
    await redis.del(key);
  } catch (err) {
    logger.warn({ err, key }, 'Redis del failed (ignored)');
  }
}

module.exports = { getJSON, setJSON, del };