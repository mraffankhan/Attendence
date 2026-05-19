import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const fixAttendance = async () => {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'attendance_db'
  });

  try {
    console.log('Syncing attendance and sessions tables...');
    
    // Sessions table sync
    try {
      await pool.query('ALTER TABLE sessions ADD COLUMN IF NOT EXISTS timetable_id VARCHAR(36) AFTER id');
      await pool.query('ALTER TABLE sessions ADD COLUMN IF NOT EXISTS class_id VARCHAR(36) AFTER course_id');
      console.log('Sessions table synced.');
    } catch (e) { console.log('Sessions sync error:', e.message); }

    // Attendance table sync
    try {
      await pool.query('ALTER TABLE attendance ADD COLUMN IF NOT EXISTS method ENUM("manual", "face_recognition") DEFAULT "manual" AFTER status');
      // Change enter_time to created_at or just ensure created_at exists
      await pool.query('ALTER TABLE attendance ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER method');
      console.log('Attendance table synced.');
    } catch (e) { console.log('Attendance sync error:', e.message); }

    console.log('Table sync complete.');
    process.exit(0);
  } catch (err) {
    console.error('Sync error:', err);
    process.exit(1);
  }
};

fixAttendance();
