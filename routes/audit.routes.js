const router = require('express').Router();
const ctrl = require('../controllers/audit.controller');
const { requireAuth, requireRole } = require('../middleware/auth');

router.use(requireAuth, requireRole('Admin', 'AssetManager'));

router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.put('/items/:itemId', ctrl.updateItem);
router.put('/:id/close', ctrl.close);

module.exports = router;
