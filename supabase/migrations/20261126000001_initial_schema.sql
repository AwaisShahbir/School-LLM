-- ==============================================================================
-- School Management System - Schema Migration
-- ==============================================================================

-- 1. Enums
create type user_role as enum ('admin', 'teacher');
create type attendance_status as enum ('present', 'absent', 'late', 'leave');
create type exam_type as enum ('weekly', 'monthly', 'term', 'annual');
create type student_status as enum ('active', 'left', 'passed_out');
create type version_status as enum ('draft', 'proposed', 'approved');

-- 2. Profiles (Admin & Teachers)
create table profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    role user_role not null,
    full_name text not null,
    cnic text unique,
    phone text,
    email text,
    address text,
    qualification text,
    photo_path text,
    subject text,
    joining_date date default current_date,
    resignation_date date,
    active boolean default true,
    must_change_password boolean default true,
    created_at timestamptz default now()
);

-- 3. Teacher Salary Records (Admin only)
create table salary_records (
    id uuid primary key default gen_random_uuid(),
    teacher_id uuid not null references profiles(id) on delete cascade,
    month date not null, -- First day of month (e.g. 2026-11-01)
    amount numeric not null,
    note text,
    created_at timestamptz default now(),
    unique (teacher_id, month)
);

-- 4. Sections (Grades 6-10, Sections A, B, C)
create table sections (
    id uuid primary key default gen_random_uuid(),
    grade int not null check (grade between 6 and 10),
    name text not null, -- 'A', 'B', 'C'
    class_teacher_id uuid references profiles(id) on delete set null,
    unique (grade, name)
);

-- 5. Students
create table students (
    id uuid primary key default gen_random_uuid(),
    section_id uuid not null references sections(id) on delete restrict,
    roll_no int not null,
    full_name text not null,
    father_name text,
    b_form text,
    dob date,
    address text,
    phone1 text,
    phone2 text,
    admission_date date default current_date,
    status student_status default 'active',
    left_date date,
    created_at timestamptz default now(),
    unique (section_id, roll_no)
);

create index idx_students_section_roll on students (section_id, roll_no);
create index idx_students_status on students (status);

-- 6. Student Documents (Private storage references)
create table student_documents (
    id uuid primary key default gen_random_uuid(),
    student_id uuid not null references students(id) on delete cascade,
    label text not null,
    storage_path text not null,
    created_at timestamptz default now()
);

-- 7. Daily Attendance
create table attendance (
    id uuid primary key default gen_random_uuid(),
    student_id uuid not null references students(id) on delete cascade,
    date date not null,
    status attendance_status not null,
    marked_by uuid references profiles(id) on delete set null,
    created_at timestamptz default now(),
    unique (student_id, date)
);

create index idx_attendance_date on attendance (date);
create index idx_attendance_student_date on attendance (student_id, date);

-- 8. Exams
create table exams (
    id uuid primary key default gen_random_uuid(),
    section_id uuid not null references sections(id) on delete cascade,
    subject text not null,
    type exam_type not null,
    title text,
    total_marks numeric not null check (total_marks > 0),
    exam_date date not null,
    created_by uuid references profiles(id) on delete set null,
    created_at timestamptz default now()
);

-- 9. Marks
create table marks (
    id uuid primary key default gen_random_uuid(),
    exam_id uuid not null references exams(id) on delete cascade,
    student_id uuid not null references students(id) on delete cascade,
    obtained numeric check (obtained >= 0),
    absent boolean default false,
    updated_by uuid references profiles(id) on delete set null,
    updated_at timestamptz default now(),
    unique (exam_id, student_id)
);

-- 10. Fee Settings
create table fee_settings (
    id uuid primary key default gen_random_uuid(),
    monthly_amount numeric not null check (monthly_amount >= 0),
    effective_from date not null,
    created_at timestamptz default now()
);

-- 11. Fee Payments
create table fee_payments (
    id uuid primary key default gen_random_uuid(),
    student_id uuid not null references students(id) on delete cascade,
    month date not null, -- First day of month (e.g. 2026-11-01)
    status text not null check (status in ('paid', 'pending')) default 'pending',
    paid_on date,
    amount numeric check (amount >= 0),
    recorded_by uuid references profiles(id) on delete set null,
    created_at timestamptz default now(),
    unique (student_id, month)
);

-- 12. Period Configuration
create table period_config (
    period_no int primary key,
    start_time time not null,
    end_time time not null
);

-- 13. Timetable Versions
create table timetable_versions (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    status version_status default 'draft',
    created_by uuid references profiles(id) on delete set null,
    created_at timestamptz default now()
);

-- 14. Timetable Entries
create table timetable_entries (
    id uuid primary key default gen_random_uuid(),
    version_id uuid not null references timetable_versions(id) on delete cascade,
    section_id uuid not null references sections(id) on delete cascade,
    day int not null check (day between 1 and 6), -- 1: Monday ... 6: Saturday
    period_no int not null references period_config(period_no) on delete cascade,
    subject text not null,
    teacher_id uuid references profiles(id) on delete set null,
    unique (version_id, section_id, day, period_no),
    unique (version_id, teacher_id, day, period_no) -- Blocks double-booking a teacher
);

-- 15. Calendar & Events
create table events (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    description text,
    start_date date not null,
    end_date date,
    created_by uuid references profiles(id) on delete set null,
    created_at timestamptz default now()
);

-- 16. In-App Notifications
create table notifications (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    body text not null,
    audience text default 'all', -- 'all' or 'selected'
    created_by uuid references profiles(id) on delete set null,
    created_at timestamptz default now()
);

create table notification_recipients (
    notification_id uuid not null references notifications(id) on delete cascade,
    teacher_id uuid not null references profiles(id) on delete cascade,
    read_at timestamptz,
    primary key (notification_id, teacher_id)
);

-- 17. Sports & Games
create table games (
    id uuid primary key default gen_random_uuid(),
    name text unique not null,
    created_at timestamptz default now()
);

create table game_slots (
    id uuid primary key default gen_random_uuid(),
    game_id uuid not null references games(id) on delete cascade,
    label text not null,
    capacity int not null check (capacity > 0),
    created_at timestamptz default now()
);

create table sport_registrations (
    id uuid primary key default gen_random_uuid(),
    slot_id uuid not null references game_slots(id) on delete cascade,
    student_id uuid not null references students(id) on delete cascade,
    details text,
    registered_by uuid references profiles(id) on delete set null,
    created_at timestamptz default now(),
    unique (slot_id, student_id)
);

-- 18. School Expenses
create table expenses (
    id uuid primary key default gen_random_uuid(),
    date date not null default current_date,
    category text not null,
    amount numeric not null check (amount >= 0),
    note text,
    created_by uuid references profiles(id) on delete set null,
    created_at timestamptz default now()
);

-- 19. Audit Log
create table audit_log (
    id bigserial primary key,
    table_name text not null,
    row_id uuid not null,
    action text not null, -- 'INSERT', 'UPDATE', 'DELETE'
    old_data jsonb,
    new_data jsonb,
    changed_by uuid references profiles(id) on delete set null,
    changed_at timestamptz default now()
);
