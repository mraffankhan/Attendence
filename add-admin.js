import { createClient } from '@supabase/supabase-js';

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
