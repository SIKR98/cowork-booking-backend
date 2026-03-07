const router = require('express').Router();
const { auth } = require('../middlewares/auth.middleware');
const { validateObjectId } = require('../middlewares/validateObjectId.middleware');
const bookingController = require('../controllers/booking.controller');

router.post('/', auth, bookingController.createBooking);
router.get('/', auth, bookingController.listBookings);
router.put('/:id', auth, validateObjectId('id'), bookingController.updateBooking);
router.delete('/:id', auth, validateObjectId('id'), bookingController.deleteBooking);

module.exports = router;