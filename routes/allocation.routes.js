const router = require('express').Router();
const ctrl = require('../controllers/allocation.controller');
const { requireAuth, requireRole } = require('../middleware/auth');

router.use(requireAuth);

router.get('/', ctrl.list);
router.post('/', requireRole('Admin', 'AssetManager', 'DeptHead'), ctrl.create);
router.put('/:id/return', requireRole('Admin', 'AssetManager', 'DeptHead'), ctrl.markReturned);

module.exports = router;
