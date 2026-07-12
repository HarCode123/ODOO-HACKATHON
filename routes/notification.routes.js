const router = require('express').Router();
const ctrl = require('../controllers/notification.controller');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.get('/', ctrl.list);
router.put('/read-all', ctrl.markAllRead);
router.put('/:id/read', ctrl.markOneRead);

module.exports = router;
