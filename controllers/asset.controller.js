const pool = require('../config/db');
const uid = require('../utils/uid');
const { logActivity, pushNotification } = require('../utils/activity');

// GET /api/assets?q=&status=&category=
exports.list = async (req, res, next) => {
  try {
    const { q, status, category } = req.query;
    let sql = `SELECT a.*, c.name AS category_name FROM assets a
                LEFT JOIN categories c ON c.id = a.category_id WHERE 1=1`;
    const params = [];

    if (q) {
      sql += ` AND (a.tag LIKE ? OR a.name LIKE ? OR a.serial LIKE ?)`;
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }
    if (status) { sql += ` AND a.status = ?`; params.push(status); }
    if (category) { sql += ` AND a.category_id = ?`; params.push(category); }
    sql += ` ORDER BY a.created_at DESC`;

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT a.*, c.name AS category_name FROM assets a
       LEFT JOIN categories c ON c.id = a.category_id WHERE a.id = ?`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ message: 'Asset not found.' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

// POST /api/assets  — Register Asset
exports.create = async (req, res, next) => {
  try {
    const { name, categoryId, serial, acqDate, cost, condition, location, bookable } = req.body;
    if (!name) return res.status(400).json({ message: 'name is required.' });

    const [[{ cnt }]] = await pool.query('SELECT COUNT(*) AS cnt FROM assets');
    const tag = `AF-${String(cnt + 1).padStart(4, '0')}`;
    const id = uid('a');

    await pool.query(
      `INSERT INTO assets (id, tag, name, category_id, serial, acq_date, cost, \`condition\`, location, status, bookable, score, maint_count)
       VALUES (?,?,?,?,?,?,?,?,?, 'Available', ?, 85, 0)`,
      [id, tag, name, categoryId || null, serial || '—', acqDate || null, cost || 0, condition || 'Good', location || 'Unassigned', bookable ? 1 : 0]
    );

    await logActivity(req.user?.name, `Registered asset ${tag} (${name})`);
    await pushNotification('Allocation', `New asset registered: ${tag}`, 'info');

    res.status(201).json({ id, tag, name, status: 'Available' });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const { name, categoryId, serial, acqDate, cost, condition, location, bookable } = req.body;
    const [result] = await pool.query(
      `UPDATE assets SET
        name = COALESCE(?, name), category_id = ?, serial = COALESCE(?, serial),
        acq_date = COALESCE(?, acq_date), cost = COALESCE(?, cost),
        \`condition\` = COALESCE(?, \`condition\`), location = COALESCE(?, location),
        bookable = COALESCE(?, bookable)
       WHERE id = ?`,
      [name, categoryId ?? null, serial, acqDate, cost, condition, location, bookable, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ message: 'Asset not found.' });
    res.json({ message: 'Asset updated.' });
  } catch (err) { next(err); }
};

// PUT /api/assets/:id/status — e.g. mark Retired / Disposed / Lost
exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ['Available','Allocated','Reserved','UnderMaintenance','Lost','Retired','Disposed'];
    if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status.' });

    const [result] = await pool.query('UPDATE assets SET status = ? WHERE id = ?', [status, req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Asset not found.' });

    await logActivity(req.user?.name, `Asset ${req.params.id} status changed to ${status}`);
    res.json({ message: 'Status updated.' });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const [result] = await pool.query('DELETE FROM assets WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Asset not found.' });
    res.json({ message: 'Asset deleted.' });
  } catch (err) { next(err); }
};
