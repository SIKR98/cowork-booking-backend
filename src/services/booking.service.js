const Booking = require('../models/Booking');
const Room = require('../models/Room');
const { AppError } = require('../utils/AppError');

/**
 * Overlap-regel:
 * En ny bokning [start, end) krockar om det finns en befintlig bokning där:
 * existing.startTime < newEnd AND existing.endTime > newStart
 */
async function assertRoomAvailable(roomId, startTime, endTime, excludeBookingId = null) {
  const query = {
    roomId,
    startTime: { $lt: endTime },
    endTime: { $gt: startTime },
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

  // Kontrollera att rummet finns
  const roomExists = await Room.exists({ _id: roomId });
  if (!roomExists) throw new AppError('Room not found', 404, 'NOT_FOUND');

  const { start, end } = parseAndValidateTimes(startTime, endTime);

  await assertRoomAvailable(roomId, start, end);

  const booking = await Booking.create({
    roomId,
    userId,
    startTime: start,
    endTime: end,
  });

  return booking;
}

async function listBookingsForUser(userId) {
  return Booking.find({ userId })
    .populate('roomId')
    .sort({ startTime: 1 });
}

async function listAllBookings() {
  return Booking.find()
    .populate('roomId')
    .populate('userId', 'username role')
    .sort({ startTime: 1 });
}

async function getBookingById(id) {
  const booking = await Booking.findById(id);
  if (!booking) throw new AppError('Booking not found', 404, 'NOT_FOUND');
  return booking;
}

async function updateBooking(bookingId, { roomId, startTime, endTime }) {
  const booking = await getBookingById(bookingId);

  // Om roomId inte skickas in, behåll samma
  const newRoomId = roomId || booking.roomId.toString();

  // Om tider inte skickas in, behåll samma
  const newStartTime = startTime || booking.startTime;
  const newEndTime = endTime || booking.endTime;

  const { start, end } = parseAndValidateTimes(newStartTime, newEndTime);

  // Kontrollera att rummet finns (om roomId ändras eller om den skickas)
  const roomExists = await Room.exists({ _id: newRoomId });
  if (!roomExists) throw new AppError('Room not found', 404, 'NOT_FOUND');

  await assertRoomAvailable(newRoomId, start, end, bookingId);

  booking.roomId = newRoomId;
  booking.startTime = start;
  booking.endTime = end;
  await booking.save();

  return booking;
}

async function deleteBooking(bookingId) {
  const booking = await Booking.findByIdAndDelete(bookingId);
  if (!booking) throw new AppError('Booking not found', 404, 'NOT_FOUND');
  return booking;
}

module.exports = {
  createBooking,
  listBookingsForUser,
  listAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
};