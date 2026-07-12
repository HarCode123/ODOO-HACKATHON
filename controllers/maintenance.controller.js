const pool = require('../config/db');
const uid = require('../utils/uid');
const { logActivity, pushNotification } = require('../utils/activity');

exports.list = async (req, res, next) => {
  try {
    const { status } = req.query;
    let sql = `SELECT m.*, a.tag AS asset_tag, e.name AS raised_by_name
               FROM maintenance m JOIN assets a ON a.id = m.asset_id
               JOIN employees e ON e.id = m.raised_by WHERE 1=1`;
    const params = [];
    if (status) { sql += ' AND m.status = ?'; params.push(status); }
    sql += ' ORDER BY m.created_at DESC';
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) { next(err); }
};

// POST /api/maintenance — raise a request (also flags the asset as UnderMaintenance)
exports.create = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const { assetId, issue, priority } = req.body;
    if (!assetId || !issue) return res.status(400).json({ message: 'assetId and issue are required.' });

    await conn.beginTransaction();
    const id = uid('m');
    await conn.query(
      `INSERT INTO maintenance (id, asset_id, raised_by, issue, priority, status)
       VALUES (?, ?, ?, ?, ?, 'Pending')`,
      [id, assetId, req.user.id, issue, priority || 'Medium']
    );
    await conn.commit();

    await logActivity(req.user?.name, `Raised maintenance request for asset ${assetId}`);
    await pushNotification('Alert', `Maintenance requested for asset ${assetId}`, 'info');
    res.status(201).json({ id, status: 'Pending' });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
};

// PUT /api/maintenance/:id/status — move a card through the kanban
exports.updateStatus = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const { status, technician } = req.body;
    const allowed = ['Pending', 'Approved', 'TechnicianAssigned', 'InProgress', 'Resolved', 'Rejected'];
    if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status.' });

    await conn.beginTransaction();
    const [[req_]] = await conn.query('SELECT * FROM maintenance WHERE id = ? FOR UPDATE', [req.params.id]);
    if (!req_) { await conn.rollback(); return res.status(404).json({ message: 'Maintenance request not found.' }); }

    const resolvedAt = status === 'Resolved' ? new Date().toISOString().slice(0, 10) : req_.resolved_at;
    await conn.query(
      `UPDATE maintenance SET status = ?, technician = COALESCE(?, technician), resolved_at = ? WHERE id = ?`,
      [status, technician || null, resolvedAt, req.params.id]
    );

    // Sync the parent asset's availability with the maintenance lifecycle
    if (status === 'Resolved') {
      await conn.query(`UPDATE assets SET status = 'Available' WHERE id = ?`, [req_.asset_id]);
    } else if (['Approved', 'TechnicianAssigned', 'InProgress'].includes(status)) {
      await conn.query(`UPDATE assets SET status = 'UnderMaintenance' WHERE id = ?`, [req_.asset_id]);
    }

    await conn.commit();
    await logActivity(req.user?.name, `Maintenance ${req.params.id} moved to ${status}`);
    if (status === 'Resolved') {
      await pushNotification('Approval', `Maintenance resolved for asset ${req_.asset_id}`, 'info');
    }
    res.json({ message: `Status updated to ${status}.` });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
};
