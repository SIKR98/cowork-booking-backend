const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { env } = require('../config/env');
const { logger } = require('../utils/logger');

function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN,
      credentials: true,
    },
  });

  // Auth middleware för sockets
  io.use((socket, next) => {
    try {
      const token = socket.handshake?.auth?.token;
      if (!token) return next(new Error('Missing token'));

      const payload = jwt.verify(token, env.JWT_SECRET);
      socket.user = payload; // { sub, role, username, ... }
      return next();
    } catch (err) {
      return next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user.sub;
    const role = socket.user.role;

    socket.join(`user:${userId}`);
    if (role === 'Admin') socket.join('role:Admin');

    logger.info({ userId, role }, 'Socket connected');

    socket.on('disconnect', () => {
      logger.info({ userId, role }, 'Socket disconnected');
    });
  });

  return io;
}

module.exports = { initSocket };