const Booking = require('../models/Booking');
const Room = require('../models/Room');
const { AppError } = require('../utils/AppError');
const { createNotification } = require('./notification.service');
const User = require('../models/User');

/**
 * Overlap-regel:
 * En ny bokning [start, end) krockar om det finns en befintlig bokning där:
 * existing.startTime < newEnd AND existing.endTime > newStart
 */
async function assertRoomAvailable(roomId, startTime, endTime, excludeBookingId = null) {
  const query = {
    roomId,
    startTime: { $lt: endTime },
    endTime: { $gt: startTime }
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const conflict = await Booking.findOne(query);
  if (conflict) {
    throw new AppError('Room is already booked for that time range', 409, 'ROOM_UNAVAILABLE');
  }
}

function parseAndValidateTimes(startTime, endTime) {
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new AppError('Invalid startTime or endTime', 400, 'VALIDATION_ERROR');
  }

  if (end <= start) {
    throw new AppError('endTime must be after startTime', 400, 'VALIDATION_ERROR');
  }

  return { start, end };
}

async function createBooking({ roomId, userId, startTime, endTime }) {
  if (!roomId || !userId || !startTime || !endTime) {
    throw new AppError('roomId, startTime and endTime are required', 400, 'VALIDATION_ERROR');
  }

  const roomExists = await Room.exists({ _id: roomId });
  if (!roomExists) {
    throw new AppError('Room not found', 404, 'NOT_FOUND');
  }

  const { start, end } = parseAndValidateTimes(startTime, endTime);

  await assertRoomAvailable(roomId, start, end);

  const booking = await Booking.create({
    roomId,
    userId,
    startTime: start,
    endTime: end
  });

  const room = await Room.findById(roomId).select('name');

  await createNotification({
    recipientUserId: userId,
    type: 'booking_created',
    title: 'Booking created',
    message: `Your booking for "${room.name}" from ${start.toLocaleString()} to ${end.toLocaleString()} was created.`,
    metadata: {
      roomId: room._id,
      bookingId: booking._id,
      roomName: room.name,
      newStartTime: start,
      newEndTime: end
    }
  });

  return booking;
}

async function cleanupOrphanBookings(bookings) {
  const orphanIds = bookings
    .filter((booking) => !booking.roomId)
    .map((booking) => booking._id);

  if (orphanIds.length > 0) {
    await Booking.deleteMany({ _id: { $in: orphanIds } });
  }

  return bookings.filter((booking) => booking.roomId);
}

async function listBookingsForUser(userId) {
  const bookings = await Booking.find({ userId })
    .populate('roomId')
    .sort({ startTime: 1 });

  return cleanupOrphanBookings(bookings);
}

async function listAllBookings() {
  const bookings = await Booking.find()
    .populate('roomId')
    .populate('userId', 'username role')
    .sort({ startTime: 1 });

  return cleanupOrphanBookings(bookings);
}

async function getBookingById(id) {
  const booking = await Booking.findById(id);
  if (!booking) {
    throw new AppError('Booking not found', 404, 'NOT_FOUND');
  }
  return booking;
}

async function updateBooking(bookingId, { roomId, startTime, endTime }) {
  const booking = await getBookingById(bookingId);

  const oldStartTime = booking.startTime;
  const oldEndTime = booking.endTime;
  const oldRoomId = booking.roomId.toString();

  const newRoomId = roomId || oldRoomId;
  const newStartTime = startTime || booking.startTime;
  const newEndTime = endTime || booking.endTime;

  const { start, end } = parseAndValidateTimes(newStartTime, newEndTime);

  const roomExists = await Room.exists({ _id: newRoomId });
  if (!roomExists) {
    throw new AppError('Room not found', 404, 'NOT_FOUND');
  }

  await assertRoomAvailable(newRoomId, start, end, bookingId);

  booking.roomId = newRoomId;
  booking.startTime = start;
  booking.endTime = end;
  await booking.save();

  const room = await Room.findById(newRoomId).select('name');

  await createNotification({
    recipientUserId: booking.userId,
    type: 'booking_updated',
    title: 'Booking updated',
    message: `Your booking for "${room.name}" was changed from ${new Date(oldStartTime).toLocaleString()}–${new Date(oldEndTime).toLocaleString()} to ${start.toLocaleString()}–${end.toLocaleString()}.`,
    metadata: {
      roomId: room._id,
      bookingId: booking._id,
      roomName: room.name,
      oldStartTime,
      oldEndTime,
      newStartTime: start,
      newEndTime: end
    }
  });

  return booking;
}

async function deleteBooking(bookingId) {
  const booking = await Booking.findByIdAndDelete(bookingId);

  if (!booking) {
    throw new AppError('Booking not found', 404, 'NOT_FOUND');
  }

  const room = await Room.findById(booking.roomId).select('name');

  await createNotification({
    recipientUserId: booking.userId,
    type: 'booking_canceled',
    title: 'Booking canceled',
    message: `Your booking for "${room?.name || 'room'}" from ${new Date(
      booking.startTime
    ).toLocaleString()} to ${new Date(booking.endTime).toLocaleString()} was canceled.`,
    metadata: {
      roomId: booking.roomId,
      bookingId: booking._id,
      roomName: room?.name,
      oldStartTime: booking.startTime,
      oldEndTime: booking.endTime
    }
  });

  return booking;
}

module.exports = {
  createBooking,
  listBookingsForUser,
  listAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking
};