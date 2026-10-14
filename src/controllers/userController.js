const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, bio, avatarUrl } = req.body;
  if (name !== undefined) req.user.name = name;
  if (bio !== undefined) req.user.bio = bio;
  if (avatarUrl !== undefined) req.user.avatarUrl = avatarUrl;
  await req.user.save();
  res.json({ user: { id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role, bio: req.user.bio, avatarUrl: req.user.avatarUrl } });
});
exports.listUsers = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1), limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const filter = {};
  if (req.query.role && ['student','instructor','admin'].includes(req.query.role)) filter.role = req.query.role;
  if (req.query.q) filter.$or = [{ name: new RegExp(escapeRegex(req.query.q), 'i') }, { email: new RegExp(escapeRegex(req.query.q), 'i') }];
  const [users, total] = await Promise.all([User.find(filter).select('-password').sort('-createdAt').skip((page-1)*limit).limit(limit), User.countDocuments(filter)]);
  res.json({ users, pagination: { page, limit, total, pages: Math.ceil(total/limit) } });
});
function escapeRegex(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
exports.setUserRole = asyncHandler(async (req, res) => {
  if (!['student','instructor','admin'].includes(req.body.role)) return res.status(400).json({ message: 'Role must be student, instructor or admin.' });
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found.' });
  user.role = req.body.role; await user.save(); res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});
