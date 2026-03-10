const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipientUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    type: {
      type: String,
      required: true,
      enum: [
        "booking_created",
        "booking_updated",
        "booking_canceled",
        "room_created",
        "room_updated",
        "room_deleted"
      ]
    },

    title: {
      type: String,
      required: true,
      trim: true
    },

    message: {
      type: String,
      required: true,
      trim: true
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true
    },

    metadata: {
      roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room"
      },

      bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking"
      },

      roomName: {
        type: String,
        trim: true
      },

      newRoomName: {
        type: String,
        trim: true
      },

      oldCapacity: Number,
      newCapacity: Number,

      oldType: String,
      newType: String,

      actorUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },

      actorUsername: {
        type: String,
        trim: true
      },

      oldStartTime: Date,
      oldEndTime: Date,

      newStartTime: Date,
      newEndTime: Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);