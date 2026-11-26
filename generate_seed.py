import json
import random
from datetime import date, timedelta

# Static predictable UUIDs for repeatable testing
ADMIN_ID = "11111111-1111-1111-1111-111111111111"

TEACHERS = [
    {
        "id": "22222222-2222-2222-2222-222222222001",
        "name": "Muhammad Ahmed",
        "cnic": "3520112345671",
        "phone": "03001234501",
        "email": "ahmed.math@school.edu.pk",
        "subject": "Mathematics",
        "qualification": "M.Sc Mathematics (PU)",
        "salary": 65000,
        "joining": "2023-01-15"
    },
    {
        "id": "22222222-2222-2222-2222-222222222002",
        "name": "Tariq Mahmood",
        "cnic": "3520112345672",
        "phone": "03001234502",
        "email": "tariq.phy@school.edu.pk",
        "subject": "Physics",
        "qualification": "M.Sc Physics (UET)",
        "salary": 68000,
        "joining": "2022-08-10"
    },
    {
        "id": "22222222-2222-2222-2222-222222222003",
        "name": "Ayesha Siddiqui",
        "cnic": "3520112345673",
        "phone": "03001234503",
        "email": "ayesha.chem@school.edu.pk",
        "subject": "Chemistry",
        "qualification": "M.Phil Chemistry (GCU)",
        "salary": 70000,
        "joining": "2022-09-01"
    },
    {
        "id": "22222222-2222-2222-2222-222222222004",
        "name": "Zubair Khan",
        "cnic": "3520112345674",
        "phone": "03001234504",
        "email": "zubair.bio@school.edu.pk",
        "subject": "Biology",
        "qualification": "M.Sc Biology (QAU)",
        "salary": 64000,
        "joining": "2023-03-20"
    },
    {
        "id": "22222222-2222-2222-2222-222222222005",
        "name": "Fatima Noor",
        "cnic": "3520112345675",
        "phone": "03001234505",
        "email": "fatima.eng@school.edu.pk",
        "subject": "English",
        "qualification": "MA English (Kinnaird)",
        "salary": 62000,
        "joining": "2023-08-15"
    },
    {
        "id": "22222222-2222-2222-2222-222222222006",
        "name": "Hafiz Usman",
        "cnic": "3520112345676",
        "phone": "03001234506",
        "email": "usman.urdu@school.edu.pk",
        "subject": "Urdu & Islamiyat",
        "qualification": "MA Urdu & Shahadat-ul-Almiya",
        "salary": 58000,
        "joining": "2021-04-01"
    },
    {
        "id": "22222222-2222-2222-2222-222222222007",
        "name": "Bilal Asghar",
        "cnic": "3520112345677",
        "phone": "03001234507",
        "email": "bilal.cs@school.edu.pk",
        "subject": "Computer Science",
        "qualification": "BS Computer Science (FAST)",
        "salary": 72000,
        "joining": "2024-01-05"
    },
    {
        "id": "22222222-2222-2222-2222-222222222008",
        "name": "Sana Rasheed",
        "cnic": "3520112345678",
        "phone": "03001234508",
        "email": "sana.pakstudies@school.edu.pk",
        "subject": "Pakistan Studies",
        "qualification": "MA History (PU)",
        "salary": 59000,
        "joining": "2023-11-01"
    }
]

FIRST_NAMES = [
    "Ali", "Hamza", "Bilal", "Usman", "Umar", "Zayd", "Hassan", "Hussain", "Abdullah", "Ibrahim",
    "Mustafa", "Saad", "Talha", "Daniyal", "Zain", "Farhan", "Shahzaib", "Waqas", "Khurram", "Arham",
    "Fatima", "Ayesha", "Zainab", "Maryam", "Khadija", "Hafsa", "Noor", "Hiba", "Eman", "Mahnoor",
    "Anaya", "Iqra", "Laiba", "Dua", "Sadia", "Sana", "Amna", "Bisma", "Hira", "Malaika"
]

FATHER_NAMES = [
    "Muhammad Rashid", "Tariq Mehmood", "Khalid Javaid", "Aslam Pervez", "Abdul Rehman",
    "Sohail Anwar", "Naveed Akhtar", "Imran Nazir", "Shahid Latif", "Akram Mughal",
    "Arshad Ali", "Saeed Ahmad", "Irfan Qureshi", "Mansoor Hassan", "Munir Hussain"
]

GRADES = [6, 7, 8, 9, 10]
SECTIONS = ['A', 'B', 'C']

sql = []
sql.append("-- ==============================================================================")
sql.append("-- School Management System - Realistic Seed Data")
sql.append("-- ==============================================================================")
sql.append("")

# 1. Period Configuration
sql.append("-- 1. Period Config")
sql.append("insert into public.period_config (period_no, start_time, end_time) values")
sql.append("  (1, '08:00:00', '08:45:00'),")
sql.append("  (2, '08:45:00', '09:30:00'),")
sql.append("  (3, '09:30:00', '10:15:00'),")
sql.append("  (4, '10:30:00', '11:15:00'),") # Break 10:15 - 10:30
sql.append("  (5, '11:15:00', '12:00:00'),")
sql.append("  (6, '12:00:00', '12:45:00'),")
sql.append("  (7, '12:45:00', '01:30:00')")
sql.append("on conflict (period_no) do update set start_time = excluded.start_time, end_time = excluded.end_time;")
sql.append("")

# 2. Admin & Teacher Auth Users & Profiles
sql.append("-- 2. Auth Users (Admin & Teachers)")
sql.append("create extension if not exists pgcrypto with schema extensions;")
sql.append("insert into auth.users (")
sql.append("  id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at")
sql.append(") values")
sql.append(f"  ('{ADMIN_ID}', 'authenticated', 'authenticated', 'admin@school.edu.pk', extensions.crypt('Admin#1234', extensions.gen_salt('bf')), now(), '{{\"provider\":\"email\",\"providers\":[\"email\"]}}', '{{\"role\":\"admin\",\"full_name\":\"Principal / Headmaster Office\"}}', now(), now()),")
for i, t in enumerate(TEACHERS):
    comma = "," if i < len(TEACHERS) - 1 else ""
    pw = f"Teach#{t['cnic'][-4:]}"
    synthetic_email = f"{t['cnic']}@teachers.school.app"
    sql.append(f"  ('{t['id']}', 'authenticated', 'authenticated', '{synthetic_email}', extensions.crypt('{pw}', extensions.gen_salt('bf')), now(), '{{\"provider\":\"email\",\"providers\":[\"email\"]}}', '{{\"role\":\"teacher\",\"full_name\":\"{t['name']}\"}}', now(), now()){comma}")
sql.append("on conflict (id) do nothing;")
sql.append("")

# Admin Profile
sql.append("-- Profiles")
sql.append(f"insert into public.profiles (id, role, full_name, email, phone, must_change_password) values")
sql.append(f"  ('{ADMIN_ID}', 'admin', 'Principal / Headmaster Office', 'admin@school.edu.pk', '03000000000', false)")
sql.append("on conflict (id) do nothing;")
sql.append("")

# Teachers
for t in TEACHERS:
    sql.append(
        f"insert into public.profiles (id, role, full_name, cnic, phone, email, subject, qualification, joining_date, must_change_password) values "
        f"('{t['id']}', 'teacher', '{t['name']}', '{t['cnic']}', '{t['phone']}', '{t['email']}', '{t['subject']}', '{t['qualification']}', '{t['joining']}', false) "
        f"on conflict (id) do nothing;"
    )

sql.append("")

# 3. Salary Records (Admin only)
sql.append("-- 3. Teacher Salary Records (Recent 3 Months)")
for t in TEACHERS:
    for m in ['2026-09-01', '2026-10-01', '2026-11-01']:
        sql.append(
            f"insert into public.salary_records (teacher_id, month, amount, note) values "
            f"('{t['id']}', '{m}', {t['salary']}, 'Monthly Salary Disbursed via Bank Transfer') "
            f"on conflict (teacher_id, month) do nothing;"
        )
sql.append("")

# 4. Sections (15 sections: grades 6-10, A/B/C)
sql.append("-- 4. Sections (15 sections)")
section_map = {}
sec_idx = 1
for g in GRADES:
    for s_name in SECTIONS:
        sec_id = f"33333333-3333-3333-3333-{sec_idx:012d}"
        class_teacher = TEACHERS[(sec_idx - 1) % len(TEACHERS)]
        section_map[(g, s_name)] = sec_id
        sql.append(
            f"insert into public.sections (id, grade, name, class_teacher_id) values "
            f"('{sec_id}', {g}, '{s_name}', '{class_teacher['id']}') "
            f"on conflict (grade, name) do update set class_teacher_id = excluded.class_teacher_id;"
        )
        sec_idx += 1
sql.append("")

# 5. Students (40 students per section = 600 students)
sql.append("-- 5. Students (40 students per section, total 600)")
student_id_counter = 1
student_list = []
for g in GRADES:
    for s_name in SECTIONS:
        sec_id = section_map[(g, s_name)]
        for roll in range(1, 41):
            s_id = f"44444444-4444-4444-4444-{student_id_counter:012d}"
            fname = FIRST_NAMES[(student_id_counter + roll) % len(FIRST_NAMES)]
            fat_name = FATHER_NAMES[(student_id_counter * 3 + roll) % len(FATHER_NAMES)]
            b_form = f"35202-{1000000 + student_id_counter}-1"
            birth_year = 2026 - (g + 4)
            dob = f"{birth_year}-{(roll % 12) + 1:02d}-{(roll % 28) + 1:02d}"
            phone1 = f"0312{1000000 + student_id_counter}"
            student_list.append((s_id, sec_id, roll, f"{fname} {fat_name.split()[0]}", fat_name, g, s_name))
            sql.append(
                f"insert into public.students (id, section_id, roll_no, full_name, father_name, b_form, dob, address, phone1, status) values "
                f"('{s_id}', '{sec_id}', {roll}, '{fname} {fat_name.split()[0]}', '{fat_name}', '{b_form}', '{dob}', 'Gulberg III, Lahore', '{phone1}', 'active') "
                f"on conflict (section_id, roll_no) do nothing;"
            )
            student_id_counter += 1
sql.append("")

# 6. Fee Settings & Payments
sql.append("-- 6. Fee Settings & Recent Payments")
sql.append("insert into public.fee_settings (id, monthly_amount, effective_from) values")
sql.append("  ('55555555-5555-5555-5555-000000000001', 3500, '2026-01-01')")
sql.append("on conflict do nothing;")
sql.append("")

# Seed fee payments for November 2026 (70% Paid, 30% Pending)
for idx, (s_id, _, roll, _, _, _, _) in enumerate(student_list):
    status = 'paid' if (roll % 3 != 0) else 'pending'
    paid_on_val = f"'2026-11-05'" if status == 'paid' else "null"
    amt_val = "3500" if status == 'paid' else "null"
    rec_by = f"'{ADMIN_ID}'" if status == 'paid' else "null"
    sql.append(
        f"insert into public.fee_payments (student_id, month, status, paid_on, amount, recorded_by) values "
        f"('{s_id}', '2026-11-01', '{status}', {paid_on_val}, {amt_val}, {rec_by}) "
        f"on conflict (student_id, month) do nothing;"
    )
sql.append("")

# 7. Timetable Version & Entries (Approved)
sql.append("-- 7. Timetable Version & Grid")
TV_ID = "66666666-6666-6666-6666-000000000001"
sql.append(f"insert into public.timetable_versions (id, name, status, created_by) values ('{TV_ID}', 'Term 1 Master Schedule', 'approved', '{ADMIN_ID}') on conflict (id) do nothing;")

# Assign subjects and teachers to sections across 6 days and 7 periods with NO double bookings!
# We can use (teacher_idx + day + period + sec_idx) % len(TEACHERS)
sec_keys = list(section_map.keys())
for day in range(1, 7): # Monday to Saturday
    for period in range(1, 8):
        # We need a unique teacher per section in (day, period)
        # 15 sections, 8 teachers. In a real timetable, 8 teachers can teach 8 sections at once, while other 7 have study/library/sports.
        # Let's map each teacher to at most one section in this period.
        shuffled_teachers = list(range(len(TEACHERS)))
        random_shift = (day * 3 + period * 5) % len(TEACHERS)
        shuffled_teachers = shuffled_teachers[random_shift:] + shuffled_teachers[:random_shift]
        
        for i, t_idx in enumerate(shuffled_teachers):
            sec_k = sec_keys[i % len(sec_keys)]
            sec_id = section_map[sec_k]
            teacher = TEACHERS[t_idx]
            sub = teacher['subject']
            sql.append(
                f"insert into public.timetable_entries (version_id, section_id, day, period_no, subject, teacher_id) values "
                f"('{TV_ID}', '{sec_id}', {day}, {period}, '{sub}', '{teacher['id']}') "
                f"on conflict do nothing;"
            )
sql.append("")

# 8. Attendance Records for Recent Days (including consecutive absence cases for testing)
sql.append("-- 8. Attendance Records")
# Today: 2026-11-26, Yesterday: 2026-11-25, Day before: 2026-11-24
DATES = ['2026-11-24', '2026-11-25', '2026-11-26']
for d in DATES:
    for idx, (s_id, sec_id, roll, _, _, g, s_name) in enumerate(student_list[:120]): # Seed for Classes 6A, 6B, 6C
        # If roll == 5 or roll == 12, make absent for all 3 days -> triggers absent_in_a_row_alert!
        if roll in [5, 12]:
            st = 'absent'
        elif roll == 18:
            st = 'late'
        elif roll == 25:
            st = 'leave'
        else:
            st = 'present'
        sql.append(
            f"insert into public.attendance (student_id, date, status, marked_by) values "
            f"('{s_id}', '{d}', '{st}', '{TEACHERS[0]['id']}') "
            f"on conflict (student_id, date) do update set status = excluded.status;"
        )
sql.append("")

# 9. Exams and Marks
sql.append("-- 9. Exams and Marks")
EXAM_ID = "77777777-7777-7777-7777-000000000001"
sec_6a = section_map[(6, 'A')]
sql.append(
    f"insert into public.exams (id, section_id, subject, type, title, total_marks, exam_date, created_by) values "
    f"('{EXAM_ID}', '{sec_6a}', 'Mathematics', 'monthly', 'November Monthly Assessment', 50, '2026-11-20', '{TEACHERS[0]['id']}') "
    f"on conflict (id) do nothing;"
)

for s_id, sec_id, roll, _, _, _, _ in student_list[:40]: # 6A students
    if roll == 5:
        sql.append(f"insert into public.marks (exam_id, student_id, obtained, absent, updated_by) values ('{EXAM_ID}', '{s_id}', null, true, '{TEACHERS[0]['id']}') on conflict do nothing;")
    else:
        score = 30 + ((roll * 7) % 20)
        sql.append(f"insert into public.marks (exam_id, student_id, obtained, absent, updated_by) values ('{EXAM_ID}', '{s_id}', {score}, false, '{TEACHERS[0]['id']}') on conflict do nothing;")
sql.append("")

# 10. Events
sql.append("-- 10. School Events")
sql.append("insert into public.events (title, description, start_date, end_date, created_by) values")
sql.append(f"  ('Annual Sports Gala 2026', 'Inter-house athletic competitions, cricket & football finals.', '2026-12-05', '2026-12-07', '{ADMIN_ID}'),")
sql.append(f"  ('Mid-Term Examinations', 'Comprehensive examination schedule for grades 6 to 10.', '2026-12-15', '2026-12-24', '{ADMIN_ID}'),")
sql.append(f"  ('Science & Robotics Exhibition', 'Student projects showcase in the main auditorium.', '2026-11-30', '2026-11-30', '{TEACHERS[1]['id']}')")
sql.append("on conflict do nothing;")
sql.append("")

# 11. Notifications
sql.append("-- 11. Notifications")
NOTIF_1 = "88888888-8888-8888-8888-000000000001"
NOTIF_2 = "88888888-8888-8888-8888-000000000002"
sql.append(f"insert into public.notifications (id, title, body, audience, created_by) values")
sql.append(f"  ('{NOTIF_1}', 'Monthly Staff Meeting', 'All teachers are requested to assemble in the Conference Room today at 02:00 PM.', 'all', '{ADMIN_ID}'),")
sql.append(f"  ('{NOTIF_2}', 'Submission of Monthly Test Marks', 'Kindly submit November assessment marks by Saturday to the admin portal.', 'all', '{ADMIN_ID}')")
sql.append("on conflict (id) do nothing;")

for t in TEACHERS:
    sql.append(f"insert into public.notification_recipients (notification_id, teacher_id) values ('{NOTIF_1}', '{t['id']}') on conflict do nothing;")
    sql.append(f"insert into public.notification_recipients (notification_id, teacher_id) values ('{NOTIF_2}', '{t['id']}') on conflict do nothing;")
sql.append("")

# 12. Sports, Slots, Registrations
sql.append("-- 12. Games & Sports Registrations")
GAME_1 = "99999999-9999-9999-9999-000000000001"
GAME_2 = "99999999-9999-9999-9999-000000000002"
GAME_3 = "99999999-9999-9999-9999-000000000003"
sql.append(f"insert into public.games (id, name) values ('{GAME_1}', 'Cricket'), ('{GAME_2}', 'Football'), ('{GAME_3}', 'Badminton') on conflict (name) do nothing;")

SLOT_1 = "aaaaaaaa-aaaa-aaaa-aaaa-000000000001"
SLOT_2 = "aaaaaaaa-aaaa-aaaa-aaaa-000000000002"
sql.append(f"insert into public.game_slots (id, game_id, label, capacity) values")
sql.append(f"  ('{SLOT_1}', '{GAME_1}', 'Under-16 Boys Team (Morning)', 22),")
sql.append(f"  ('{SLOT_2}', '{GAME_2}', 'Junior Football Squad', 18)")
sql.append("on conflict (id) do nothing;")

# Register first 5 students in slot 1
for s_id, _, _, _, _, _, _ in student_list[:5]:
    sql.append(f"insert into public.sport_registrations (slot_id, student_id, details, registered_by) values ('{SLOT_1}', '{s_id}', 'All-rounder player', '{TEACHERS[0]['id']}') on conflict do nothing;")
sql.append("")

# 13. Expenses
sql.append("-- 13. School Expenses (Admin only)")
sql.append("insert into public.expenses (date, category, amount, note, created_by) values")
sql.append(f"  ('2026-11-02', 'Stationery & Printing', 14500, 'Paper reams and test sheets printing', '{ADMIN_ID}'),")
sql.append(f"  ('2026-11-10', 'Utilities', 87200, 'Electricity bill for Main Campus', '{ADMIN_ID}'),")
sql.append(f"  ('2026-11-15', 'Lab Equipment', 32000, 'Chemistry lab reagents and glassware', '{ADMIN_ID}'),")
sql.append(f"  ('2026-11-20', 'Maintenance & Repairs', 18000, 'Generator servicing and diesel', '{ADMIN_ID}')")
sql.append("on conflict do nothing;")

with open("supabase/seed.sql", "w", encoding="utf-8") as f:
    f.write("\n".join(sql) + "\n")

print(f"Seed file generated successfully with {len(student_list)} students and realistic records.")
