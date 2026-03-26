-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Create Users Table
-- Note: This table syncs with Supabase's auth.users through your app logic
create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text not null,
  email text,
  role text not null default 'student' check (role in ('student', 'teacher', 'admin', 'super_admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on row level security for users
alter table public.users enable row level security;
-- Allow read access to all authenticated users
create policy "Users are viewable by everyone" on public.users for select using (true);
-- Allow users to insert their own record or admins to insert
create policy "Users can insert their own profile" on public.users for insert with check (true);
create policy "Users can update their own profile" on public.users for update using (auth.uid() = id);

-- 2. Create Courses Table
create table public.courses (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  code text not null unique,
  teacher_id uuid references public.users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.courses enable row level security;
create policy "Courses are viewable by everyone" on public.courses for select using (true);
create policy "Admins/Teachers can insert courses" on public.courses for insert with check (true);
create policy "Admins/Teachers can update courses" on public.courses for update using (true);

-- 3. Create Enrollments Table (Many-to-Many between Students and Courses)
create table public.enrollments (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.users(id) on delete cascade not null,
  course_id uuid references public.courses(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(student_id, course_id) -- A student can only enroll in a course once
);

alter table public.enrollments enable row level security;
create policy "Enrollments are viewable by everyone" on public.enrollments for select using (true);
create policy "Anyone can insert enrollments" on public.enrollments for insert with check (true);
create policy "Anyone can delete enrollments" on public.enrollments for delete using (true);

-- 4. Create Sessions Table (A specific class/lecture occurrence)
create table public.sessions (
  id uuid default uuid_generate_v4() primary key,
  course_id uuid references public.courses(id) on delete cascade not null,
  date timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.sessions enable row level security;
create policy "Sessions are viewable by everyone" on public.sessions for select using (true);
create policy "Anyone can insert sessions" on public.sessions for insert with check (true);

-- 5. Create Attendance Table
create table public.attendance (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.users(id) on delete cascade not null,
  session_id uuid references public.sessions(id) on delete cascade not null,
  status text not null check (status in ('present', 'late', 'absent')),
  enter_time timestamp with time zone default timezone('utc'::text, now()),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(student_id, session_id) -- A student has one attendance record per session
);

alter table public.attendance enable row level security;
create policy "Attendance viewable by everyone" on public.attendance for select using (true);
create policy "Anyone can insert attendance" on public.attendance for insert with check (true);
create policy "Anyone can update attendance" on public.attendance for update using (true);

-- 6. Storage Bucket for face models or images (Optional but good to have)
insert into storage.buckets (id, name, public) 
values ('faces', 'faces', true)
on conflict (id) do nothing;
