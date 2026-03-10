const Room = require('../models/Room');
const Booking = require('../models/Booking');
const User = require('../models/User');
const { AppError } = require('../utils/AppError');
const { getJSON, setJSON, del } = require('./cache.service');
const { logger } = require('../utils/logger');
const { createNotification } = require('./notification.service');

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

    const users = await User.find().select('_id');

    await Promise.all(
      users.map((u) =>
        createNotification({
          recipientUserId: u._id,
          type: 'room_created',
          title: 'Room created',
          message: `A new room "${room.name}" is now available for booking.`,
          metadata: {
            roomId: room._id,
            roomName: room.name
          }
        })
      )
    );

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
    const existingRoom = await Room.findById(roomId);

    if (!existingRoom) {
      throw new AppError('Room not found', 404, 'NOT_FOUND');
    }

    const room = await Room.findByIdAndUpdate(roomId, payload, {
      new: true,
      runValidators: true
    });

    const users = await User.find().select('_id');

    let message = `Room "${existingRoom.name}" was updated.`;

    if (existingRoom.name !== room.name) {
      message = `Room "${existingRoom.name}" was changed to "${room.name}".`;
    } else if (existingRoom.capacity !== room.capacity) {
      message = `Room "${room.name}" capacity changed from ${existingRoom.capacity} to ${room.capacity}.`;
    } else if (existingRoom.type !== room.type) {
      message = `Room "${room.name}" type changed from ${existingRoom.type} to ${room.type}.`;
    }

    await Promise.all(
      users.map((u) =>
        createNotification({
          recipientUserId: u._id,
          type: 'room_updated',
          title: 'Room updated',
          message,
          metadata: {
            roomId: room._id,
            roomName: existingRoom.name,
            newRoomName: room.name,
            oldCapacity: existingRoom.capacity,
            newCapacity: room.capacity,
            oldType: existingRoom.type,
            newType: room.type
          }
        })
      )
    );

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
  const room = await Room.findById(roomId);

  if (!room) {
    throw new AppError('Room not found', 404, 'NOT_FOUND');
  }

  const bookingsForRoom = await Booking.find({ roomId }).select('_id userId startTime endTime');

  const deletedRoom = await Room.findByIdAndDelete(roomId);

  const deletedBookings = await Booking.deleteMany({ roomId });

  const users = await User.find().select('_id');

  await Promise.all(
    users.map((u) =>
      createNotification({
        recipientUserId: u._id,
        type: 'room_deleted',
        title: 'Room deleted',
        message: `Room "${room.name}" was deleted.`,
        metadata: {
          roomId: room._id,
          roomName: room.name
        }
      })
    )
  );

  await Promise.all(
    bookingsForRoom.map((booking) =>
      createNotification({
        recipientUserId: booking.userId,
        type: 'room_deleted',
        title: 'Room deleted',
        message: `Room "${room.name}" was deleted. Your booking from ${new Date(
          booking.startTime
        ).toLocaleString()} to ${new Date(booking.endTime).toLocaleString()} was removed.`,
        metadata: {
          roomId: room._id,
          bookingId: booking._id,
          roomName: room.name,
          oldStartTime: booking.startTime,
          oldEndTime: booking.endTime
        }
      })
    )
  );

  logger.info(
    { roomId, deletedBookingsCount: deletedBookings.deletedCount },
    'Room deleted with cascading booking delete'
  );

  await del(ROOMS_CACHE_KEY);
  return deletedRoom;
}

module.exports = {
  getAllRooms,
  createRoom,
  updateRoom,
  deleteRoom
};