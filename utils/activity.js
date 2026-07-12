const pool = require('../config/db');
const uid = require('./uid');

async function logActivity(userName, action) {
  try {
    await pool.query(
      'INSERT INTO activity_log (user_name, action) VALUES (?, ?)',
      [userName || 'System', action]
    );
  } catch (err) {
    console.error('Failed to write activity log:', err.message);
  }
}

async function pushNotification(type, message, priority = 'info', userId = null) {
  try {
    await pool.query(
      'INSERT INTO notifications (id, user_id, type, message, priority, is_read) VALUES (?,?,?,?,?,0)',
      [uid('n'), userId, type, message, priority]
    );
  } catch (err) {
    console.error('Failed to push notification:', err.message);
  }
}

module.exports = { logActivity, pushNotification };
