const pool = require('../config/db');
const uid = require('../utils/uid');
const { logActivity, pushNotification } = require('../utils/activity');

// GET /api/bookings?assetId=&date=YYYY-MM-DD
exports.list = async (req, res, next) => {
  try {
    const { assetId, date } = req.query;
    let sql = `SELECT b.*, a.tag AS asset_tag, e.name AS booked_by_name
               FROM bookings b JOIN assets a ON a.id = b.asset_id
               JOIN employees e ON e.id = b.booked_by WHERE 1=1`;
    const params = [];
    if (assetId) { sql += ' AND b.asset_id = ?'; params.push(assetId); }
    if (date) { sql += ' AND DATE(b.start_time) = ?'; params.push(date); }
    sql += ' ORDER BY b.start_time';
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) { next(err); }
};

// POST /api/bookings — book a bookable asset/room, rejecting overlaps
exports.create = async (req, res, next) => {
  try {
    const { assetId, start, end } = req.body;
    if (!assetId || !start || !end) {
      return res.status(400).json({ message: 'assetId, start and end are required.' });
    }
    if (new Date(start) >= new Date(end)) {
      return res.status(400).json({ message: 'start must be before end.' });
    }

    const [[asset]] = await pool.query('SELECT bookable FROM assets WHERE id = ?', [assetId]);
    if (!asset) return res.status(404).json({ message: 'Asset not found.' });
    if (!asset.bookable) return res.status(400).json({ message: 'This asset is not bookable.' });

    // Conflict check: any existing Upcoming/Ongoing booking overlapping the requested window
    const [conflicts] = await pool.query(
      `SELECT id FROM bookings
       WHERE asset_id = ? AND status IN ('Upcoming','Ongoing')
       AND start_time < ? AND end_time > ?`,
      [assetId, end, start]
    );
    if (conflicts.length) {
      return res.status(409).json({ message: 'This time slot conflicts with an existing booking.' });
    }

    const id = uid('b');
    await pool.query(
      `INSERT INTO bookings (id, asset_id, booked_by, start_time, end_time, status)
       VALUES (?, ?, ?, ?, ?, 'Upcoming')`,
      [id, assetId, req.user.id, start, end]
    );

    await logActivity(req.user?.name, `Booked asset ${assetId} for ${start} - ${end}`);
    await pushNotification('Booking', `Booking confirmed for asset ${assetId}`, 'info');
    res.status(201).json({ id, status: 'Upcoming' });
  } catch (err) { next(err); }
};

exports.cancel = async (req, res, next) => {
  try {
    const [result] = await pool.query(
      `UPDATE bookings SET status = 'Cancelled' WHERE id = ? AND status IN ('Upcoming','Ongoing')`,
      [req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ message: 'Booking not found or already resolved.' });
    res.json({ message: 'Booking cancelled.' });
  } catch (err) { next(err); }
};
