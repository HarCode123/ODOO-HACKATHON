const pool = require('../config/db');
const uid = require('../utils/uid');

exports.list = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.*, (SELECT COUNT(*) FROM assets a WHERE a.category_id = c.id) AS asset_count
       FROM categories c ORDER BY c.name`
    );
    res.json(rows);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { name, fields } = req.body;
    if (!name) return res.status(400).json({ message: 'name is required.' });
    const id = uid('c');
    await pool.query('INSERT INTO categories (id, name, fields) VALUES (?,?,?)', [id, name, fields || '—']);
    res.status(201).json({ id, name, fields: fields || '—' });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const { name, fields } = req.body;
    const [result] = await pool.query(
      'UPDATE categories SET name = COALESCE(?, name), fields = COALESCE(?, fields) WHERE id = ?',
      [name, fields, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ message: 'Category not found.' });
    res.json({ message: 'Category updated.' });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const [result] = await pool.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Category not found.' });
    res.json({ message: 'Category deleted.' });
  } catch (err) { next(err); }
};
