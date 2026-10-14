const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, match: [/^\S+@\S+\.\S+$/, 'Enter a valid email'] },
  password: { type: String, required: true, minlength: 8, select: false },
  role: { type: String, enum: ['student', 'instructor', 'admin'], default: 'student' },
  bio: { type: String, maxlength: 500, default: '' },
  avatarUrl: { type: String, default: '' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
userSchema.methods.comparePassword = function(candidate) { return bcrypt.compare(candidate, this.password); };
module.exports = mongoose.model('User', userSchema);
