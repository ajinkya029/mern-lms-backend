const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return res.status(401).json({ message: 'Authentication required. Provide a Bearer token.' });
  let payload;
  try { payload = jwt.verify(header.slice(7), process.env.JWT_SECRET); }
  catch (_err) { return res.status(401).json({ message: 'Invalid or expired token.' }); }
  const user = await User.findById(payload.id).select('-password');
  if (!user || !user.isActive) return res.status(401).json({ message: 'Account not found or disabled.' });
  req.user = user;
  next();
});
const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ message: 'You do not have permission to perform this action.' });
  next();
};
module.exports = { protect, authorize };
