const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const userResponse = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role, city: u.city, phone: u.phone });

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, city } = req.body;
    const missing = ['name', 'email', 'password'].filter((f) => !req.body[f]);
    if (missing.length) return res.status(400).json({ message: `Missing required fields: ${missing.join(', ')}` });
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ message: 'Invalid email format' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
    if (role && !['donor', 'receiver'].includes(role)) {
      return res.status(400).json({ message: "Role must be 'donor' or 'receiver'" });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role: role || 'receiver', phone, city });

    res.status(201).json({ token: signToken(user._id), user: userResponse(user) });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    res.json({ token: signToken(user._id), user: userResponse(user) });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
exports.me = async (req, res) => {
  res.json({ user: userResponse(req.user) });
};
