const pool = require('../config/db');

exports.list = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT e.id, e.name, e.email, e.role, e.status, e.dept_id, d.name AS dept_name
       FROM employees e LEFT JOIN departments d ON d.id = e.dept_id
       ORDER BY e.name`
    );
    res.json(rows);
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT e.id, e.name, e.email, e.role, e.status, e.dept_id, d.name AS dept_name
       FROM employees e LEFT JOIN departments d ON d.id = e.dept_id
       WHERE e.id = ?`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ message: 'Employee not found.' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

// PUT /api/employees/:id/role  — Admin-only role promotion (per frontend: "only here")
exports.changeRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const allowed = ['Employee', 'DeptHead', 'AssetManager', 'Admin'];
    if (!allowed.includes(role)) return res.status(400).json({ message: 'Invalid role.' });

    const [result] = await pool.query('UPDATE employees SET role = ? WHERE id = ?', [role, req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Employee not found.' });
    res.json({ message: `Role updated to ${role}.` });
  } catch (err) { next(err); }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['Active', 'Inactive'].includes(status)) return res.status(400).json({ message: 'Invalid status.' });
    const [result] = await pool.query('UPDATE employees SET status = ? WHERE id = ?', [status, req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Employee not found.' });
    res.json({ message: 'Status updated.' });
  } catch (err) { next(err); }
};

exports.updateDept = async (req, res, next) => {
  try {
    const { deptId } = req.body;
    const [result] = await pool.query('UPDATE employees SET dept_id = ? WHERE id = ?', [deptId || null, req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Employee not found.' });
    res.json({ message: 'Department updated.' });
  } catch (err) { next(err); }
};
