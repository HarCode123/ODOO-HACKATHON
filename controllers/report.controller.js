const pool = require('../config/db');

// GET /api/reports/dashboard — the KPI tiles used on the Dashboard screen
exports.dashboard = async (req, res, next) => {
  try {
    const [[{ avail }]] = await pool.query(`SELECT COUNT(*) AS avail FROM assets WHERE status='Available'`);
    const [[{ alloc }]] = await pool.query(`SELECT COUNT(*) AS alloc FROM assets WHERE status='Allocated'`);
    const [[{ maintActive }]] = await pool.query(
      `SELECT COUNT(*) AS maintActive FROM maintenance WHERE status IN ('Approved','TechnicianAssigned','InProgress')`
    );
    const [[{ activeBookings }]] = await pool.query(
      `SELECT COUNT(*) AS activeBookings FROM bookings WHERE status IN ('Upcoming','Ongoing')`
    );
    const [[{ pendingTransfers }]] = await pool.query(
      `SELECT COUNT(*) AS pendingTransfers FROM transfers WHERE status='Requested'`
    );
    const [[{ upcomingReturns }]] = await pool.query(
      `SELECT COUNT(*) AS upcomingReturns FROM allocations WHERE status='Active'`
    );
    const [overdue] = await pool.query(
      `SELECT al.*, a.tag AS asset_tag FROM allocations al JOIN assets a ON a.id = al.asset_id
       WHERE al.status = 'Active' AND al.expected_return < CURDATE()`
    );

    res.json({ avail, alloc, maintActive, activeBookings, pendingTransfers, upcomingReturns, overdue });
  } catch (err) { next(err); }
};

// GET /api/reports/assets.csv — CSV export used by the Reports screen
exports.assetsCsv = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT a.tag, a.name, c.name AS category, a.status, a.location, a.score
       FROM assets a LEFT JOIN categories c ON c.id = a.category_id ORDER BY a.tag`
    );
    const header = ['Tag', 'Name', 'Category', 'Status', 'Location', 'Health Score'];
    const lines = [header.join(',')].concat(
      rows.map(r => [r.tag, r.name, r.category || '—', r.status, r.location, r.score].join(','))
    );
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=assetflow_report.csv');
    res.send(lines.join('\n'));
  } catch (err) { next(err); }
};

// GET /api/reports/activity — recent activity log
exports.activity = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 200);
    const [rows] = await pool.query(
      'SELECT * FROM activity_log ORDER BY created_at DESC LIMIT ?', [limit]
    );
    res.json(rows);
  } catch (err) { next(err); }
};
