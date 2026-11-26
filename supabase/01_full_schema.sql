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
-- ==============================================================================
-- School Management System - Security, RLS, Audit Triggers, RPCs & Views
-- ==============================================================================

-- 1. Helper Functions
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role = 'admin'
      and active = true
  );
$$;

create or replace function public.is_teacher()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role = 'teacher'
      and active = true
  );
$$;

-- 2. Audit Trigger Function
create or replace function public.audit_trigger()
returns trigger
language plpgsql
security definer
as $$
declare
  v_row_id uuid;
  v_old jsonb := null;
  v_new jsonb := null;
begin
  if (TG_OP = 'DELETE') then
    v_row_id := OLD.id;
    v_old := to_jsonb(OLD);
  elsif (TG_OP = 'UPDATE') then
    v_row_id := NEW.id;
    v_old := to_jsonb(OLD);
    v_new := to_jsonb(NEW);
  elsif (TG_OP = 'INSERT') then
    v_row_id := NEW.id;
    v_new := to_jsonb(NEW);
  end if;

  insert into public.audit_log (
    table_name,
    row_id,
    action,
    old_data,
    new_data,
    changed_by,
    changed_at
  ) values (
    TG_TABLE_NAME,
    v_row_id,
    TG_OP,
    v_old,
    v_new,
    auth.uid(),
    now()
  );

  return coalesce(NEW, OLD);
end;
$$;

-- Attach Audit Triggers
create trigger trg_audit_students
  after insert or update or delete on public.students
  for each row execute function public.audit_trigger();

create trigger trg_audit_attendance
  after insert or update or delete on public.attendance
  for each row execute function public.audit_trigger();

create trigger trg_audit_marks
  after insert or update or delete on public.marks
  for each row execute function public.audit_trigger();

create trigger trg_audit_fee_payments
  after insert or update or delete on public.fee_payments
  for each row execute function public.audit_trigger();

-- 3. RPC: Teacher Updates Own Profile (Limited Columns)
create or replace function public.update_own_profile(
  p_phone text,
  p_address text,
  p_email text,
  p_qualification text,
  p_photo_path text
)
returns void
language plpgsql
security definer
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  update public.profiles
  set
    phone = coalesce(p_phone, phone),
    address = coalesce(p_address, address),
    email = coalesce(p_email, email),
    qualification = coalesce(p_qualification, qualification),
    photo_path = coalesce(p_photo_path, photo_path)
  where id = auth.uid()
    and active = true;
end;
$$;

-- RPC: Password change completion flag clear
create or replace function public.complete_password_change()
returns void
language plpgsql
security definer
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  update public.profiles
  set must_change_password = false
  where id = auth.uid();
end;
$$;

-- 4. SQL View: 3 or more Consecutive Days Absent Alert (P2)
create or replace view public.absent_in_a_row_alert as
with section_dates as (
  -- Distinct dates when attendance was recorded for a section
  select distinct s.section_id, a.date
  from public.attendance a
  join public.students s on a.student_id = s.id
),
ranked_dates as (
  select
    section_id,
    date,
    dense_rank() over (partition by section_id order by date desc) as day_rank
  from section_dates
),
recent_3_days as (
  select section_id, date
  from ranked_dates
  where day_rank <= 3
),
student_recent_attendance as (
  select
    s.id as student_id,
    s.full_name,
    s.roll_no,
    s.section_id,
    sec.grade,
    sec.name as section_name,
    r3.date,
    coalesce(a.status, 'absent') as status
  from recent_3_days r3
  join public.students s on s.section_id = r3.section_id and s.status = 'active'
  join public.sections sec on sec.id = s.section_id
  left join public.attendance a on a.student_id = s.id and a.date = r3.date
)
select
  student_id,
  full_name,
  roll_no,
  section_id,
  grade,
  section_name,
  count(case when status = 'absent' then 1 end) as consecutive_absent_count
from student_recent_attendance
group by student_id, full_name, roll_no, section_id, grade, section_name
having count(*) = 3 and count(case when status = 'absent' then 1 end) = 3;

-- 5. Enable Row Level Security (RLS) on all tables
alter table public.profiles enable row level security;
alter table public.salary_records enable row level security;
alter table public.sections enable row level security;
alter table public.students enable row level security;
alter table public.student_documents enable row level security;
alter table public.attendance enable row level security;
alter table public.exams enable row level security;
alter table public.marks enable row level security;
alter table public.fee_settings enable row level security;
alter table public.fee_payments enable row level security;
alter table public.period_config enable row level security;
alter table public.timetable_versions enable row level security;
alter table public.timetable_entries enable row level security;
alter table public.events enable row level security;
alter table public.notifications enable row level security;
alter table public.notification_recipients enable row level security;
alter table public.games enable row level security;
alter table public.game_slots enable row level security;
alter table public.sport_registrations enable row level security;
alter table public.expenses enable row level security;
alter table public.audit_log enable row level security;

-- 6. RLS Policies

-- PROFILES
create policy "Admin full access to profiles"
  on public.profiles for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Teachers can read their own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- SALARY RECORDS (Admin only)
create policy "Admin full access to salary records"
  on public.salary_records for all
  using (public.is_admin())
  with check (public.is_admin());

-- SECTIONS
create policy "Admin full access to sections"
  on public.sections for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Teachers can view all sections"
  on public.sections for select
  using (public.is_teacher());

-- STUDENTS
create policy "Admin full access to students"
  on public.students for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Teachers can view all students"
  on public.students for select
  using (public.is_teacher());

-- STUDENT DOCUMENTS
create policy "Admin full access to student documents"
  on public.student_documents for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Teachers can view student documents"
  on public.student_documents for select
  using (public.is_teacher());

-- ATTENDANCE
create policy "Admin full access to attendance"
  on public.attendance for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Teachers can view all attendance"
  on public.attendance for select
  using (public.is_teacher());

create policy "Teachers can insert/update same-day attendance for their section"
  on public.attendance for insert
  with check (
    public.is_teacher()
    and date = current_date
    and exists (
      select 1 from public.students s
      join public.sections sec on sec.id = s.section_id
      where s.id = attendance.student_id
        and sec.class_teacher_id = auth.uid()
    )
  );

create policy "Teachers can update same-day attendance for their section"
  on public.attendance for update
  using (
    public.is_teacher()
    and date = current_date
    and exists (
      select 1 from public.students s
      join public.sections sec on sec.id = s.section_id
      where s.id = attendance.student_id
        and sec.class_teacher_id = auth.uid()
    )
  )
  with check (
    public.is_teacher()
    and date = current_date
  );

-- EXAMS
create policy "Admin full access to exams"
  on public.exams for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Teachers can view all exams"
  on public.exams for select
  using (public.is_teacher());

create policy "Teachers can create exams"
  on public.exams for insert
  with check (
    public.is_teacher()
    and created_by = auth.uid()
  );

create policy "Teachers can update their own exams"
  on public.exams for update
  using (
    public.is_teacher()
    and created_by = auth.uid()
  );

-- MARKS
create policy "Admin full access to marks"
  on public.marks for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Teachers can view all marks"
  on public.marks for select
  using (public.is_teacher());

create policy "Teachers can insert marks for their exams"
  on public.marks for insert
  with check (
    public.is_teacher()
    and exists (
      select 1 from public.exams e
      where e.id = marks.exam_id
        and e.created_by = auth.uid()
    )
  );

create policy "Teachers can update marks for their exams"
  on public.marks for update
  using (
    public.is_teacher()
    and exists (
      select 1 from public.exams e
      where e.id = marks.exam_id
        and e.created_by = auth.uid()
    )
  );

-- FEE SETTINGS (Admin full, Teacher read only)
create policy "Admin full access to fee settings"
  on public.fee_settings for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Teachers can view fee settings"
  on public.fee_settings for select
  using (public.is_teacher());

-- FEE PAYMENTS (Admin full, Teacher read only)
create policy "Admin full access to fee payments"
  on public.fee_payments for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Teachers can view fee payments"
  on public.fee_payments for select
  using (public.is_teacher());

-- PERIOD CONFIG
create policy "Everyone authenticated can view period config"
  on public.period_config for select
  using (auth.role() = 'authenticated');

create policy "Admin full access to period config"
  on public.period_config for all
  using (public.is_admin())
  with check (public.is_admin());

-- TIMETABLE VERSIONS
create policy "Admin full access to timetable versions"
  on public.timetable_versions for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Teachers can view approved timetable versions"
  on public.timetable_versions for select
  using (public.is_teacher() and status = 'approved');

-- TIMETABLE ENTRIES
create policy "Admin full access to timetable entries"
  on public.timetable_entries for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Teachers can view approved timetable entries"
  on public.timetable_entries for select
  using (
    public.is_teacher()
    and exists (
      select 1 from public.timetable_versions v
      where v.id = timetable_entries.version_id
        and v.status = 'approved'
    )
  );

-- EVENTS
create policy "Admin full access to events"
  on public.events for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Teachers can view all events"
  on public.events for select
  using (public.is_teacher());

create policy "Teachers can create events"
  on public.events for insert
  with check (
    public.is_teacher()
    and created_by = auth.uid()
  );

create policy "Teachers can update/delete their own events"
  on public.events for update
  using (public.is_teacher() and created_by = auth.uid());

create policy "Teachers can delete their own events"
  on public.events for delete
  using (public.is_teacher() and created_by = auth.uid());

-- NOTIFICATIONS & RECIPIENTS
create policy "Admin full access to notifications"
  on public.notifications for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Teachers can view all notifications"
  on public.notifications for select
  using (public.is_teacher());

create policy "Teachers can create notifications"
  on public.notifications for insert
  with check (public.is_teacher() and created_by = auth.uid());

create policy "Admin full access to notification recipients"
  on public.notification_recipients for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Teachers can view and update their own notification receipt"
  on public.notification_recipients for select
  using (public.is_teacher() and teacher_id = auth.uid());

create policy "Teachers can update their own notification read status"
  on public.notification_recipients for update
  using (public.is_teacher() and teacher_id = auth.uid());

-- GAMES & SLOTS
create policy "Admin full access to games"
  on public.games for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Teachers can view games"
  on public.games for select
  using (public.is_teacher());

create policy "Admin full access to game slots"
  on public.game_slots for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Teachers can view game slots"
  on public.game_slots for select
  using (public.is_teacher());

-- SPORT REGISTRATIONS
create policy "Admin full access to sport registrations"
  on public.sport_registrations for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Teachers can view all sport registrations"
  on public.sport_registrations for select
  using (public.is_teacher());

create policy "Teachers can register students for sports"
  on public.sport_registrations for insert
  with check (public.is_teacher() and registered_by = auth.uid());

-- EXPENSES (Admin only)
create policy "Admin full access to expenses"
  on public.expenses for all
  using (public.is_admin())
  with check (public.is_admin());

-- AUDIT LOG (Admin read only)
create policy "Admin can view audit log"
  on public.audit_log for select
  using (public.is_admin());
