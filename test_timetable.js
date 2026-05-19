import fs from 'fs';

async function test() {
    try {
        // Step 1: Login to get token
        const loginRes = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'riyaz@attend.in', password: 'riyazz' })
        });
        const loginData = await loginRes.json();
        
        console.log('Login Response:', loginRes.status, loginData);
        if (!loginData.token) return;

        // Step 2: Fetch timetable
        const start = Date.now();
        const ttRes = await fetch('http://localhost:5000/api/timetable', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${loginData.token}`
            }
        });
        const ttData = await ttRes.text();
        console.log('Timetable Response:', ttRes.status, ttData);
    } catch(e) {
        console.error(e);
    }
}
test();
