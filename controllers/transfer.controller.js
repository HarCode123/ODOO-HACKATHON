const pool = require('../config/db');
const uid = require('../utils/uid');
const { logActivity, pushNotification } = require('../utils/activity');

exports.list = async (req, res, next) => {
  try {
    const { status } = req.query;
    let sql = `SELECT t.*, a.tag AS asset_tag FROM transfers t JOIN assets a ON a.id = t.asset_id WHERE 1=1`;
    const params = [];
    if (status) { sql += ' AND t.status = ?'; params.push(status); }
    sql += ' ORDER BY t.requested_at DESC';
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) { next(err); }
};

// POST /api/transfers — request a transfer
exports.create = async (req, res, next) => {
  try {
    const { assetId, fromId, toId, reason } = req.body;
    if (!assetId || !toId) return res.status(400).json({ message: 'assetId and toId are required.' });

    const id = uid('t');
    await pool.query(
      `INSERT INTO transfers (id, asset_id, from_id, to_id, reason, status, requested_at)
       VALUES (?, ?, ?, ?, ?, 'Requested', CURDATE())`,
      [id, assetId, fromId || null, toId, reason || '']
    );
    await logActivity(req.user?.name, `Requested transfer of asset ${assetId} to ${toId}`);
    res.status(201).json({ id, status: 'Requested' });
  } catch (err) { next(err); }
};

// PUT /api/transfers/:id/decision  { decision: 'Approved' | 'Rejected' }
exports.decide = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const { decision } = req.body;
    if (!['Approved', 'Rejected'].includes(decision)) {
      return res.status(400).json({ message: "decision must be 'Approved' or 'Rejected'." });
    }
    await conn.beginTransaction();

    const [[transfer]] = await conn.query('SELECT * FROM transfers WHERE id = ? FOR UPDATE', [req.params.id]);
    if (!transfer) { await conn.rollback(); return res.status(404).json({ message: 'Transfer not found.' }); }
    if (transfer.status !== 'Requested') {
      await conn.rollback();
      return res.status(409).json({ message: 'This transfer has already been decided.' });
    }

    await conn.query(
      `UPDATE transfers SET status = ?, decided_at = CURDATE() WHERE id = ?`,
      [decision, req.params.id]
    );

    if (decision === 'Approved') {
      // Close the active allocation (if any) and open a new one to the new holder
      await conn.query(
        `UPDATE allocations SET status='Returned', returned_at = CURDATE()
         WHERE asset_id = ? AND status = 'Active'`,
        [transfer.asset_id]
      );
      const newAllocId = uid('al');
      await conn.query(
        `INSERT INTO allocations (id, asset_id, employee_id, allocated_at, status)
         VALUES (?, ?, ?, CURDATE(), 'Active')`,
        [newAllocId, transfer.asset_id, transfer.to_id]
      );
      await conn.query(`UPDATE assets SET status = 'Allocated' WHERE id = ?`, [transfer.asset_id]);
    }

    await conn.commit();
    await logActivity(req.user?.name, `Transfer ${req.params.id} ${decision.toLowerCase()}`);
    await pushNotification('Approval', `Transfer ${decision.toLowerCase()}: asset ${transfer.asset_id}`, 'info');
    res.json({ message: `Transfer ${decision.toLowerCase()}.` });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
};
