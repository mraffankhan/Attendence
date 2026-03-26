import db from './server/config/db.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const createInitialAdmin = async () => {
  try {
    const email = 'riyaz@attend.in';
    const password = 'riyazz';
    const fullName = 'Riyaz Admin';

    // Check if exists
    const [existing] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      console.log('User already exists!');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const id = uuidv4();

    await db.execute(
      'INSERT INTO users (id, full_name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
      [id, fullName, email, password_hash, 'super_admin']
    );

    console.log(`Successfully created Super Admin: ${email} with password: ${password}`);
    process.exit(0);
  } catch (err) {
    console.error('Failed to create admin:', err);
    process.exit(1);
  }
};

createInitialAdmin();
