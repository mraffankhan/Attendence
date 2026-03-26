import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const initDB = async () => {
  try {
    // 1. Connect without database to create it if not exists
    const pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });
    
    console.log('Connecting to MySQL to setup database...');
    await pool.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'attendance_db'}\``);
    console.log('Database ensured.');
    pool.end();

    // 2. Connect with database
    const dbPool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'attendance_db',
      multipleStatements: true
    });

    const schema = fs.readFileSync(path.join(__dirname, 'mysql_schema.sql'), 'utf8');
    
    // Split schema into statements (MySQL driver doesn't always like multiple statements without explicit flag, which we added)
    console.log('Executing schema...');
    await dbPool.query(schema);
    console.log('Tables created successfully.');
    
    dbPool.end();
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

initDB();
