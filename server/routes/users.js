import express from 'express';
import db from '../config/db.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Update user
router.put('/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
       return res.status(403).json({ message: 'Forbidden' });
    }

    if (!req.body) {
      return res.status(400).json({ message: 'Request body is missing' });
    }

    const { full_name, email, role, face_descriptor } = req.body;
    const userId = req.params.id;
    
    console.log('Update User Request:', { userId, full_name, email, role, hasDescriptor: !!face_descriptor, hasPhoto: !!(req.files && req.files.photo) });

    let query = 'UPDATE users SET full_name = ?, email = ?, role = ?';
    let params = [full_name, email, role];

    if (face_descriptor && face_descriptor !== 'undefined' && face_descriptor !== 'null') {
      query += ', face_descriptor = ?';
      params.push(face_descriptor);
    }

    // Handle photo upload if present
    if (req.files && req.files.photo) {
      const photo = Array.isArray(req.files.photo) ? req.files.photo[0] : req.files.photo;
      const fileName = `${userId}_${Date.now()}_${photo.name.replace(/\s+/g, '_')}`;
      const uploadPath = `./uploads/${fileName}`;
      
      console.log('Saving photo to:', uploadPath);
      await photo.mv(uploadPath);
      
      query += ', photo_url = ?';
      params.push(`/uploads/${fileName}`);
    }

    query += ' WHERE id = ?';
    params.push(userId);

    const [result] = await db.execute(query, params);
    console.log('Update Result:', result);
    
    res.json({ message: 'User updated successfully' });
  } catch (err) {
    console.error('CRITICAL Update User Error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get all users (Admin only)
router.get('/', protect, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
     return res.status(403).json({ message: 'Forbidden' });
  }

  try {
    const [rows] = await db.execute('SELECT id, full_name, email, role, photo_url, face_descriptor, created_at FROM users ORDER BY created_at DESC');
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
      SELECT DISTINCT cc.course_id, c.name, c.code
      FROM class_students cs
      JOIN class_courses cc ON cs.class_id = cc.class_id
      JOIN courses c ON cc.course_id = c.id
      WHERE cs.student_id = ?
    `, [id]);

    const [attendance] = await db.execute(`
      SELECT a.status, a.created_at as enter_time, s.id as session_id, s.date, s.course_id, c.name as courseName
      FROM attendance a
      JOIN sessions s ON a.session_id = s.id
      JOIN courses c ON s.course_id = c.id
      WHERE a.student_id = ?
      ORDER BY a.created_at DESC
    `, [id]);

    res.json({ enrollments, attendanceData: attendance });
  } catch (err) {
    console.error('Dashboard Error:', err);
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


export default router;
