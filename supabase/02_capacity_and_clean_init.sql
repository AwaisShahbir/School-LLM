-- ==============================================================================
-- School Management System - Clean Dynamic System Initialization
-- (ZERO pre-loaded teachers, ZERO pre-loaded students, ZERO pre-loaded sections)
-- Administrator creates all sections, teachers, and students dynamically.
-- ==============================================================================

-- 1. Enforce Maximum 1,000 Active Students Capacity
create or replace function public.check_student_capacity_limit()
returns trigger
language plpgsql
as $$
declare
  active_student_count integer;
begin
  if (TG_OP = 'INSERT' and (NEW.status is null or NEW.status = 'active'))
     or (TG_OP = 'UPDATE' and coalesce(OLD.status, 'active') <> 'active' and NEW.status = 'active') then
     
    select count(*) into active_student_count
    from public.students
    where status = 'active';

    if active_student_count >= 1000 then
      raise exception 'Student capacity limit reached! The school database is restricted to a maximum of 1,000 active students (currently active: %).', active_student_count
        using errcode = 'check_violation';
    end if;
  end if;

  return NEW;
end;
$$;

drop trigger if exists trg_enforce_student_capacity on public.students;
create trigger trg_enforce_student_capacity
before insert or update on public.students
for each row
execute function public.check_student_capacity_limit();

-- 2. Allow Flexible Grades (Classes 1 to 12) in Sections
alter table public.sections drop constraint if exists sections_grade_check;
alter table public.sections add constraint sections_grade_check check (grade between 1 and 12);

-- 3. Default Period Timings (Bell Schedule for Timetable)
insert into public.period_config (period_no, start_time, end_time) values
  (1, '08:00:00', '08:45:00'),
  (2, '08:45:00', '09:30:00'),
  (3, '09:30:00', '10:15:00'),
  (4, '10:30:00', '11:15:00'),
  (5, '11:15:00', '12:00:00'),
  (6, '12:00:00', '12:45:00'),
  (7, '12:45:00', '01:30:00')
on conflict (period_no) do update 
set start_time = excluded.start_time, end_time = excluded.end_time;

-- 4. Default Fee Setting (Configurable by Admin)
insert into public.fee_settings (id, monthly_amount, effective_from) values
  ('44444444-4444-4444-4444-444444444001', 3500, '2026-01-01')
on conflict (id) do update
set monthly_amount = excluded.monthly_amount, effective_from = excluded.effective_from;

-- 5. Primary Administrator Account (For initial login to configure the school)
create extension if not exists pgcrypto with schema extensions;

insert into auth.users (
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) values (
  '11111111-1111-1111-1111-111111111111',
  'authenticated',
  'authenticated',
  'admin@school.edu.pk',
  extensions.crypt('Admin#1234', extensions.gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"role":"admin","full_name":"School Administrator"}',
  now(),
  now()
) on conflict (id) do nothing;

insert into public.profiles (
  id,
  role,
  full_name,
  email,
  phone,
  active,
  must_change_password
) values (
  '11111111-1111-1111-1111-111111111111',
  'admin',
  'School Administrator',
  'admin@school.edu.pk',
  '03000000000',
  true,
  false
) on conflict (id) do update 
set full_name = excluded.full_name, role = 'admin', active = true;
