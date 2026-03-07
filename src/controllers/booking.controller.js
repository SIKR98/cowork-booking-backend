const { asyncHandler } = require('../utils/asyncHandler');
const bookingService = require('../services/booking.service');
const { AppError } = require('../utils/AppError');

const createBooking = asyncHandler(async (req, res) => {
  const { roomId, startTime, endTime } = req.body || {};
  const userId = req.user.sub;

  const booking = await bookingService.createBooking({
    roomId,
    userId,
    startTime,
    endTime,
  });

  // realtime notification
  const io = req.app.get('io');
  if (io) {
    io.to(`user:${userId}`).emit('booking.created', { booking });

    // undvik dubbelnotis när användaren själv är Admin (då är socket i både user- och admin-rum)
    if (req.user.role !== 'Admin') {
      io.to('role:Admin').emit('booking.created', { booking });
    }
  }

  res.status(201).json({ booking });
});

const listBookings = asyncHandler(async (req, res) => {
  if (req.user.role === 'Admin') {
    const bookings = await bookingService.listAllBookings();
    return res.json({ bookings });
  }

  const bookings = await bookingService.listBookingsForUser(req.user.sub);
  res.json({ bookings });
});

const updateBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // ägar-/admin-check
  const existing = await bookingService.getBookingById(id);
  const isOwner = existing.userId.toString() === req.user.sub;
  const isAdmin = req.user.role === 'Admin';
  if (!isOwner && !isAdmin) {
    throw new AppError('Forbidden', 403, 'FORBIDDEN');
  }

  const { roomId, startTime, endTime } = req.body || {};
  const booking = await bookingService.updateBooking(id, { roomId, startTime, endTime });

  // realtime notification
  const io = req.app.get('io');
  if (io) {
    const ownerId = booking.userId.toString();
    io.to(`user:${ownerId}`).emit('booking.updated', { booking });

    if (req.user.role !== 'Admin') {
      io.to('role:Admin').emit('booking.updated', { booking });
    }
  }

  res.json({ booking });
});

const deleteBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // ägar-/admin-check
  const existing = await bookingService.getBookingById(id);
  const isOwner = existing.userId.toString() === req.user.sub;
  const isAdmin = req.user.role === 'Admin';
  if (!isOwner && !isAdmin) {
    throw new AppError('Forbidden', 403, 'FORBIDDEN');
  }

  const deleted = await bookingService.deleteBooking(id);

  // realtime notification
  const io = req.app.get('io');
  if (io) {
    const ownerId = deleted.userId.toString();
    io.to(`user:${ownerId}`).emit('booking.deleted', { bookingId: id });

    if (req.user.role !== 'Admin') {
      io.to('role:Admin').emit('booking.deleted', { bookingId: id });
    }
  }

  res.status(204).send();
});

module.exports = {
  createBooking,
  listBookings,
  updateBooking,
  deleteBooking,
};