import db from './server/config/db.js';

async function test() {
    try {
        const [c] = await db.query('SELECT COUNT(*) as cx FROM courses');
        const [t] = await db.query('SELECT COUNT(*) as tx FROM timetable');
        const [e] = await db.query('SELECT COUNT(*) as ex FROM enrollments');
        const [u] = await db.query('SELECT COUNT(*) as ux FROM users');
        console.log("courses:", c[0].cx, "timetable:", t[0].tx, "enrollments:", e[0].ex, "users:", u[0].ux);
    } catch(e) { console.error(e) }
    process.exit(0);
}
test();
