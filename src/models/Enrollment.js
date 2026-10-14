const mongoose = require('mongoose');
const enrollmentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  completedLessons: [{ type: mongoose.Schema.Types.ObjectId }],
  progressPercent: { type: Number, min: 0, max: 100, default: 0 },
  completedAt: { type: Date, default: null }
}, { timestamps: true });
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });
module.exports = mongoose.model('Enrollment', enrollmentSchema);
