import fs from 'fs';

async function test() {
    try {
        const res = await fetch('http://localhost:5173/src/pages/superadmin/Timetable.jsx');
        console.log("Timetable Status:", res.status);
    } catch(e) { console.error(e) }
    
    try {
        const res2 = await fetch('http://localhost:5173/src/pages/TimetableView.jsx');
        console.log("TimetableView Status:", res2.status);
    } catch(e) { console.error(e) }

    try {
        const res3 = await fetch('http://localhost:5173/src/App.jsx');
        console.log("App Status:", res3.status);
    } catch(e) { console.error(e) }
}
test();
