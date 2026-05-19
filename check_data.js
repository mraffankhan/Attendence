import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const checkData = async () => {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'attendance_db'
  });

  try {
    const tables = ['users', 'courses', 'classes', 'timetable', 'enrollments', 'sessions', 'attendance'];
    console.log(`Checking data in database: ${process.env.DB_NAME}`);
    
    for (const table of tables) {
      const [rows] = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
      console.log(`${table}: ${rows[0].count} rows`);
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Check error:', err);
    process.exit(1);
  }
};

checkData();
