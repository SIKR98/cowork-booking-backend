const router = require("express").Router();
const { auth } = require("../middlewares/auth.middleware");
const notificationController = require("../controllers/notification.controller");

router.get("/", auth, notificationController.listMyNotifications);
router.patch("/read-all", auth, notificationController.markAllAsRead);

module.exports = router;