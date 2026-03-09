const User = require('../models/User');
const Booking = require('../models/Booking');
const { AppError } = require('../utils/AppError');

async function getAllUsers() {
  const users = await User.find()
    .select('-password')
    .sort({ createdAt: -1 });

  return users;
}

async function deleteUser(userId) {
  const user = await User.findByIdAndDelete(userId);

  if (!user) {
    throw new AppError('User not found', 404, 'NOT_FOUND');
  }

  await Booking.deleteMany({ userId });

  return user;
}

module.exports = {
  getAllUsers,
  deleteUser,
};