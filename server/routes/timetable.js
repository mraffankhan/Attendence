import express from 'express';
import db from '../config/db.js';
import { protect } from '../middleware/authMiddleware.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Get timetable for a course
router.get('/:course_id', protect, async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM timetable WHERE course_id = ? ORDER BY day_of_week, start_time',
      [req.params.course_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all timetable (context-aware based on role)
router.get('/', protect, async (req, res) => {
  try {
    const { id, role } = req.user;
    
    if (role === 'super_admin' || role === 'admin') {
      const [rows] = await db.execute(`
        SELECT t.*, c.name as course_name, c.code as course_code,
               u.full_name as course_teacher_name,
               u2.full_name as slot_teacher_name,
               cl.name as class_name,
               s.status as session_status
        FROM timetable t 
        JOIN courses c ON t.course_id = c.id
        LEFT JOIN classes cl ON t.class_id = cl.id
        LEFT JOIN users u ON c.teacher_id = u.id
        LEFT JOIN users u2 ON t.teacher_id = u2.id
        LEFT JOIN sessions s ON t.id = s.timetable_id AND s.date = CURDATE()
        ORDER BY t.day_of_week, t.start_time
      `);
      return res.json(rows);
    } else if (role === 'teacher') {
      const [rows] = await db.execute(`
        SELECT t.*, c.name as course_name, c.code as course_code,
               u2.full_name as slot_teacher_name,
               cl.name as class_name,
               s.status as session_status
        FROM timetable t 
        JOIN courses c ON t.course_id = c.id
        LEFT JOIN classes cl ON t.class_id = cl.id
        LEFT JOIN users u2 ON t.teacher_id = u2.id
        LEFT JOIN sessions s ON t.id = s.timetable_id AND s.date = CURDATE()
        WHERE c.teacher_id = ? OR t.teacher_id = ? OR cl.teacher_id = ?
        ORDER BY t.day_of_week, t.start_time
      `, [id, id, id]);
      return res.json(rows);
    } else {
      const [rows] = await db.execute(`
        SELECT t.*, c.name as course_name, c.code as course_code,
               u.full_name as course_teacher_name,
               u2.full_name as slot_teacher_name,
               cl.name as class_name,
               s.status as session_status
        FROM timetable t 
        JOIN courses c ON t.course_id = c.id
        JOIN class_students cs ON t.class_id = cs.class_id
        LEFT JOIN classes cl ON t.class_id = cl.id
        LEFT JOIN users u ON c.teacher_id = u.id
        LEFT JOIN users u2 ON t.teacher_id = u2.id
        LEFT JOIN sessions s ON t.id = s.timetable_id AND s.date = CURDATE()
        WHERE cs.student_id = ?
        ORDER BY t.day_of_week, t.start_time
      `, [id]);
      return res.json(rows);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create timetable slot
router.post('/', protect, async (req, res) => {
  if (req.user.role !== 'super_admin' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Unauthorized. Only Admins can manage timetables.' });
  }
  const { class_id, course_id, day_of_week, start_time, end_time, room, teacher_id } = req.body;
  
  // Validate input
  if (!class_id || !course_id || day_of_week === undefined || !start_time || !end_time) {
    return res.status(400).json({ message: 'Class ID, Course ID, day of week, start time, and end time are required' });
  }
  
  try {
    const id = uuidv4();
    await db.execute(
      'INSERT INTO timetable (id, class_id, course_id, day_of_week, start_time, end_time, room, teacher_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, class_id, course_id, day_of_week, start_time, end_time, room || null, teacher_id || null]
    );
    res.status(201).json({ id, class_id, course_id, day_of_week, start_time, end_time, room, teacher_id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update timetable slot
router.put('/:id', protect, async (req, res) => {
  if (req.user.role !== 'super_admin' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Unauthorized. Only Admins can manage timetables.' });
  }
  const { class_id, day_of_week, start_time, end_time, room, teacher_id } = req.body;
  
  try {
    const [result] = await db.execute(
      'UPDATE timetable SET class_id = ?, day_of_week = ?, start_time = ?, end_time = ?, room = ?, teacher_id = ? WHERE id = ?',
      [class_id || null, day_of_week, start_time, end_time, room || null, teacher_id || null, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Timetable slot not found' });
    }
    
    res.json({ message: 'Timetable slot updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete timetable slot
router.delete('/:id', protect, async (req, res) => {
  if (req.user.role !== 'super_admin' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Unauthorized. Only Admins can manage timetables.' });
  }
  try {
    const [result] = await db.execute('DELETE FROM timetable WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Timetable slot not found' });
    }
    
    res.json({ message: 'Timetable slot deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;