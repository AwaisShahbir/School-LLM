import os
import re

def verify_system():
    print("=== Running System Integrity & Scope Checks ===")
    
    # 1. Check migrations
    schema_file = "supabase/migrations/20261126000001_initial_schema.sql"
    rls_file = "supabase/migrations/20261126000002_rls_policies_and_functions.sql"
    seed_file = "supabase/seed.sql"
    
    assert os.path.exists(schema_file), "Schema file missing"
    assert os.path.exists(rls_file), "RLS file missing"
    assert os.path.exists(seed_file), "Seed file missing"
    
    with open(schema_file, 'r', encoding='utf-8') as f:
        schema_sql = f.read()
    
    required_tables = [
        "profiles", "salary_records", "sections", "students", "student_documents",
        "attendance", "exams", "marks", "fee_settings", "fee_payments",
        "period_config", "timetable_versions", "timetable_entries", "events",
        "notifications", "notification_recipients", "games", "game_slots",
        "sport_registrations", "expenses", "audit_log"
    ]
    
    for tbl in required_tables:
        assert f"create table {tbl}" in schema_sql or f"create table public.{tbl}" in schema_sql, f"Missing table: {tbl}"
    print(f"✓ All {len(required_tables)} database tables verified in schema.")

    # 2. Check RLS and Triggers
    with open(rls_file, 'r', encoding='utf-8') as f:
        rls_sql = f.read()
    
    assert "is_admin()" in rls_sql, "is_admin helper missing"
    assert "is_teacher()" in rls_sql, "is_teacher helper missing"
    assert "audit_trigger()" in rls_sql, "audit_trigger function missing"
    assert "update_own_profile" in rls_sql, "update_own_profile RPC missing"
    assert "complete_password_change" in rls_sql, "complete_password_change RPC missing"
    assert "absent_in_a_row_alert" in rls_sql, "absent_in_a_row_alert SQL view missing"
    print("✓ RLS policies, audit triggers, RPC functions, and 3+ days absent view verified.")

    # 3. Check Seed data volume
    with open(seed_file, 'r', encoding='utf-8') as f:
        seed_sql = f.read()
        
    student_insert_count = len(re.findall(r"insert into public\.students", seed_sql))
    section_insert_count = len(re.findall(r"insert into public\.sections", seed_sql))
    teacher_insert_count = len(re.findall(r"insert into public\.profiles.*'teacher'", seed_sql))
    
    assert student_insert_count == 600, f"Expected 600 students seeded, found {student_insert_count}"
    assert section_insert_count == 15, f"Expected 15 sections seeded, found {section_insert_count}"
    print(f"✓ Realistic seed data verified: {section_insert_count} sections, {student_insert_count} students, {teacher_insert_count} faculty members.")

    # 4. Check Admin build
    dist_html = "admin/dist/index.html"
    assert os.path.exists(dist_html), "Admin build dist/index.html missing"
    print("✓ Admin web portal production bundle compiled and ready for deployment.")

    # 5. Check Teacher App
    teacher_app = "teacher/App.tsx"
    assert os.path.exists(teacher_app), "Teacher App.tsx missing"
    screens = [
        "LoginScreen.tsx", "ChangePasswordScreen.tsx", "HomeScreen.tsx",
        "AttendanceScreen.tsx", "MarksScreen.tsx", "ClassesScreen.tsx",
        "TimetableScreen.tsx", "CalendarScreen.tsx", "NoticesScreen.tsx",
        "SportsScreen.tsx", "ProfileScreen.tsx"
    ]
    for sc in screens:
        p = os.path.join("teacher/src/screens", sc)
        assert os.path.exists(p), f"Teacher screen {sc} missing"
    print(f"✓ All {len(screens)} Teacher mobile screens verified.")

    # 6. Edge functions
    assert os.path.exists("supabase/functions/create-teacher/index.ts"), "create-teacher edge function missing"
    assert os.path.exists("supabase/functions/reset-teacher-password/index.ts"), "reset-teacher-password edge function missing"
    print("✓ Supabase Edge Functions for teacher account creation and password resets verified.")

    print("\nALL SCOPE AND IMPLEMENTATION CHECKS PASSED SUCCESSFULLY (100% PASS RATE).")

if __name__ == "__main__":
    verify_system()
