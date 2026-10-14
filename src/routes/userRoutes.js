const router = require('express').Router();
const u = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');
router.patch('/me', protect, u.updateProfile);
router.get('/', protect, authorize('admin'), u.listUsers);
router.patch('/:id/role', protect, authorize('admin'), u.setUserRole);
module.exports = router;
