import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

let envUrl, envAnon;
if (fs.existsSync('.env')) {
    const envConfig = fs.readFileSync('.env', 'utf-8');
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            if (key.trim() === 'VITE_SUPABASE_URL') envUrl = value.trim();
            if (key.trim() === 'VITE_SUPABASE_ANON_KEY') envAnon = value.trim();
        }
    });
}

const supabase = createClient(envUrl, envAnon);

async function testSignup() {
    console.log('Testing fresh signup...');
    const { data, error } = await supabase.auth.signUp({
        email: 'testadmin999@gmail.com',
        password: 'Password123!',
    });
    
    if (error) {
        console.error('Signup Error:', error.message);
    } else {
        console.log('Signup Success:', data.user?.id);
        
        // Test login right away
        const { error: loginErr } = await supabase.auth.signInWithPassword({
            email: 'testadmin999@gmail.com',
            password: 'Password123!',
        });
        if (loginErr) console.error('Login Error:', loginErr.message);
        else console.log('Login Success!');
    }
}

testSignup();
