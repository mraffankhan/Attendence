import db from './server/config/db.js';

async function test() {
    try {
        const [rows] = await db.execute(`
            SELECT t.*, c.name as course_name, c.code as course_code,
                   u.full_name as teacher_name
            FROM timetable t 
            JOIN courses c ON t.course_id = c.id
            LEFT JOIN users u ON c.teacher_id = u.id
            ORDER BY t.day_of_week, t.start_time
        `);
        console.log("Admin query success", rows);
    } catch (e) {
        console.error("Admin query failed", e);
    }
    
    try {
        const [rows] = await db.execute(`
            SELECT t.*, c.name as course_name, c.code as course_code
            FROM timetable t 
            JOIN courses c ON t.course_id = c.id
            WHERE c.teacher_id = 'test'
            ORDER BY t.day_of_week, t.start_time
        `);
        console.log("Teacher query success", rows);
    } catch (e) {
        console.error("Teacher query failed", e);
    }

    try {
        const [rows] = await db.execute(`
            SELECT t.*, c.name as course_name, c.code as course_code,
                   u.full_name as teacher_name
            FROM timetable t 
            JOIN courses c ON t.course_id = c.id
            JOIN enrollments e ON c.id = e.course_id
            LEFT JOIN users u ON c.teacher_id = u.id
            WHERE e.student_id = 'test'
            ORDER BY t.day_of_week, t.start_time
        `);
        console.log("Student query success", rows);
    } catch (e) {
        console.error("Student query failed", e);
    }

    process.exit(0);
}

test();
