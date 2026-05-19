import db from './server/config/db.js';

async function show() {
  try {
    const [tables] = await db.execute('SHOW TABLES');
    console.log("Tables:", tables);
    
    try {
      const [cols] = await db.execute('DESCRIBE timetable');
      console.log("Timetable cols:", cols);
    } catch(e) { console.log("no timetable table"); }
    
  } catch (err) { console.log(err); }
  process.exit(0);
}
show();
