const router = require('express').Router();
const ctrl = require('../controllers/category.controller');
const { requireAuth, requireRole } = require('../middleware/auth');

router.use(requireAuth);

router.get('/', ctrl.list);
router.post('/', requireRole('Admin'), ctrl.create);
router.put('/:id', requireRole('Admin'), ctrl.update);
router.delete('/:id', requireRole('Admin'), ctrl.remove);

module.exports = router;
