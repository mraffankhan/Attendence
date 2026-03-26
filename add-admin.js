import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Read .env file manually since node doesn't auto-load it without dotenv
if (fs.existsSync('.env')) {
    const envConfig = fs.readFileSync('.env', 'utf-8');
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) process.env[key.trim()] = value.trim();
    });
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase credentials in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function addAdmin() {
    const { data, error } = await supabase.auth.signUp({
        email: 'rnxkhan@gmail.com',
        password: 'khan@2023',
        options: {
            data: {
                role: 'admin'
            }
        }
    });

    if (error) {
        if (error.message.includes('already registered')) {
            console.log('User rnxkhan@gmail.com is already registered.');
        } else {
            console.error('Error creating user:', error.message);
        }
    } else {
        console.log('Successfully created admin user: rnxkhan@gmail.com with password khan@2023');
    }
}

addAdmin();
