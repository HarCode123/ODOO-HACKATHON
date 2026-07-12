const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const uid = require('../utils/uid');
const { signToken } = require('../utils/jwt');

// POST /api/auth/signup  — always creates an Employee-role account
exports.signup = async (req, res, next) => {
  try {
    const { name, email, password, deptId } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email and password are required.' });
    }

    const [existing] = await pool.query('SELECT id FROM employees WHERE email = ?', [email]);
    if (existing.length) {
      return res.status(409).json({ message: 'An account with that email already exists.' });
    }

    const id = uid('e');
    const hash = await bcrypt.hash(password, 10);
    const dept = deptId || null;

    await pool.query(
      `INSERT INTO employees (id, name, email, password_hash, dept_id, role, status)
       VALUES (?, ?, ?, ?, ?, 'Employee', 'Active')`,
      [id, name, email, hash, dept]
    );

    const user = { id, name, email, role: 'Employee' };
    const token = signToken(user);
    res.status(201).json({ token, user });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required.' });
    }

    const [rows] = await pool.query(
      `SELECT id, name, email, password_hash, role, status FROM employees WHERE email = ?`,
      [email]
    );
    const user = rows[0];
    if (!user) return res.status(401).json({ message: 'Invalid credentials.' });
    if (user.status === 'Inactive') return res.status(403).json({ message: 'This account is inactive.' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ message: 'Invalid credentials.' });

    const payload = { id: user.id, name: user.name, email: user.email, role: user.role };
    const token = signToken(payload);
    res.json({ token, user: payload });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
exports.me = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT e.id, e.name, e.email, e.role, e.status, e.dept_id, d.name AS dept_name
       FROM employees e LEFT JOIN departments d ON d.id = e.dept_id
       WHERE e.id = ?`,
      [req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ message: 'User not found.' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};
