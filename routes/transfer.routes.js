const router = require('express').Router();
const ctrl = require('../controllers/transfer.controller');
const { requireAuth, requireRole } = require('../middleware/auth');

router.use(requireAuth);

router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.put('/:id/decision', requireRole('Admin', 'AssetManager', 'DeptHead'), ctrl.decide);

module.exports = router;
