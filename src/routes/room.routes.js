const router = require('express').Router();
const { auth } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');
const { validateObjectId } = require('../middlewares/validateObjectId.middleware');
const roomController = require('../controllers/room.controller');

// per vår default: rooms kräver auth
router.get('/', auth, roomController.listRooms);

// Admin CRUD
router.post('/', auth, requireRole('Admin'), roomController.createRoom);
router.put('/:id', auth, requireRole('Admin'), validateObjectId('id'), roomController.updateRoom);
router.delete('/:id', auth, requireRole('Admin'), validateObjectId('id'), roomController.deleteRoom);

module.exports = router;