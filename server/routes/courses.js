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

// Get classes for a course
router.get('/:id/classes', protect, async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT cl.id, cl.name, cl.code 
      FROM class_courses cc 
      JOIN classes cl ON cc.class_id = cl.id 
      WHERE cc.course_id = ?
    `, [req.params.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Sync classes for a course
router.post('/:id/classes', protect, async (req, res) => {
  const { classIds } = req.body;
  const course_id = req.params.id;
  try {
    if (req.user.role !== 'super_admin' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    await db.execute('DELETE FROM class_courses WHERE course_id = ?', [course_id]);
    if (classIds && classIds.length > 0) {
      for (const classId of classIds) {
        await db.execute('INSERT INTO class_courses (id, class_id, course_id) VALUES (?, ?, ?)', [uuidv4(), classId, course_id]);
      }
    }
    res.json({ message: 'Classes linked successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete course
router.delete('/:id', protect, async (req, res) => {
  if (req.user.role !== 'super_admin' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Unauthorized. Only Admins can delete courses.' });
  }
  try {
    const [result] = await db.execute('DELETE FROM courses WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json({ message: 'Course deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
