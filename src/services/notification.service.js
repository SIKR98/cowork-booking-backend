const Notification = require("../models/Notification");

async function createNotification({
  recipientUserId,
  type,
  title,
  message,
  metadata = {}
}) {
  return Notification.create({
    recipientUserId,
    type,
    title,
    message,
    metadata
  });
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