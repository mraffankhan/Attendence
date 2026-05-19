import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const alterDB = async () => {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'attendance_db'
  });

  try {
    console.log('Adding missing columns to users table...');
    // Check if columns exist first or just try to add and catch error
    try {
      await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS photo_url TEXT AFTER role');
      console.log('photo_url column ensured.');
    } catch (e) { console.log('photo_url might already exist or error:', e.message); }

    try {
      await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS face_descriptor JSON AFTER photo_url');
      console.log('face_descriptor column ensured.');
    } catch (e) { console.log('face_descriptor might already exist or error:', e.message); }

    console.log('Database migration complete.');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
};

alterDB();
