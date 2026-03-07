const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    startTime: { type: Date, required: true, index: true },
    endTime: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);

// Helpful compound index for overlap queries
bookingSchema.index({ roomId: 1, startTime: 1, endTime: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
