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
