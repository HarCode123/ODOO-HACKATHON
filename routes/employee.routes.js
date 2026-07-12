const router = require('express').Router();
const ctrl = require('../controllers/employee.controller');
const { requireAuth, requireRole } = require('../middleware/auth');

router.use(requireAuth);

router.get('/', ctrl.list);
router.get('/:id', ctrl.getOne);
router.put('/:id/role', requireRole('Admin'), ctrl.changeRole);
router.put('/:id/status', requireRole('Admin'), ctrl.updateStatus);
router.put('/:id/department', requireRole('Admin'), ctrl.updateDept);

module.exports = router;
