const pool = require('../config/db');
const uid = require('../utils/uid');
const { logActivity, pushNotification } = require('../utils/activity');

exports.list = async (req, res, next) => {
  try {
    const [cycles] = await pool.query(
      `SELECT c.*, d.name AS dept_name, e.name AS auditor_name FROM audit_cycles c
       LEFT JOIN departments d ON d.id = c.dept_id
       LEFT JOIN employees e ON e.id = c.auditor_id ORDER BY c.start_date DESC`
    );
    for (const cycle of cycles) {
      const [items] = await pool.query(
        `SELECT ai.*, a.tag AS asset_tag FROM audit_items ai JOIN assets a ON a.id = ai.asset_id WHERE ai.cycle_id = ?`,
        [cycle.id]
      );
      cycle.items = items;
    }
    res.json(cycles);
  } catch (err) { next(err); }
};

// POST /api/audits — create a cycle, seeding items from assets in scope
exports.create = async (req, res, next) => {
  try {
    const { name, deptId, start, end, auditorId, assetIds } = req.body;
    if (!name || !start || !end) return res.status(400).json({ message: 'name, start and end are required.' });

    const id = uid('au');
    await pool.query(
      `INSERT INTO audit_cycles (id, name, dept_id, location, start_date, end_date, auditor_id, status)
       VALUES (?, ?, ?, 'HQ', ?, ?, ?, 'Open')`,
      [id, name, deptId || null, start, end, auditorId || null]
    );

    const ids = Array.isArray(assetIds) && assetIds.length ? assetIds : [];
    let scopeAssets = ids;
    if (!scopeAssets.length) {
      const [rows] = await pool.query('SELECT id, location FROM assets LIMIT 3');
      scopeAssets = rows.map(r => r.id);
      for (const r of rows) {
        await pool.query(
          `INSERT INTO audit_items (cycle_id, asset_id, expected_loc, verification) VALUES (?,?,?, 'Verified')`,
          [id, r.id, r.location]
        );
      }
    } else {
      for (const assetId of scopeAssets) {
        const [[a]] = await pool.query('SELECT location FROM assets WHERE id = ?', [assetId]);
        await pool.query(
          `INSERT INTO audit_items (cycle_id, asset_id, expected_loc, verification) VALUES (?,?,?, 'Verified')`,
          [id, assetId, a ? a.location : '']
        );
      }
    }

    await logActivity(req.user?.name, `Created audit cycle: ${name}`);
    res.status(201).json({ id, status: 'Open' });
  } catch (err) { next(err); }
};

// PUT /api/audits/items/:itemId — update a single item's verification
exports.updateItem = async (req, res, next) => {
  try {
    const { verification, notes } = req.body;
    const allowed = ['Verified', 'Missing', 'Damaged'];
    if (!allowed.includes(verification)) return res.status(400).json({ message: 'Invalid verification value.' });

    const [result] = await pool.query(
      `UPDATE audit_items SET verification = ?, notes = COALESCE(?, notes) WHERE id = ?`,
      [verification, notes, req.params.itemId]
    );
    if (!result.affectedRows) return res.status(404).json({ message: 'Audit item not found.' });
    res.json({ message: 'Item updated.' });
  } catch (err) { next(err); }
};

// PUT /api/audits/:id/close — close cycle, flag Missing assets as Lost
exports.close = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[cycle]] = await conn.query('SELECT * FROM audit_cycles WHERE id = ? FOR UPDATE', [req.params.id]);
    if (!cycle) { await conn.rollback(); return res.status(404).json({ message: 'Audit cycle not found.' }); }

    const [items] = await conn.query('SELECT * FROM audit_items WHERE cycle_id = ?', [req.params.id]);
    for (const item of items) {
      if (item.verification === 'Missing') {
        await conn.query(`UPDATE assets SET status = 'Lost' WHERE id = ?`, [item.asset_id]);
      }
    }
    await conn.query(`UPDATE audit_cycles SET status = 'Closed' WHERE id = ?`, [req.params.id]);
    await conn.commit();

    const discrepancies = items.filter(i => i.verification !== 'Verified').length;
    await logActivity(req.user?.name, `Closed audit cycle: ${cycle.name}`);
    await pushNotification('Alert', `Audit cycle closed: ${cycle.name} — ${discrepancies} discrepancies`, 'high');

    res.json({ message: 'Audit cycle closed.', discrepancies });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
};
