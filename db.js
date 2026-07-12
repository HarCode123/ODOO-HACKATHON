// config/db.js
// Central MySQL connection pool. Import `pool` (or `query`) anywhere you need the DB.

require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'assetflow',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true, // return DATE/DATETIME as plain strings, easier for the frontend
});

// Small helper so models can do `const [rows] = await query(sql, params)`
async function query(sql, params) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

// Quick startup check — logs a clear message instead of failing silently
(async () => {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    console.log(`✅ Connected to MySQL database "${process.env.DB_NAME || 'assetflow'}"`);
  } catch (err) {
    console.error('❌ Could not connect to MySQL:', err.message);
    console.error('   Check your .env values (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME).');
  }
})();

module.exports = { pool, query };