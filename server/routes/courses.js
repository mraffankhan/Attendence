import express from 'express';
import db from '../config/db.js';
import { protect } from '../middleware/authMiddleware.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Get courses based on role
router.get('/', protect, async (req, res) => {
  try {
    const { id, role } = req.user;
    if (role === 'super_admin' || role === 'admin') {
      const [rows] = await db.execute(`
        SELECT c.*, u.full_name as teacher_name, 
        (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) as students
        FROM courses c LEFT JOIN users u ON c.teacher_id = u.id ORDER BY c.created_at DESC
      `);
      return res.json(rows);
    } else if (role === 'teacher') {
      const [rows] = await db.execute(`
        SELECT c.*, (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) as students
        FROM courses c WHERE c.teacher_id = ? ORDER BY c.created_at DESC
      `, [id]);
      return res.json(rows);
    } else {
      const [rows] = await db.execute(`
        SELECT c.*, (SELECT COUNT(*) FROM enrollments e2 WHERE e2.course_id = c.id) as students
        FROM courses c JOIN enrollments e ON c.id = e.course_id WHERE e.student_id = ? ORDER BY c.created_at DESC
      `, [id]);
      return res.json(rows);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create course
router.post('/', protect, async (req, res) => {
  const { name, code, teacher_id } = req.body;
  try {
    const id = uuidv4();
    await db.execute(
      'INSERT INTO courses (id, name, code, teacher_id) VALUES (?, ?, ?, ?)',
      [id, name, code, teacher_id || null]
    );
    res.status(201).json({ id, name, code, teacher_id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
