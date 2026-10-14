const mongoose = require('mongoose');
const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  videoUrl: { type: String, default: '' },
  durationMinutes: { type: Number, min: 0, default: 0 },
  resources: [{ title: String, url: String }],
  order: { type: Number, default: 0 }
}, { timestamps: true });
const courseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 160 },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  subtitle: { type: String, default: '', maxlength: 240 },
  description: { type: String, required: true },
  category: { type: String, required: true, trim: true },
  level: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'all-levels'], default: 'beginner' },
  price: { type: Number, min: 0, default: 0 },
  thumbnailUrl: { type: String, default: '' },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lessons: [lessonSchema],
  published: { type: Boolean, default: false },
  averageRating: { type: Number, min: 0, max: 5, default: 0 },
  numReviews: { type: Number, default: 0 }
}, { timestamps: true });
courseSchema.index({ title: 'text', description: 'text', category: 'text' });
module.exports = mongoose.model('Course', courseSchema);
