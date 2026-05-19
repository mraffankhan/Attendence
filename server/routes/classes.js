import express from 'express';
import db from '../config/db.js';
import { protect } from '../middleware/authMiddleware.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Get classes based on role
router.get('/', protect, async (req, res) => {
  try {
    const { id, role } = req.user;
    if (role === 'super_admin' || role === 'admin') {
      const [rows] = await db.execute(`
        SELECT c.*, 
        (SELECT COUNT(*) FROM class_students cs WHERE cs.class_id = c.id) as student_count,
        (SELECT COUNT(*) FROM class_courses cc WHERE cc.class_id = c.id) as course_count,
        u.full_name as teacher_name
        FROM classes c LEFT JOIN users u ON c.teacher_id = u.id 
        ORDER BY c.created_at DESC
      `);
      return res.json(rows);
    } else if (role === 'teacher') {
      const [rows] = await db.execute(`
        SELECT c.*, 
        (SELECT COUNT(*) FROM class_students cs WHERE cs.class_id = c.id) as student_count,
        (SELECT COUNT(*) FROM class_courses cc WHERE cc.class_id = c.id) as course_count
        FROM classes c WHERE c.teacher_id = ? 
        ORDER BY c.created_at DESC
      `, [id]);
      return res.json(rows);
    } else {
      // For students, get their classes
      const [rows] = await db.execute(`
        SELECT c.*, 
        (SELECT COUNT(*) FROM class_students cs WHERE cs.class_id = c.id) as student_count,
        (SELECT COUNT(*) FROM class_courses cc WHERE cc.class_id = c.id) as course_count,
        u.full_name as teacher_name
        FROM classes c 
        JOIN class_students cs ON c.id = cs.class_id
        LEFT JOIN users u ON c.teacher_id = u.id
        WHERE cs.student_id = ?
        ORDER BY c.created_at DESC
      `, [id]);
      return res.json(rows);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create class
router.post('/', protect, async (req, res) => {
  const { name, code, teacher_id } = req.body;
  try {
    // Check if user has permission (super_admin, admin, or teacher)
    const { role } = req.user;
    if (role !== 'super_admin' && role !== 'admin' && role !== 'teacher') {
      return res.status(403).json({ message: 'Not authorized to create classes' });
    }
    
    const id = uuidv4();
    await db.execute(
      'INSERT INTO classes (id, name, code, teacher_id) VALUES (?, ?, ?, ?)',
      [id, name, code, teacher_id || null]
    );
    res.status(201).json({ id, name, code, teacher_id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Assign students to class
router.post('/:classId/students', protect, async (req, res) => {
  const { classId } = req.params;
  const { studentIds } = req.body;
  try {
    // Check if user has permission
    const { role, id } = req.user;
    if (role !== 'super_admin' && role !== 'admin' && role !== 'teacher') {
      return res.status(403).json({ message: 'Not authorized to manage class students' });
    }
    
    // If teacher, check if they own the class
    if (role === 'teacher') {
      const [classRows] = await db.execute('SELECT teacher_id FROM classes WHERE id = ?', [classId]);
      if (classRows.length === 0 || classRows[0].teacher_id !== id) {
        return res.status(403).json({ message: 'Not authorized to manage this class' });
      }
    }
    
    // Remove existing student assignments first
    await db.execute('DELETE FROM class_students WHERE class_id = ?', [classId]);
    
    // Add new student assignments
    if (studentIds && studentIds.length > 0) {
      const values = studentIds.map(studentId => [uuidv4(), classId, studentId]);
      const placeholders = values.map(() => '(?, ?, ?)').join(', ');
      const flattened = values.flat();
      
      await db.execute(
        `INSERT INTO class_students (id, class_id, student_id) VALUES ${placeholders}`,
        flattened
      );
    }
    
    res.json({ message: 'Students assigned successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Assign courses to class
router.post('/:classId/courses', protect, async (req, res) => {
  const { classId } = req.params;
  const { courseIds } = req.body;
  try {
    // Check if user has permission
    const { role, id } = req.user;
    if (role !== 'super_admin' && role !== 'admin' && role !== 'teacher') {
      return res.status(403).json({ message: 'Not authorized to manage class courses' });
    }
    
    // If teacher, check if they own the class
    if (role === 'teacher') {
      const [classRows] = await db.execute('SELECT teacher_id FROM classes WHERE id = ?', [classId]);
      if (classRows.length === 0 || classRows[0].teacher_id !== id) {
        return res.status(403).json({ message: 'Not authorized to manage this class' });
      }
    }
    
    // Remove existing course assignments first
    await db.execute('DELETE FROM class_courses WHERE class_id = ?', [classId]);
    
    // Add new course assignments
    if (courseIds && courseIds.length > 0) {
      const values = courseIds.map(courseId => [uuidv4(), classId, courseId]);
      const placeholders = values.map(() => '(?, ?, ?)').join(', ');
      const flattened = values.flat();
      
      await db.execute(
        `INSERT INTO class_courses (id, class_id, course_id) VALUES ${placeholders}`,
        flattened
      );
    }
    
    res.json({ message: 'Courses assigned successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get students for a class
router.get('/:classId/students', protect, async (req, res) => {
  try {
    const { classId } = req.params;
    const [rows] = await db.execute(`
      SELECT u.id, u.full_name, u.email 
      FROM class_students cs 
      JOIN users u ON cs.student_id = u.id 
      WHERE cs.class_id = ?
      ORDER BY u.full_name
    `, [classId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get courses for a class
router.get('/:classId/courses', protect, async (req, res) => {
  try {
    const { classId } = req.params;
    const [rows] = await db.execute(`
      SELECT c.id, c.name, c.code, u.full_name as teacher_name
      FROM class_courses cc 
      JOIN courses c ON cc.course_id = c.id
      LEFT JOIN users u ON c.teacher_id = u.id
      WHERE cc.class_id = ?
      ORDER BY c.name
    `, [classId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete class
router.delete('/:id', protect, async (req, res) => {
  const { id } = req.params;
  try {
    // Check if user has permission (super_admin or admin)
    const { role } = req.user;
    if (role !== 'super_admin' && role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete classes' });
    }
    
    await db.execute('DELETE FROM classes WHERE id = ?', [id]);
    res.json({ message: 'Class deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;