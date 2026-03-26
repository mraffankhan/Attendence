import express from 'express';
import db from '../config/db.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all users (Admin only)
router.get('/', protect, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
     return res.status(403).json({ message: 'Forbidden' });
  }

  try {
    const [rows] = await db.execute('SELECT id, full_name, email, role, created_at FROM users ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get student dashboard stats
router.get('/dashboard', protect, async (req, res) => {
  try {
    const { id } = req.user;
    
    const [enrollments] = await db.execute(`
      SELECT e.course_id, c.name, c.code
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE e.student_id = ?
    `, [id]);

    const [attendance] = await db.execute(`
      SELECT a.status, a.enter_time, s.id as session_id, s.date, s.course_id, c.name as courseName
      FROM attendance a
      JOIN sessions s ON a.session_id = s.id
      JOIN courses c ON s.course_id = c.id
      WHERE a.student_id = ?
      ORDER BY a.enter_time DESC
    `, [id]);

    res.json({ enrollments, attendanceData: attendance });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a user
router.delete('/:id', protect, async (req, res) => {
  try {
    await db.execute('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'User removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a user role/name
router.put('/:id', protect, async (req, res) => {
  const { full_name, role } = req.body;
  try {
    await db.execute('UPDATE users SET full_name = ?, role = ? WHERE id = ?', [full_name, role, req.params.id]);
    res.json({ message: 'User updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
