const Notification = require("../models/Notification");
const { emitToUser } = require("./socket.service");

async function createNotification({
  recipientUserId,
  type,
  title,
  message,
  metadata = {}
}) {
  const notification = await Notification.create({
    recipientUserId,
    type,
    title,
    message,
    metadata
  });

  // skicka realtime notification till användaren
  emitToUser(recipientUserId.toString(), "notification", notification);

  return notification;
}

async function listNotificationsForUser(userId) {
  return Notification.find({ recipientUserId: userId })
    .sort({ createdAt: -1 })
    .limit(50);
}

async function markAllNotificationsAsRead(userId) {
  await Notification.updateMany(
    { recipientUserId: userId, isRead: false },
    { $set: { isRead: true } }
  );
}

module.exports = {
  createNotification,
  listNotificationsForUser,
  markAllNotificationsAsRead
};