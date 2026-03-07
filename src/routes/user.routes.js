const router = require('express').Router();
const { auth } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');
const { validateObjectId } = require('../middlewares/validateObjectId.middleware');
const userController = require('../controllers/user.controller');

// Endast admin
router.get('/', auth, requireRole('Admin'), userController.listUsers);
router.delete('/:id', auth, requireRole('Admin'), validateObjectId('id'), userController.deleteUser);

module.exports = router;