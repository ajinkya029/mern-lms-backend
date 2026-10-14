const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const asyncHandler = require('../utils/asyncHandler');

exports.enroll = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course || !course.published) return res.status(404).json({ message: 'Published course not found.' });
  if (String(course.instructor) === String(req.user._id)) return res.status(400).json({ message: 'Instructors cannot enroll in their own course.' });
  const enrollment = await Enrollment.findOneAndUpdate({ student: req.user._id, course: course._id }, { $setOnInsert: { student: req.user._id, course: course._id } }, { upsert: true, new: true, runValidators: true }).populate('course', 'title slug thumbnailUrl lessons.title lessons.durationMinutes instructor');
  res.status(201).json({ enrollment });
});
exports.myEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({ student: req.user._id }).populate({ path: 'course', select: 'title slug subtitle thumbnailUrl category level instructor lessons.title lessons.durationMinutes', populate: { path: 'instructor', select: 'name' } }).sort('-createdAt');
  res.json({ enrollments });
});
exports.courseStudents = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) return res.status(404).json({ message: 'Course not found.' });
  if (String(course.instructor) !== String(req.user._id) && req.user.role !== 'admin') return res.status(403).json({ message: 'Only the instructor or admin can view the class roster.' });
  const enrollments = await Enrollment.find({ course: course._id }).populate('student', 'name email avatarUrl').sort('-createdAt');
  res.json({ enrollments });
});
exports.markLessonComplete = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findOne({ student: req.user._id, course: req.params.courseId });
  if (!enrollment) return res.status(404).json({ message: 'You are not enrolled in this course.' });
  const course = await Course.findById(req.params.courseId);
  if (!course) return res.status(404).json({ message: 'Course not found.' });
  const lessonExists = course.lessons.some(lesson => String(lesson._id) === String(req.params.lessonId));
  if (!lessonExists) return res.status(404).json({ message: 'Lesson not found in this course.' });
  if (!enrollment.completedLessons.some(id => String(id) === String(req.params.lessonId))) enrollment.completedLessons.push(req.params.lessonId);
  enrollment.progressPercent = course.lessons.length ? Math.round(enrollment.completedLessons.length / course.lessons.length * 100) : 0;
  enrollment.completedAt = enrollment.progressPercent === 100 ? (enrollment.completedAt || new Date()) : null;
  await enrollment.save(); res.json({ enrollment });
});
exports.unmarkLessonComplete = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findOne({ student: req.user._id, course: req.params.courseId });
  if (!enrollment) return res.status(404).json({ message: 'You are not enrolled in this course.' });
  enrollment.completedLessons = enrollment.completedLessons.filter(id => String(id) !== String(req.params.lessonId));
  const course = await Course.findById(req.params.courseId);
  enrollment.progressPercent = course && course.lessons.length ? Math.round(enrollment.completedLessons.length / course.lessons.length * 100) : 0;
  enrollment.completedAt = null; await enrollment.save(); res.json({ enrollment });
});
