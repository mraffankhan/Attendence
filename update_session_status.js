import db from './server/config/db.js';

async function updateSchema() {
  try {
    await db.execute("ALTER TABLE sessions ADD COLUMN status ENUM('active', 'completed') DEFAULT 'active'");
    console.log('Added status to sessions');
  } catch (e) {
    if (e.code === 'ER_DUP_COLUMN_NAME') {
        console.log('Column already exists');
    } else {
        console.error(e);
    }
  }

  try {
    await db.execute("ALTER TABLE timetable ADD COLUMN is_active BOOLEAN DEFAULT TRUE");
    console.log('Added is_active to timetable');
  } catch (e) {
    if (e.code === 'ER_DUP_COLUMN_NAME') {
        console.log('Column already exists');
    } else {
        console.error(e);
    }
  }
  
  process.exit(0);
}

updateSchema();
