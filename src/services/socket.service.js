/**
 * Socket.io glue.
 * We keep this in a module so controllers/services can emit events without circular deps.
 */
let io = null;

function initSocket(server, { corsOrigin }) {
  const { Server } = require('socket.io');
  const jwt = require('jsonwebtoken');
  const { env } = require('../config/env');
  const { logger } = require('../utils/logger');

  io = new Server(server, {
    cors: { origin: corsOrigin, credentials: true },
  });

  // Socket auth
  io.use((socket, next) => {
    try {
      const token = socket.handshake?.auth?.token;
      if (!token) return next(new Error('Missing token'));

      const payload = jwt.verify(token, env.JWT_SECRET);
      socket.user = payload;

      return next();
    } catch (err) {
      return next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user.sub;
    const role = socket.user.role;

    socket.join(`user:${userId}`);

    if (role === 'Admin') {
      socket.join('role:Admin');
    }

    logger.info({ userId, role }, 'Socket connected');

    socket.emit('connected', { ok: true, userId, role });

    socket.on('disconnect', () => {
      logger.info({ userId, role }, 'Socket disconnected');
    });
  });

  return io;
}

function getIO() {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}

/**
 * Emit event to a specific user
 */
function emitToUser(userId, event, payload) {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, payload);
}

/**
 * Emit event to all admins
 */
function emitToAdmins(event, payload) {
  if (!io) return;
  io.to('role:Admin').emit(event, payload);
}

module.exports = {
  initSocket,
  getIO,
  emitToUser,
  emitToAdmins
};