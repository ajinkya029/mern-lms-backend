const router = require('express').Router();
const c = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/authMiddleware');
router.get('/', c.listCourses);
router.get('/:id', (req, res, next) => { // Optional auth allows enrolled students to access lesson URLs.
  const header = req.headers.authorization;
  if (!header) return c.getCourse(req, res, next);
  protect(req, res, next);
}, c.getCourse);
router.post('/', protect, authorize('instructor','admin'), c.createCourse);
router.patch('/:id', protect, authorize('instructor','admin'), c.updateCourse);
router.delete('/:id', protect, authorize('instructor','admin'), c.deleteCourse);
router.post('/:id/lessons', protect, authorize('instructor','admin'), c.addLesson);
router.patch('/:id/lessons/:lessonId', protect, authorize('instructor','admin'), c.updateLesson);
router.delete('/:id/lessons/:lessonId', protect, authorize('instructor','admin'), c.deleteLesson);
router.get('/:id/reviews', c.listReviews);
router.post('/:id/reviews', protect, authorize('student','admin'), c.reviewCourse);
module.exports = router;
