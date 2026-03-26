import express from 'express';
import db from '../config/db.js';
import { protect } from '../middleware/authMiddleware.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Get sessions for a course
router.get('/sessions/:course_id', protect, async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM sessions WHERE course_id = ? ORDER BY date DESC', [req.params.course_id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a session
router.post('/sessions', protect, async (req, res) => {
  const { course_id, date } = req.body;
  try {
    const id = uuidv4();
    await db.execute('INSERT INTO sessions (id, course_id, date) VALUES (?, ?, ?)', [id, course_id, date || new Date()]);
    res.status(201).json({ id, course_id, date });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
