import fs from 'fs';

async function test() {
    try {
        const loginRes = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'riyaz@attend.in', password: 'riyazz' })
        });
        const loginData = await loginRes.json();
        if (!loginData.token) return console.error('Login failed');

        // First we realistically need a course ID!
        const courseRes = await fetch('http://localhost:5000/api/courses', {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${loginData.token}`,
                'Content-Type': 'application/json'
             },
            body: JSON.stringify({ name: 'Test Course', code: 'TEST101' })
        });
        const courseCode = courseRes.status;
        let courseData = {};
        if (courseCode === 201) {
            courseData = await courseRes.json();
        } else {
            console.error("Course failed", await courseRes.text());
        }

        const ttRes = await fetch('http://localhost:5000/api/timetable', {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${loginData.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                course_id: courseData.id || 'fake-id',
                day_of_week: 1,
                start_time: '10:00',
                end_time: '11:00',
                room: 'Room 101'
            })
        });
        const ttData = await ttRes.text();
        console.log('POST Timetable Response:', ttRes.status, ttData);
    } catch(e) {
        console.error(e);
    }
}
test();
