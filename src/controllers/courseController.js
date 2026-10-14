const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Review = require('../models/Review');
const asyncHandler = require('../utils/asyncHandler');
const slugify = value => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

exports.listCourses = asyncHandler(async (req, res) => {
  const { q, category, level, instructor, page = 1, limit = 12, sort = '-createdAt' } = req.query;
  const filter = { published: true };
  if (category) filter.category = new RegExp(`^${escapeRegex(category)}$`, 'i');
  if (level) filter.level = level;
  if (instructor) filter.instructor = instructor;
  if (q) filter.$text = { $search: q };
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
  const sortField = ['createdAt', '-createdAt', 'price', '-price', 'averageRating', '-averageRating', 'title', '-title'].includes(sort) ? sort : '-createdAt';
  const [courses, total] = await Promise.all([
    Course.find(filter).populate('instructor', 'name avatarUrl').sort(sortField).skip((pageNum - 1) * pageSize).limit(pageSize).select('-lessons.videoUrl'),
    Course.countDocuments(filter)
  ]);
  res.json({ courses, pagination: { page: pageNum, limit: pageSize, total, pages: Math.ceil(total / pageSize) } });
});
function escapeRegex(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
exports.getCourse = asyncHandler(async (req, res) => {
  const course = await Course.findOne({ $or: [{ _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }, { slug: req.params.id }] }).populate('instructor', 'name bio avatarUrl');
  if (!course || (!course.published && (!req.user || (String(course.instructor._id) !== String(req.user._id) && req.user.role !== 'admin')))) return res.status(404).json({ message: 'Course not found.' });
  const isEnrolled = req.user ? !!(await Enrollment.exists({ student: req.user._id, course: course._id })) : false;
  const data = course.toObject();
  if (!isEnrolled && (!req.user || (String(course.instructor._id) !== String(req.user._id) && req.user.role !== 'admin'))) data.lessons = data.lessons.map(({ _id, title, description, durationMinutes, order }) => ({ _id, title, description, durationMinutes, order }));
  res.json({ course: data, isEnrolled });
});
exports.createCourse = asyncHandler(async (req, res) => {
  const { title, description, category } = req.body;
  if (!title || !description || !category) return res.status(400).json({ message: 'Title, description and category are required.' });
  const base = slugify(title) || 'course';
  let slug = base, n = 2;
  while (await Course.exists({ slug })) slug = `${base}-${n++}`;
  const course = await Course.create({ ...req.body, slug, instructor: req.user._id, published: false });
  res.status(201).json({ course });
});
exports.updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ message: 'Course not found.' });
  if (String(course.instructor) !== String(req.user._id) && req.user.role !== 'admin') return res.status(403).json({ message: 'Only the course instructor or admin can edit this course.' });
  const allowed = ['title','subtitle','description','category','level','price','thumbnailUrl','published'];
  allowed.forEach(k => { if (req.body[k] !== undefined) course[k] = req.body[k]; });
  if (req.body.title && req.body.title !== course.title) {
    const base = slugify(req.body.title); let slug = base, n = 2;
    while (await Course.exists({ slug, _id: { $ne: course._id } })) slug = `${base}-${n++}`;
    course.slug = slug;
  }
  await course.save(); res.json({ course });
});
exports.deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ message: 'Course not found.' });
  if (String(course.instructor) !== String(req.user._id) && req.user.role !== 'admin') return res.status(403).json({ message: 'Only the course instructor or admin can delete this course.' });
  await Promise.all([course.deleteOne(), Enrollment.deleteMany({ course: course._id }), Review.deleteMany({ course: course._id })]);
  res.json({ message: 'Course and associated enrollments/reviews deleted.' });
});
exports.addLesson = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ message: 'Course not found.' });
  if (String(course.instructor) !== String(req.user._id) && req.user.role !== 'admin') return res.status(403).json({ message: 'Not allowed to manage lessons for this course.' });
  if (!req.body.title) return res.status(400).json({ message: 'Lesson title is required.' });
  course.lessons.push(req.body); await course.save(); res.status(201).json({ course });
});
exports.updateLesson = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ message: 'Course not found.' });
  if (String(course.instructor) !== String(req.user._id) && req.user.role !== 'admin') return res.status(403).json({ message: 'Not allowed to manage lessons for this course.' });
  const lesson = course.lessons.id(req.params.lessonId);
  if (!lesson) return res.status(404).json({ message: 'Lesson not found.' });
  ['title','description','videoUrl','durationMinutes','resources','order'].forEach(k => { if (req.body[k] !== undefined) lesson[k] = req.body[k]; });
  await course.save(); res.json({ lesson });
});
exports.deleteLesson = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ message: 'Course not found.' });
  if (String(course.instructor) !== String(req.user._id) && req.user.role !== 'admin') return res.status(403).json({ message: 'Not allowed to manage lessons for this course.' });
  const lesson = course.lessons.id(req.params.lessonId);
  if (!lesson) return res.status(404).json({ message: 'Lesson not found.' });
  lesson.deleteOne(); await course.save();
  const enrollments = await Enrollment.find({ course: course._id });
  for (const enrollment of enrollments) {
    enrollment.completedLessons = enrollment.completedLessons.filter(id => String(id) !== String(req.params.lessonId));
    enrollment.progressPercent = course.lessons.length ? Math.round(enrollment.completedLessons.length / course.lessons.length * 100) : 0;
    enrollment.completedAt = enrollment.progressPercent === 100 ? (enrollment.completedAt || new Date()) : null;
    await enrollment.save();
  }
  res.json({ message: 'Lesson deleted.' });
});
exports.reviewCourse = asyncHandler(async (req, res) => {
  const { rating, comment = '' } = req.body;
  if (!Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) return res.status(400).json({ message: 'Rating must be an integer from 1 to 5.' });
  const course = await Course.findById(req.params.id);
  if (!course || !course.published) return res.status(404).json({ message: 'Published course not found.' });
  if (!(await Enrollment.exists({ student: req.user._id, course: course._id }))) return res.status(403).json({ message: 'Enroll in the course before reviewing it.' });
  await Review.findOneAndUpdate({ student: req.user._id, course: course._id }, { rating: Number(rating), comment }, { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true });
  const stats = await Review.aggregate([{ $match: { course: course._id } }, { $group: { _id: '$course', average: { $avg: '$rating' }, count: { $sum: 1 } } }]);
  course.averageRating = stats[0]?.average || 0; course.numReviews = stats[0]?.count || 0; await course.save();
  const reviews = await Review.find({ course: course._id }).populate('student', 'name avatarUrl').sort('-createdAt');
  res.json({ averageRating: course.averageRating, numReviews: course.numReviews, reviews });
});
exports.listReviews = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course || !course.published) return res.status(404).json({ message: 'Published course not found.' });
  const reviews = await Review.find({ course: course._id }).populate('student', 'name avatarUrl').sort('-createdAt');
  res.json({ reviews });
});
