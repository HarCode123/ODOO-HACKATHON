const router = require('express').Router();
const auth = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth');

router.post('/signup', auth.signup);
router.post('/login', auth.login);
router.get('/me', requireAuth, auth.me);

module.exports = router;
