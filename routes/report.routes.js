const router = require('express').Router();
const ctrl = require('../controllers/report.controller');
const { requireAuth, requireRole } = require('../middleware/auth');

router.use(requireAuth);

router.get('/dashboard', ctrl.dashboard);
router.get('/activity', ctrl.activity);
router.get('/assets.csv', requireRole('Admin', 'AssetManager', 'DeptHead'), ctrl.assetsCsv);

module.exports = router;
