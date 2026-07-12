const pool = require('../config/db');

// GET /api/notifications — global + this user's own
exports.list = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM notifications WHERE user_id IS NULL OR user_id = ? ORDER BY created_at DESC LIMIT 100`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) { next(err); }
};

// PUT /api/notifications/read-all
exports.markAllRead = async (req, res, next) => {
  try {
    await pool.query(
      `UPDATE notifications SET is_read = 1 WHERE user_id IS NULL OR user_id = ?`,
      [req.user.id]
    );
    res.json({ message: 'All notifications marked as read.' });
  } catch (err) { next(err); }
};

exports.markOneRead = async (req, res, next) => {
  try {
    const [result] = await pool.query('UPDATE notifications SET is_read = 1 WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Notification not found.' });
    res.json({ message: 'Marked as read.' });
  } catch (err) { next(err); }
};
