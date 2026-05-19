import express from 'express';
import db from '../config/db.js';
import { protect } from '../middleware/authMiddleware.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Middleware to ensure admin
const restrictToAdmin = (req, res, next) => {
  if (req.user.role !== 'super_admin' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Unauthorized. Only Admins can manage enrollments.' });
  }
  next();
};

// Get all enrolled students for a specific course
router.get('/course/:course_id', protect, restrictToAdmin, async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT u.id, u.full_name, u.email 
      FROM enrollments e 
      JOIN users u ON e.student_id = u.id 
      WHERE e.course_id = ?
    `, [req.params.course_id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Sync students for a specific course
router.post('/course/:course_id', protect, restrictToAdmin, async (req, res) => {
  const { student_ids } = req.body; // Array of user ids
  const course_id = req.params.course_id;

  try {
    // 1. Delete existing enrollments for this course
    await db.execute('DELETE FROM enrollments WHERE course_id = ?', [course_id]);

    // 2. Insert new ones
    if (student_ids && Array.isArray(student_ids) && student_ids.length > 0) {
      for (const student_id of student_ids) {
        await db.execute('INSERT INTO enrollments (id, student_id, course_id) VALUES (?, ?, ?)', [uuidv4(), student_id, course_id]);
      }
    }
    res.json({ message: 'Course enrollments synchronized successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all enrolled courses for a specific user
router.get('/user/:user_id', protect, restrictToAdmin, async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT c.id, c.name, c.code 
      FROM enrollments e 
      JOIN courses c ON e.course_id = c.id 
      WHERE e.student_id = ?
    `, [req.params.user_id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Sync courses for a specific student
router.post('/user/:user_id', protect, restrictToAdmin, async (req, res) => {
  const { course_ids } = req.body; // Array of course ids
  const user_id = req.params.user_id;

  try {
    await db.execute('DELETE FROM enrollments WHERE student_id = ?', [user_id]);

    if (course_ids && Array.isArray(course_ids) && course_ids.length > 0) {
      for (const course_id of course_ids) {
        await db.execute('INSERT INTO enrollments (id, student_id, course_id) VALUES (?, ?, ?)', [uuidv4(), user_id, course_id]);
      }
    }
    res.json({ message: 'Student courses synchronized successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
