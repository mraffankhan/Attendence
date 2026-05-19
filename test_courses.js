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

        const coursesRes = await fetch('http://localhost:5000/api/courses', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${loginData.token}` }
        });
        const coursesData = await coursesRes.text();
        console.log('Courses Response:', coursesRes.status, coursesData);
    } catch(e) {
        console.error(e);
    }
}
test();
