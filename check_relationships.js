import db from './server/config/db.js';

async function checkRelationships() {
  try {
    const [cs] = await db.execute('SELECT * FROM class_students');
    const [cc] = await db.execute('SELECT * FROM class_courses');
    const [en] = await db.execute('SELECT * FROM enrollments');
    const [att] = await db.execute('SELECT * FROM attendance');
    
    console.log('class_students:', cs.length, 'rows');
    console.log('class_courses:', cc.length, 'rows');
    console.log('enrollments:', en.length, 'rows');
    console.log('attendance:', att.length, 'rows');
    
    if (cs.length > 0) console.log('Sample Class Student:', cs[0]);
    if (cc.length > 0) console.log('Sample Class Course:', cc[0]);
    if (att.length > 0) console.log('Sample Attendance:', att[0]);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkRelationships();
