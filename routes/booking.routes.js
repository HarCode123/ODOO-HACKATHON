const router = require('express').Router();
const ctrl = require('../controllers/booking.controller');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.put('/:id/cancel', ctrl.cancel);

module.exports = router;
