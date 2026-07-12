const router = require('express').Router();
const ctrl = require('../controllers/asset.controller');
const { requireAuth, requireRole } = require('../middleware/auth');

router.use(requireAuth);

router.get('/', ctrl.list);
router.get('/:id', ctrl.getOne);
router.post('/', requireRole('Admin', 'AssetManager'), ctrl.create);
router.put('/:id', requireRole('Admin', 'AssetManager'), ctrl.update);
router.put('/:id/status', requireRole('Admin', 'AssetManager'), ctrl.updateStatus);
router.delete('/:id', requireRole('Admin'), ctrl.remove);

module.exports = router;
