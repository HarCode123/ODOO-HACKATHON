const router = require('express').Router();
const ctrl = require('../controllers/maintenance.controller');
const { requireAuth, requireRole } = require('../middleware/auth');

router.use(requireAuth);

router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.put('/:id/status', requireRole('Admin', 'AssetManager'), ctrl.updateStatus);

module.exports = router;
