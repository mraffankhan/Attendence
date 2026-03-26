import pg from 'pg';
import fs from 'fs';

const connectionString = 'postgresql://postgres.bsjemninoghnpihlcsal:affan%408050324908@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres';

const pool = new pg.Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

import { createClient } from '@supabase/supabase-js';

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

async function run() {
  try {
    console.log('Fixing auth schema for rnxkhan@gmail.com...');
    await pool.query("DELETE FROM auth.users WHERE email = 'rnxkhan@gmail.com'");
    
    const insertSql = `
    DO $$
    DECLARE
      new_admin_id uuid := gen_random_uuid();
    BEGIN
      INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
        is_sso_user, is_anonymous
      ) VALUES (
        '00000000-0000-0000-0000-000000000000', 
        new_admin_id, 
        'authenticated', 
        'authenticated', 
        'rnxkhan@gmail.com',  
        crypt('khan@2023', gen_salt('bf')), 
        now(), 
        '{"provider":"email","providers":["email"]}'::jsonb, 
        '{"role":"super_admin"}'::jsonb, 
        now(), 
        now(),
        false, false
      );

      INSERT INTO auth.identities (
        provider_id, user_id, identity_data, provider, created_at, updated_at, id
      ) VALUES (
        new_admin_id::text, 
        new_admin_id, 
        format('{"sub":"%s","email":"%s"}', new_admin_id::text, 'rnxkhan@gmail.com')::jsonb, 
        'email', 
        now(), 
        now(),
        gen_random_uuid()
      );

      INSERT INTO public.users (
        id, full_name, email, role, created_at
      ) VALUES (
        new_admin_id, 
        'Super Admin', 
        'rnxkhan@gmail.com', 
        'super_admin', 
        now()
      );
    END $$;
    `;
    await pool.query(insertSql);
    console.log('Fixed! The user rnxkhan@gmail.com is now perfectly formatted in all tables.');
    
  } catch (err) {
    console.error('Fatal Error:', err);
  } finally {
    await pool.end();
  }
}

run();
