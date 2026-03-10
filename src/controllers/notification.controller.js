const { asyncHandler } = require("../utils/asyncHandler");
const notificationService = require("../services/notification.service");

const listMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await notificationService.listNotificationsForUser(
    req.user.sub
  );

  res.json({ notifications });
});

const markAllAsRead = asyncHandler(async (req, res) => {
  await notificationService.markAllNotificationsAsRead(req.user.sub);

  res.json({ ok: true });
});

module.exports = {
  listMyNotifications,
  markAllAsRead
};