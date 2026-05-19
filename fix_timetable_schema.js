import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const fixTimetable = async () => {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'attendance_db'
  });

  try {
    console.log('Syncing timetable table...');
    try {
      await pool.query('ALTER TABLE timetable ADD COLUMN IF NOT EXISTS class_id VARCHAR(36) AFTER course_id');
      console.log('Timetable table synced.');
    } catch (e) { console.log('Timetable sync error:', e.message); }

    process.exit(0);
  } catch (err) {
    console.error('Sync error:', err);
    process.exit(1);
  }
};

fixTimetable();
