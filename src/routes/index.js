const router = require('express').Router();

router.use('/', require('./auth.routes'));
router.use('/rooms', require('./room.routes'));
router.use('/bookings', require('./booking.routes'));
router.use('/users', require('./user.routes'));
router.use('/notifications', require('./notification.routes'));

module.exports = router;