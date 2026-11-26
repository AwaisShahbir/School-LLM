-- ==============================================================================
-- Pure 13-Digit CNIC Teacher Authentication & Clean RLS
-- Zero Email functionality for teachers. Pure CNIC + Password auth.
-- ==============================================================================

-- 1. Ensure pgcrypto extension is active for password hashing
create extension if not exists pgcrypto;

-- 2. Modify profiles table to decouple from auth.users (pure CNIC auth)
alter table public.profiles drop constraint if exists profiles_id_fkey;
alter table public.profiles alter column id set default gen_random_uuid();
alter table public.profiles add column if not exists password_hash text;
alter table public.profiles alter column email drop not null;

-- 3. Pure CNIC RPC: Admin creates a teacher (No email required)
create or replace function public.admin_create_teacher(
  p_cnic text,
  p_full_name text,
  p_subject text,
  p_phone text default null,
  p_qualification text default 'B.Ed / Masters',
  p_salary numeric default 50000,
  p_temp_password text default null
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_clean_cnic text;
  v_temp_pass text;
  v_user_id uuid;
  v_hash text;
begin
  -- Validate 13-digit CNIC
  v_clean_cnic := regexp_replace(p_cnic, '\D', '', 'g');
  if length(v_clean_cnic) <> 13 then
    raise exception 'CNIC must be exactly 13 digits without dashes.';
  end if;

  -- Default temp password: Teach# + last 4 digits of CNIC
  v_temp_pass := coalesce(nullif(trim(p_temp_password), ''), 'Teach#' || substr(v_clean_cnic, 10, 4));

  -- Check duplicate CNIC
  if exists (select 1 from public.profiles where cnic = v_clean_cnic) then
    raise exception 'A teacher with CNIC % already exists in the system.', v_clean_cnic;
  end if;

  v_user_id := gen_random_uuid();
  v_hash := extensions.crypt(v_temp_pass, extensions.gen_salt('bf'));

  -- Insert teacher profile directly (ZERO email)
  insert into public.profiles (
    id,
    role,
    full_name,
    cnic,
    phone,
    email,
    subject,
    qualification,
    joining_date,
    active,
    must_change_password,
    password_hash,
    created_at
  ) values (
    v_user_id,
    'teacher',
    p_full_name,
    v_clean_cnic,
    p_phone,
    null,
    p_subject,
    p_qualification,
    current_date,
    true,
    true,
    v_hash,
    now()
  );

  -- Insert initial salary record if provided
  if p_salary is not null and p_salary > 0 then
    insert into public.salary_records (teacher_id, month, amount, note)
    values (v_user_id, date_trunc('month', current_date)::date, p_salary, 'Joining salary');
  end if;

  return jsonb_build_object(
    'success', true,
    'teacher_id', v_user_id,
    'cnic', v_clean_cnic,
    'temp_password', v_temp_pass
  );
end;
$$;

-- 4. Pure CNIC RPC: Teacher Login via 13-digit CNIC & Password
create or replace function public.teacher_login(
  p_cnic text,
  p_password text
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_clean_cnic text;
  v_profile record;
begin
  v_clean_cnic := regexp_replace(p_cnic, '\D', '', 'g');
  if length(v_clean_cnic) <> 13 then
    return jsonb_build_object('success', false, 'error', 'CNIC must be exactly 13 numeric digits.');
  end if;

  if p_password is null or length(trim(p_password)) = 0 then
    return jsonb_build_object('success', false, 'error', 'Please enter your password.');
  end if;

  select * into v_profile
  from public.profiles
  where cnic = v_clean_cnic
    and role = 'teacher'
    and active = true;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Teacher account not found for this CNIC.');
  end if;

  -- Verify password with bcrypt
  if v_profile.password_hash is null or v_profile.password_hash <> extensions.crypt(p_password, v_profile.password_hash) then
    return jsonb_build_object('success', false, 'error', 'Invalid password. Check credentials or ask Admin to reset.');
  end if;

  return jsonb_build_object(
    'success', true,
    'must_change_password', v_profile.must_change_password,
    'teacher', row_to_json(v_profile)
  );
end;
$$;

-- 5. Pure CNIC RPC: Teacher Changes Password
create or replace function public.teacher_change_password(
  p_cnic text,
  p_new_password text
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_clean_cnic text;
  v_new_hash text;
begin
  v_clean_cnic := regexp_replace(p_cnic, '\D', '', 'g');
  if length(v_clean_cnic) <> 13 then
    return jsonb_build_object('success', false, 'error', 'Invalid CNIC format.');
  end if;

  if length(p_new_password) < 6 then
    return jsonb_build_object('success', false, 'error', 'New password must be at least 6 characters.');
  end if;

  v_new_hash := extensions.crypt(p_new_password, extensions.gen_salt('bf'));

  update public.profiles
  set password_hash = v_new_hash,
      must_change_password = false
  where cnic = v_clean_cnic
    and role = 'teacher';

  if not found then
    return jsonb_build_object('success', false, 'error', 'Teacher record not found.');
  end if;

  return jsonb_build_object('success', true);
end;
$$;

-- 6. Pure CNIC RPC: Admin Resets Teacher Password
create or replace function public.admin_reset_teacher_password(
  p_teacher_id uuid,
  p_temp_password text default null
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_cnic text;
  v_temp_pass text;
  v_new_hash text;
begin
  select cnic into v_cnic
  from public.profiles
  where id = p_teacher_id and role = 'teacher';

  if not found then
    raise exception 'Teacher record not found.';
  end if;

  v_temp_pass := coalesce(nullif(trim(p_temp_password), ''), 'Reset#' || substr(v_cnic, 10, 4));
  v_new_hash := extensions.crypt(v_temp_pass, extensions.gen_salt('bf'));

  update public.profiles
  set password_hash = v_new_hash,
      must_change_password = true
  where id = p_teacher_id;

  return jsonb_build_object(
    'success', true,
    'temp_password', v_temp_pass
  );
end;
$$;

-- 7. Grant public execution on the teacher authentication functions
grant execute on function public.teacher_login(text, text) to anon, authenticated;
grant execute on function public.teacher_change_password(text, text) to anon, authenticated;
grant execute on function public.admin_create_teacher(text, text, text, text, text, numeric, text) to anon, authenticated;
grant execute on function public.admin_reset_teacher_password(uuid, text) to anon, authenticated;

-- 8. Clean RLS Policies for App Operations
-- Ensure teachers & admin can view and operate school entities smoothly
drop policy if exists "Allow read sections" on public.sections;
create policy "Allow read sections" on public.sections for select using (true);
create policy "Allow admin write sections" on public.sections for all using (true) with check (true);

drop policy if exists "Allow read students" on public.students;
create policy "Allow read students" on public.students for select using (true);
create policy "Allow admin write students" on public.students for all using (true) with check (true);

drop policy if exists "Allow read profiles" on public.profiles;
create policy "Allow read profiles" on public.profiles for select using (true);
create policy "Allow update own profiles" on public.profiles for update using (true) with check (true);

drop policy if exists "Allow read attendance" on public.attendance;
create policy "Allow read attendance" on public.attendance for select using (true);
drop policy if exists "Allow write attendance" on public.attendance;
create policy "Allow write attendance" on public.attendance for all using (true) with check (true);

drop policy if exists "Allow read exams" on public.exams;
create policy "Allow read exams" on public.exams for select using (true);
drop policy if exists "Allow write exams" on public.exams;
create policy "Allow write exams" on public.exams for all using (true) with check (true);

drop policy if exists "Allow read marks" on public.marks;
create policy "Allow read marks" on public.marks for select using (true);
drop policy if exists "Allow write marks" on public.marks;
create policy "Allow write marks" on public.marks for all using (true) with check (true);

drop policy if exists "Allow read timetable" on public.timetable_entries;
create policy "Allow read timetable" on public.timetable_entries for select using (true);
create policy "Allow write timetable" on public.timetable_entries for all using (true) with check (true);

drop policy if exists "Allow read events" on public.events;
create policy "Allow read events" on public.events for select using (true);
create policy "Allow write events" on public.events for all using (true) with check (true);

drop policy if exists "Allow read notifications" on public.notifications;
create policy "Allow read notifications" on public.notifications for select using (true);
create policy "Allow write notifications" on public.notifications for all using (true) with check (true);

drop policy if exists "Allow read games" on public.games;
create policy "Allow read games" on public.games for select using (true);

drop policy if exists "Allow read game slots" on public.game_slots;
create policy "Allow read game slots" on public.game_slots for select using (true);

drop policy if exists "Allow read sports registrations" on public.sport_registrations;
create policy "Allow read sports registrations" on public.sport_registrations for select using (true);
create policy "Allow write sports registrations" on public.sport_registrations for all using (true) with check (true);

drop policy if exists "Allow read fees" on public.fee_payments;
create policy "Allow read fees" on public.fee_payments for select using (true);
create policy "Allow write fees" on public.fee_payments for all using (true) with check (true);

drop policy if exists "Allow read expenses" on public.expenses;
create policy "Allow read expenses" on public.expenses for select using (true);
create policy "Allow write expenses" on public.expenses for all using (true) with check (true);
