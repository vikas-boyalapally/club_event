const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Student, Staff, Admin } = require('../models');

const ROLE_CONFIG = {
  student: {
    Model: Student,
    required: ['fullName', 'email', 'password', 'department', 'year']
  },
  staff: {
    Model: Staff,
    required: ['fullName', 'email', 'password', 'department']
  },
  admin: { Model: Admin, required: ['fullName', 'email', 'password'] }
};

async function register(req, res) {
  const role = req.params.role;
  if (!['student', 'staff'].includes(role)) {
    return res.status(404).json({ error: 'Registration is available for students and staff only.' });
  }
  const { Model, required } = ROLE_CONFIG[role];
  const missing = required.filter((field) => !req.body[field]);
  if (missing.length) {
    return res.status(400).json({ error: `Required fields: ${missing.join(', ')}.` });
  }
  if (String(req.body.password).length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }

  const passwordHash = await bcrypt.hash(req.body.password, 12);
  const user = await Model.create({
    fullName: req.body.fullName.trim(),
    email: req.body.email.trim().toLowerCase(),
    passwordHash,
    department: req.body.department,
    ...(role === 'student' ? { year: req.body.year } : {}),
    ...(req.body.phone ? { phone: req.body.phone } : {})
  });
  res.status(201).json({ user: user.toJSON() });
}

async function login(req, res) {
  const { role, email, password } = req.body;
  const config = ROLE_CONFIG[role];
  if (!config || !email || !password) {
    return res.status(400).json({ error: 'role, email, and password are required.' });
  }
  const user = await config.Model.findOne({
    email: String(email).trim().toLowerCase()
  }).select('+passwordHash');
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not configured.');

  const id = user[`${role}Id`];
  const token = jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h'
  });
  const publicUser = user.toJSON();
  delete publicUser.passwordHash;
  res.json({ token, user: { ...publicUser, role } });
}

module.exports = { register, login };
