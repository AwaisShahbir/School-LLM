# Cadet College / School Management App (2-Day Implementation Plan)

## 🏛 Overview
A high-performance, role-enforced School Management System built specifically for **School Administration (Admin React Website)** and **Teaching Faculty (React Native / Expo Mobile App)**.

- **Admin Web Portal**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, SheetJS (`xlsx`) for Excel reports, Recharts.
- **Teacher Mobile App**: React Native, Expo, TypeScript, React Native Paper (Material 3), react-native-svg, SheetJS.
- **Backend & Database**: Supabase (PostgreSQL with strict Row Level Security, Auth, Storage, Edge Functions).

---

## 🎨 Visual Design System (Section 9A)
- **Primary Color**: Violet (`#7048E8`)
- **Gradient Header**: Lavender (`#C9B6FA` / `#E6DCFE`) fading to clean light-grey page background (`#F4F3F8`)
- **Surfaces**: Clean white cards (`#FFFFFF`) with 20px–24px rounded corners and soft low-contrast elevation shadows
- **Accent Surfaces**: Pale violet (`#EEE9FD`) for active filter chips, pill segments, and icon tiles
- **Text**: Near-black (`#1F1B2E`) for headings, muted grey (`#6B6880`) for secondary text (contrast ratio ≥ 4.5:1)
- **Attendance Colors**:
  - Present: Violet (`#7048E8`)
  - Absent: Coral (`#F27D8D`)
  - Late: Soft Amber (`#F6C177`)
  - Leave: Slate Grey (`#64748B`)
- **Fee Colors**:
  - Paid: Emerald Green (`#2FA36B`)
  - Pending: Coral (`#F27D8D`)

---

## 📂 Project Structure
```
school LLM/
├── AGENTS.md                            <- Project brief and engineering guidelines
├── shared/
│   └── database.types.ts                <- Shared strict TypeScript database types
├── supabase/
│   ├── migrations/
│   │   ├── 20261126000001_initial_schema.sql         <- 21 tables, enums, indices
│   │   └── 20261126000002_rls_policies_and_functions.sql <- RLS, audit trigger, RPCs, views
│   ├── functions/
│   │   ├── create-teacher/index.ts      <- Edge function for CNIC synthetic user creation
│   │   └── reset-teacher-password/index.ts <- Edge function for temporary password reset
│   └── seed.sql                         <- 15 sections, 600 students, faculty, periods, timetable
├── admin/                               <- Vite React Admin Web Application
│   ├── src/
│   │   ├── components/Layout.tsx        <- Sidebar navigation with active pills, topbar
│   │   ├── pages/                       <- Dashboard, Teachers, Students, Attendance,
│   │   │                                   Marks, Fees, Timetable, Events, Notifications,
│   │   │                                   Sports, Expenses, AuditLog, Login
│   │   ├── lib/store.ts                 <- Reactive data store & business logic
│   │   └── lib/mockData.ts              <- High-fidelity initial state
│   ├── dist/                            <- Production build bundle
│   └── package.json
└── teacher/                             <- React Native Expo Mobile App
    ├── src/
    │   ├── screens/                     <- Login, ChangePassword, Home, Attendance,
    │   │                                   Marks, Classes, Timetable, Calendar, Notices,
    │   │                                   Sports, Profile
    │   ├── theme/colors.ts              <- 9A theme tokens
    │   └── lib/teacherStore.ts          <- State & RPC calls
    ├── App.tsx                          <- 5-Tab mobile shell + Stack navigation
    └── package.json
```

---

## 🚀 Running the Admin Web Application

```bash
cd admin
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.
- **Admin Credentials**: `admin@school.edu.pk` / `Admin@1234`

### Production Build
```bash
cd admin
npm run build
```
Production output is located in `admin/dist/`.

---

## 📱 Running the Teacher Mobile Application

```bash
cd teacher
npx expo start
```
- Open using the **Expo Go** application on an Android / iOS phone by scanning the QR code, or press `a` for Android Emulator, or `w` for Web preview.
- **Teacher Login**: Enter 13-digit CNIC (e.g., `3520112345671`) and temporary password (e.g., `Teach#5671`).
- Synthetic email generated automatically: `3520112345671@teachers.school.app`.
- If `must_change_password` is flagged, the forced password change screen appears automatically.

---

## 🔐 Security & RLS Policies Summary
1. **Zero Service-Role Key on Clients**: Frontend bundles strictly contain only the `anon` key.
2. **Teacher Account Management**: All user creation and password resets run inside authenticated Supabase Edge Functions with `is_admin()` checks.
3. **Teacher Permissions**:
   - `profiles`: Teachers can only read their own profile; updates occur exclusively via `update_own_profile` RPC.
   - `salary_records` & `expenses`: Strictly inaccessible to teachers.
   - `attendance`: Teachers can read all; write permissions are restricted to same-day attendance (`date = CURRENT_DATE`) for sections they lead as class teacher.
   - `fee_payments` & `fee_settings`: Read-only for teachers.
   - `audit_log`: Automatic PostgreSQL trigger `audit_trigger()` captures every `INSERT`, `UPDATE`, and `DELETE` on students, attendance, marks, and fees.

---

## ✅ Acceptance Criteria & Feature Checklist
- [x] **CNIC Login & Forced Password Change**: 13-digit CNIC converted to `<cnic>@teachers.school.app`.
- [x] **15 Sections & 600 Seed Students**: Classes 6–10 (Sections A, B, C) with 40 students each.
- [x] **Excel Export**: Attendance, marks, fee lists, and sports rosters exportable in `.xlsx` format.
- [x] **Excel Bulk Import**: Upload 800+ student spreadsheets in seconds with duplicate checks.
- [x] **Attendance Register**: Interactive cycling (Present, Absent, Late, Leave), Mark-All-Present, and save feedback.
- [x] **Marks Entry**: Assessments with validation (obtained marks ≤ total marks) and running averages.
- [x] **Fixed Monthly Fee**: Flat PKR 3,500/month with toggleable Paid/Pending status and defaulter lists.
- [x] **Master Timetable**: 6-day x 7-period grid with automated double-booking prevention.
- [x] **Persistent Absence Alerts (3+ Days)**: Gaps-and-islands detection for students absent on 3+ consecutive days.
- [x] **Audit Trail**: Real-time logging of record updates with timestamps.
