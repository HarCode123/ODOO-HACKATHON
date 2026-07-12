const pool = require('../config/db');
const uid = require('../utils/uid');

exports.list = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT d.*, e.name AS head_name FROM departments d
       LEFT JOIN employees e ON e.id = d.head_id ORDER BY d.name`
    );
    res.json(rows);
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM departments WHERE id = ?', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ message: 'Department not found.' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { name, headId, parentId, status } = req.body;
    if (!name) return res.status(400).json({ message: 'name is required.' });
    const id = uid('d');
    await pool.query(
      `INSERT INTO departments (id, name, head_id, parent_id, status) VALUES (?,?,?,?,?)`,
      [id, name, headId || null, parentId || null, status || 'Active']
    );
    res.status(201).json({ id, name, headId, parentId, status: status || 'Active' });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const { name, headId, parentId, status } = req.body;
    const [result] = await pool.query(
      `UPDATE departments SET name = COALESCE(?, name), head_id = ?, parent_id = ?, status = COALESCE(?, status)
       WHERE id = ?`,
      [name, headId ?? null, parentId ?? null, status, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ message: 'Department not found.' });
    res.json({ message: 'Department updated.' });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const [result] = await pool.query('DELETE FROM departments WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Department not found.' });
    res.json({ message: 'Department deleted.' });
  } catch (err) { next(err); }
};
