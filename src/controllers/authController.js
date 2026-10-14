const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const signToken = require('../utils/token');

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required.' });
  if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters.' });
  const normalizedEmail = email.toLowerCase().trim();
  if (await User.exists({ email: normalizedEmail })) return res.status(409).json({ message: 'An account with this email already exists.' });
  // Public registration intentionally always creates a student. Assign elevated roles out-of-band.
  const user = await User.create({ name, email: normalizedEmail, password, role: 'student' });
  res.status(201).json({ token: signToken(user._id), user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
  if (!user || !user.isActive || !(await user.comparePassword(password))) return res.status(401).json({ message: 'Invalid email or password.' });
  res.json({ token: signToken(user._id), user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});
exports.me = asyncHandler(async (req, res) => res.json({ user: req.user }));
