# School Management System (Admin Web + Teacher Mobile) - Project Brief & Engineering Rules

## 1. Project Overview & Scope
A high-efficiency, role-enforced School Management Application designed for a 2-day implementation and pilot.
- **Admin Website (Desktop/Tablet/Mobile Web)**: Built with React, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts, and SheetJS.
- **Teacher Mobile App (Android/iOS)**: Built with React Native & Expo (Expo Router), TypeScript, React Native Paper (Material 3), and react-native-svg.
- **Backend & Database**: Supabase (PostgreSQL with Row Level Security, Auth, Storage, Edge Functions).

### Scope Matrix
| # | Feature | Admin (Web) | Teacher (App) | Priority |
|---|---|---|---|---|
| 1 | Login, roles, forced password change | Yes | Yes (CNIC login) | P0 |
| 2 | Teacher records (CNIC, subject, salary, joining/resignation) | Create/Edit/Deactivate | View own | P0 |
| 3 | Student records (Classes 6-10, 3+ sections: A, B, C) | Create/Edit/Mark Left | View all | P0 |
| 4 | Find student by class/section & roll number or name | Yes | Yes | P0 |
| 5 | Daily attendance (once a day per section) | View/Correct | Mark, view all | P0 |
| 6 | Exams & marks (weekly, monthly, term, annual) | View/Export | Enter/Edit/Export | P0 |
| 7 | Fixed monthly fees (Paid/Pending status) | Edit/Configure | View only | P0 |
| 8 | Excel export (marks, attendance, fees, students) | Yes | Yes | P0 |
| 9 | Timetable (Admin builds & approves, teacher views) | Build/Approve | View approved | P1 |
| 10 | Calendar & events | Create/View | Create/View own & all | P1 |
| 11 | In-app notifications to teachers | Send/History | Receive/Unread badge | P1 |
| 12 | Teacher salary history | View/Add | No | P1 |
| 13 | Sports (games, slots, student registrations) | Manage/Export | Register students | P1 |
| 14 | School expenses | Manage/Track | No | P1 |
| 15 | Bulk student import from Excel | Upload & validate | No | P1 |
| 16 | Teacher profile edit (limited RPC) | Admin manages full | Edit phone/address/qual | P2 |
| 17 | Consecutive absence alert view (3+ days) | View alert list | View alert list | P2 |

---

## 2. Architecture & Security Rules
1. **Zero Service-Role Key in Clients**: Never bundle or expose `SUPABASE_SERVICE_ROLE_KEY` in frontend code. All client operations run via standard client using user JWT with strict Row Level Security (RLS) enforcement.
2. **Elevated Admin Operations**: Teacher account creation and password resets are executed through Supabase Edge Functions (`create-teacher`, `reset-teacher-password`), requiring an authenticated Admin caller.
3. **Teacher Authentication by CNIC**:
   - Supabase Auth uses synthetic email: `<13-digit-CNIC>@teachers.school.app`.
   - Teachers enter their 13-digit CNIC and password.
   - Initial state has `must_change_password = true`, prompting immediate password change before accessing the app.
4. **Audit Trail**: Any update to `students`, `attendance`, `marks`, or `fee_payments` records an immutable row in `audit_log` via PostgreSQL triggers.

---

## 3. Visual Design System & UX Standards (Section 9A)
- **Primary Color**: Violet (`#7048E8`)
- **Gradient Header**: Lavender (`#C9B6FA`) fading smoothly to page background (`#F4F3F8`)
- **Surfaces**: Clean white cards (`#FFFFFF`) with 20px–24px rounded corners and soft low-contrast elevation shadows (`shadow-sm` / `shadow-md`).
- **Accent Surfaces**: Pale violet (`#EEE9FD`) for active filter chips, pill segments, and icon container tiles.
- **Text Hierarchy**: Deep near-black (`#1F1B2E`) for headings, muted grey (`#6B6880`) for secondary text. Contrast ratio strictly ≥ 4.5:1.
- **Attendance Tokens**:
  - Present: Violet (`#7048E8`)
  - Absent: Coral (`#F27D8D`)
  - Late: Soft Amber (`#F6C177`)
  - Leave / Holiday: Slate / Dark Grey (`#64748B`)
  - *Rule: Always display an icon and text label alongside status colors.*
- **Fee Tokens**:
  - Paid: Emerald Green (`#2FA36B`)
  - Pending: Coral (`#F27D8D`)
- **Localization & Copy**: Real-world school terminology (Class 8, Section B, Roll No). Dates formatted as `DD/MM/YYYY`. Currency formatted as `Rs. X,XXX`.

---

## 4. Database Schema Summary
- **Enums**: `user_role` (admin, teacher), `attendance_status` (present, absent, late, leave), `exam_type` (weekly, monthly, term, annual), `student_status` (active, left, passed_out), `version_status` (draft, proposed, approved).
- **Core Tables**: `profiles`, `salary_records`, `sections`, `students`, `student_documents`, `attendance`, `exams`, `marks`, `fee_settings`, `fee_payments`, `period_config`, `timetable_versions`, `timetable_entries`, `events`, `notifications`, `notification_recipients`, `games`, `game_slots`, `sport_registrations`, `expenses`, `audit_log`.
