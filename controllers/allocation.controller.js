const pool = require('../config/db');
const uid = require('../utils/uid');
const { logActivity, pushNotification } = require('../utils/activity');

exports.list = async (req, res, next) => {
  try {
    const { status, employeeId, assetId } = req.query;
    let sql = `SELECT al.*, a.tag AS asset_tag, e.name AS employee_name
               FROM allocations al
               JOIN assets a ON a.id = al.asset_id
               JOIN employees e ON e.id = al.employee_id
               WHERE 1=1`;
    const params = [];
    if (status) { sql += ' AND al.status = ?'; params.push(status); }
    if (employeeId) { sql += ' AND al.employee_id = ?'; params.push(employeeId); }
    if (assetId) { sql += ' AND al.asset_id = ?'; params.push(assetId); }
    sql += ' ORDER BY al.allocated_at DESC';

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) { next(err); }
};

// POST /api/allocations — allocate an asset to an employee
exports.create = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const { assetId, employeeId, deptId, expectedReturn, notes } = req.body;
    if (!assetId || !employeeId) return res.status(400).json({ message: 'assetId and employeeId are required.' });

    await conn.beginTransaction();

    const [[asset]] = await conn.query('SELECT status FROM assets WHERE id = ? FOR UPDATE', [assetId]);
    if (!asset) { await conn.rollback(); return res.status(404).json({ message: 'Asset not found.' }); }
    if (asset.status !== 'Available') {
      await conn.rollback();
      return res.status(409).json({ message: `Asset is currently ${asset.status} and cannot be allocated.` });
    }

    const id = uid('al');
    await conn.query(
      `INSERT INTO allocations (id, asset_id, employee_id, dept_id, allocated_at, expected_return, notes, status)
       VALUES (?, ?, ?, ?, CURDATE(), ?, ?, 'Active')`,
      [id, assetId, employeeId, deptId || null, expectedReturn || null, notes || '']
    );
    await conn.query(`UPDATE assets SET status = 'Allocated' WHERE id = ?`, [assetId]);

    await conn.commit();
    await logActivity(req.user?.name, `Allocated asset ${assetId} to employee ${employeeId}`);
    await pushNotification('Allocation', `Asset ${assetId} assigned to employee ${employeeId}`, 'info');

    res.status(201).json({ id, status: 'Active' });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
};

// PUT /api/allocations/:id/return — mark returned, free the asset
exports.markReturned = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const { notes } = req.body;
    await conn.beginTransaction();

    const [[allocation]] = await conn.query('SELECT * FROM allocations WHERE id = ? FOR UPDATE', [req.params.id]);
    if (!allocation) { await conn.rollback(); return res.status(404).json({ message: 'Allocation not found.' }); }
    if (allocation.status === 'Returned') { await conn.rollback(); return res.status(409).json({ message: 'Already returned.' }); }

    await conn.query(
      `UPDATE allocations SET status = 'Returned', returned_at = CURDATE(), notes = ? WHERE id = ?`,
      [notes || allocation.notes, req.params.id]
    );
    await conn.query(`UPDATE assets SET status = 'Available' WHERE id = ?`, [allocation.asset_id]);

    await conn.commit();
    await logActivity(req.user?.name, `Marked allocation ${req.params.id} as returned`);
    res.json({ message: 'Marked as returned.' });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
};
