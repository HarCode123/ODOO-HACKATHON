const router = require('express').Router();
const ctrl = require('../controllers/department.controller');
const { requireAuth, requireRole } = require('../middleware/auth');

router.use(requireAuth);

router.get('/', ctrl.list);
router.get('/:id', ctrl.getOne);
router.post('/', requireRole('Admin'), ctrl.create);
router.put('/:id', requireRole('Admin'), ctrl.update);
router.delete('/:id', requireRole('Admin'), ctrl.remove);

module.exports = router;
