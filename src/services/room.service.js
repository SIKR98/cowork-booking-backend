const Room = require('../models/Room');
const Booking = require('../models/Booking');
const { AppError } = require('../utils/AppError');
const { getJSON, setJSON, del } = require('./cache.service');
const { logger } = require('../utils/logger');

const ROOMS_CACHE_KEY = 'rooms:all';

function isDuplicateKeyError(err) {
  return err && err.code === 11000;
}

async function getAllRooms() {
  const cached = await getJSON(ROOMS_CACHE_KEY);
  if (cached) {
    logger.info({ key: ROOMS_CACHE_KEY, count: cached.length }, 'Rooms served from Redis cache');
    return cached;
  }

  const rooms = await Room.find().sort({ createdAt: -1 });
  await setJSON(ROOMS_CACHE_KEY, rooms);
  logger.info({ key: ROOMS_CACHE_KEY, count: rooms.length }, 'Rooms cached in Redis');

  return rooms;
}

async function createRoom({ name, capacity, type }) {
  if (!name || capacity === undefined || !type) {
    throw new AppError('name, capacity and type are required', 400, 'VALIDATION_ERROR');
  }

  try {
    const room = await Room.create({ name, capacity, type });

    await del(ROOMS_CACHE_KEY);

    return room;
  } catch (err) {
    if (isDuplicateKeyError(err)) {
      throw new AppError('Room name already exists', 409, 'ROOM_ALREADY_EXISTS');
    }
    throw err;
  }
}

async function updateRoom(roomId, updates) {
  const allowed = ['name', 'capacity', 'type'];
  const payload = {};

  for (const key of allowed) {
    if (updates[key] !== undefined) payload[key] = updates[key];
  }

  try {
    const room = await Room.findByIdAndUpdate(roomId, payload, {
      new: true,
      runValidators: true
    });

    if (!room) {
      throw new AppError('Room not found', 404, 'NOT_FOUND');
    }

    await del(ROOMS_CACHE_KEY);
    return room;
  } catch (err) {
    if (isDuplicateKeyError(err)) {
      throw new AppError('Room name already exists', 409, 'ROOM_ALREADY_EXISTS');
    }
    throw err;
  }
}

async function deleteRoom(roomId) {
  const room = await Room.findByIdAndDelete(roomId);

  if (!room) {
    throw new AppError('Room not found', 404, 'NOT_FOUND');
  }

  const deletedBookings = await Booking.deleteMany({ roomId });

  logger.info(
    { roomId, deletedBookingsCount: deletedBookings.deletedCount },
    'Room deleted with cascading booking delete'
  );

  await del(ROOMS_CACHE_KEY);
  return room;
}

module.exports = {
  getAllRooms,
  createRoom,
  updateRoom,
  deleteRoom
};