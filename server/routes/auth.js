import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import db from '../config/db.js';
import { protect } from '../middleware/authMiddleware.js';
import path from 'path';

const router = express.Router();

const generateToken = (id, role, email) => {
  return jwt.sign({ id, role, email }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Login user
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(401).json({ message: 'Invalid credentials' });
    
    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
    
    const token = generateToken(user.id, user.role, user.email);
    res.json({
      user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin-only registration
router.post('/register', protect, async (req, res) => {
  if (req.user.role !== 'super_admin' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Unauthorized. Only Admins can create accounts.' });
  }

  const { full_name, email, password, role, face_descriptor } = req.body;
  let photo_url = null;

  try {
    if (req.files && req.files.photo) {
      const photo = Array.isArray(req.files.photo) ? req.files.photo[0] : req.files.photo;
      const fileName = `${uuidv4()}${path.extname(photo.name)}`;
      const uploadPath = path.join(process.cwd(), 'uploads', fileName);
      
      await photo.mv(uploadPath);
      photo_url = `/uploads/${fileName}`;
    }

    const [existing] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(400).json({ message: 'User already exists' });
    
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    
    const id = uuidv4();
    
    let processedDescriptor = null;
    if (face_descriptor && face_descriptor !== 'undefined' && face_descriptor !== 'null') {
      processedDescriptor = typeof face_descriptor === 'string' ? face_descriptor : JSON.stringify(face_descriptor);
    }

    await db.execute(
      'INSERT INTO users (id, full_name, email, password_hash, role, photo_url, face_descriptor) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, full_name, email, password_hash, role || 'student', photo_url, processedDescriptor]
    );
    
    res.status(201).json({ message: 'User created', id });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get current user session
router.get('/me', async (req, res) => {
  let token = req.headers.authorization;
  if (token && token.startsWith('Bearer')) {
    try {
      token = token.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const [rows] = await db.execute('SELECT id, full_name, email, role, created_at FROM users WHERE id = ?', [decoded.id]);
      if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
      
      res.json({ user: rows[0] });
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
});

export default router;
