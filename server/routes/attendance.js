import express from 'express';
import db from '../config/db.js';
import { protect } from '../middleware/authMiddleware.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Get students for a specific course/class for attendance monitoring
router.get('/monitor/:class_id', protect, async (req, res) => {
  try {
    const { class_id } = req.params;
    const { session_id } = req.query;

    let query = `
      SELECT u.id, u.full_name, u.email, u.photo_url, u.face_descriptor
      FROM users u
      JOIN class_students cs ON u.id = cs.student_id
      WHERE cs.class_id = ? AND u.role = 'student'
    `;
    const params = [class_id];

    if (session_id) {
        query += ` AND u.id NOT IN (SELECT student_id FROM attendance WHERE session_id = ?)`;
        params.push(session_id);
    }

    const [rows] = await db.execute(query, params);
    
    // Parse face descriptors from JSON if they exist
    const students = rows.map(s => ({
      ...s,
      face_descriptor: s.face_descriptor ? (typeof s.face_descriptor === 'string' ? JSON.parse(s.face_descriptor) : s.face_descriptor) : null
    }));
    
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Start or get session for attendance
router.post('/session', protect, async (req, res) => {
  const { timetable_id, course_id, class_id, date } = req.body;
  const sessionDate = date || new Date().toISOString().split('T')[0];
  
  try {
    // Check if session exists for this date and slot/class
    const [existing] = await db.execute(
      'SELECT id FROM sessions WHERE course_id = ? AND class_id = ? AND date = ?',
      [course_id, class_id, sessionDate]
    );

    if (existing.length > 0) {
      return res.json({ id: existing[0].id, isNew: false });
    }

    const id = uuidv4();
    await db.execute(
      'INSERT INTO sessions (id, timetable_id, course_id, class_id, date, status) VALUES (?, ?, ?, ?, ?, ?)',
      [id, timetable_id || null, course_id, class_id, sessionDate, 'active']
    );
    
    res.status(201).json({ id, isNew: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Finalize session: Mark remaining as absent
router.post('/finalize', protect, async (req, res) => {
  const { session_id } = req.body;
  try {
    const [session] = await db.execute('SELECT class_id FROM sessions WHERE id = ?', [session_id]);
    if (session.length === 0) return res.status(404).json({ message: 'Session not found' });
    
    const classId = session[0].class_id;

    // Insert 'absent' for students in this class who don't have attendance record for this session
    await db.execute(`
      INSERT INTO attendance (id, session_id, student_id, status, method)
      SELECT UUID(), ?, cs.student_id, 'absent', 'automatic'
      FROM class_students cs
      WHERE cs.class_id = ? AND cs.student_id NOT IN (
        SELECT student_id FROM attendance WHERE session_id = ?
      )
    `, [session_id, classId, session_id]);

    // Mark session as completed
    await db.execute('UPDATE sessions SET status = \'completed\' WHERE id = ?', [session_id]);

    res.json({ message: 'Session finalized. Absentees marked.' });
  } catch (err) {
    console.error('Finalize error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Student self-marking (if active session exists)
router.post('/self-mark', protect, async (req, res) => {
  const studentId = req.user.id;
  try {
    // Find active session for this student's class today
    const [session] = await db.execute(`
      SELECT s.id, s.course_id 
      FROM sessions s
      JOIN class_students cs ON s.class_id = cs.class_id
      WHERE cs.student_id = ? AND s.status = 'active' AND s.date = CURDATE()
      LIMIT 1
    `, [studentId]);

    if (session.length === 0) {
      return res.status(400).json({ message: 'No active session found for your class right now.' });
    }

    const sessionId = session[0].id;
    const attId = uuidv4();

    await db.execute(`
      INSERT INTO attendance (id, session_id, student_id, status, method)
      VALUES (?, ?, ?, 'present', 'self')
      ON DUPLICATE KEY UPDATE status = 'present', method = 'self'
    `, [attId, sessionId, studentId]);

    res.json({ message: 'Attendance marked successfully!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Record attendance (Mark Student Present)
router.post('/mark', protect, async (req, res) => {
  const { session_id, student_id, method, status } = req.body;
  
  try {
    const id = uuidv4();
    await db.execute(`
      INSERT INTO attendance (id, session_id, student_id, status, method)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE status = VALUES(status), method = VALUES(method)
    `, [id, session_id, student_id, status || 'present', method || 'manual']);
    
    res.json({ message: 'Attendance recorded' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get session attendance summary
router.get('/session/:session_id', protect, async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT a.*, u.full_name, u.email
      FROM attendance a
      JOIN users u ON a.student_id = u.id
      WHERE a.session_id = ?
    `, [req.params.session_id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
