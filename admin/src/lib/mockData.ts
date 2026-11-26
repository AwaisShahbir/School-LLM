import type { Database } from '../types/database';

type TeacherProfile = Database['public']['Tables']['profiles']['Row'];
type Section = Database['public']['Tables']['sections']['Row'];
type Student = Database['public']['Tables']['students']['Row'];
type Attendance = Database['public']['Tables']['attendance']['Row'];
type Exam = Database['public']['Tables']['exams']['Row'];
type Mark = Database['public']['Tables']['marks']['Row'];
type FeePayment = Database['public']['Tables']['fee_payments']['Row'];
type TimetableEntry = Database['public']['Tables']['timetable_entries']['Row'];
type Event = Database['public']['Tables']['events']['Row'];
type Notification = Database['public']['Tables']['notifications']['Row'];
type Game = Database['public']['Tables']['games']['Row'];
type GameSlot = Database['public']['Tables']['game_slots']['Row'];
type SportRegistration = Database['public']['Tables']['sport_registrations']['Row'];
type Expense = Database['public']['Tables']['expenses']['Row'];
type AuditLog = Database['public']['Tables']['audit_log']['Row'];

export const INITIAL_TEACHERS: TeacherProfile[] = [
  {
    id: "22222222-2222-2222-2222-222222222001",
    role: "teacher",
    full_name: "Muhammad Ahmed",
    cnic: "3520112345671",
    phone: "03001234501",
    email: "ahmed.math@school.edu.pk",
    subject: "Mathematics",
    qualification: "M.Sc Mathematics (PU)",
    photo_path: null,
    address: "Gulberg III, Lahore",
    joining_date: "2023-01-15",
    resignation_date: null,
    active: true,
    must_change_password: false,
    created_at: "2023-01-15T08:00:00Z"
  },
  {
    id: "22222222-2222-2222-2222-222222222002",
    role: "teacher",
    full_name: "Tariq Mahmood",
    cnic: "3520112345672",
    phone: "03001234502",
    email: "tariq.phy@school.edu.pk",
    subject: "Physics",
    qualification: "M.Sc Physics (UET)",
    photo_path: null,
    address: "Model Town, Lahore",
    joining_date: "2022-08-10",
    resignation_date: null,
    active: true,
    must_change_password: false,
    created_at: "2022-08-10T08:00:00Z"
  },
  {
    id: "22222222-2222-2222-2222-222222222003",
    role: "teacher",
    full_name: "Ayesha Siddiqui",
    cnic: "3520112345673",
    phone: "03001234503",
    email: "ayesha.chem@school.edu.pk",
    subject: "Chemistry",
    qualification: "M.Phil Chemistry (GCU)",
    photo_path: null,
    address: "DHA Phase 5, Lahore",
    joining_date: "2022-09-01",
    resignation_date: null,
    active: true,
    must_change_password: false,
    created_at: "2022-09-01T08:00:00Z"
  },
  {
    id: "22222222-2222-2222-2222-222222222004",
    role: "teacher",
    full_name: "Zubair Khan",
    cnic: "3520112345674",
    phone: "03001234504",
    email: "zubair.bio@school.edu.pk",
    subject: "Biology",
    qualification: "M.Sc Biology (QAU)",
    photo_path: null,
    address: "Johar Town, Lahore",
    joining_date: "2023-03-20",
    resignation_date: null,
    active: true,
    must_change_password: false,
    created_at: "2023-03-20T08:00:00Z"
  },
  {
    id: "22222222-2222-2222-2222-222222222005",
    role: "teacher",
    full_name: "Fatima Noor",
    cnic: "3520112345675",
    phone: "03001234505",
    email: "fatima.eng@school.edu.pk",
    subject: "English",
    qualification: "MA English (Kinnaird)",
    photo_path: null,
    address: "Cantt, Lahore",
    joining_date: "2023-08-15",
    resignation_date: null,
    active: true,
    must_change_password: false,
    created_at: "2023-08-15T08:00:00Z"
  },
  {
    id: "22222222-2222-2222-2222-222222222006",
    role: "teacher",
    full_name: "Hafiz Usman",
    cnic: "3520112345676",
    phone: "03001234506",
    email: "usman.urdu@school.edu.pk",
    subject: "Urdu & Islamiyat",
    qualification: "MA Urdu & Shahadat-ul-Almiya",
    photo_path: null,
    address: "Allama Iqbal Town, Lahore",
    joining_date: "2021-04-01",
    resignation_date: null,
    active: true,
    must_change_password: false,
    created_at: "2021-04-01T08:00:00Z"
  },
  {
    id: "22222222-2222-2222-2222-222222222007",
    role: "teacher",
    full_name: "Bilal Asghar",
    cnic: "3520112345677",
    phone: "03001234507",
    email: "bilal.cs@school.edu.pk",
    subject: "Computer Science",
    qualification: "BS Computer Science (FAST)",
    photo_path: null,
    address: "Faisal Town, Lahore",
    joining_date: "2024-01-05",
    resignation_date: null,
    active: true,
    must_change_password: false,
    created_at: "2024-01-05T08:00:00Z"
  },
  {
    id: "22222222-2222-2222-2222-222222222008",
    role: "teacher",
    full_name: "Sana Rasheed",
    cnic: "3520112345678",
    phone: "03001234508",
    email: "sana.pakstudies@school.edu.pk",
    subject: "Pakistan Studies",
    qualification: "MA History (PU)",
    photo_path: null,
    address: "Wapda Town, Lahore",
    joining_date: "2023-11-01",
    resignation_date: null,
    active: true,
    must_change_password: false,
    created_at: "2023-11-01T08:00:00Z"
  }
];

export const INITIAL_SECTIONS: Section[] = [];
const GRADES = [6, 7, 8, 9, 10];
const SEC_NAMES = ['A', 'B', 'C'];
let secIdx = 1;

for (const g of GRADES) {
  for (const s of SEC_NAMES) {
    const secId = `33333333-3333-3333-3333-${String(secIdx).padStart(12, '0')}`;
    const teacherId = INITIAL_TEACHERS[(secIdx - 1) % INITIAL_TEACHERS.length].id;
    INITIAL_SECTIONS.push({
      id: secId,
      grade: g,
      name: s,
      class_teacher_id: teacherId
    });
    secIdx++;
  }
}

const FIRST_NAMES = [
  "Ali", "Hamza", "Bilal", "Usman", "Umar", "Zayd", "Hassan", "Hussain", "Abdullah", "Ibrahim",
  "Mustafa", "Saad", "Talha", "Daniyal", "Zain", "Farhan", "Shahzaib", "Waqas", "Khurram", "Arham",
  "Fatima", "Ayesha", "Zainab", "Maryam", "Khadija", "Hafsa", "Noor", "Hiba", "Eman", "Mahnoor",
  "Anaya", "Iqra", "Laiba", "Dua", "Sadia", "Sana", "Amna", "Bisma", "Hira", "Malaika"
];

const FATHER_NAMES = [
  "Muhammad Rashid", "Tariq Mehmood", "Khalid Javaid", "Aslam Pervez", "Abdul Rehman",
  "Sohail Anwar", "Naveed Akhtar", "Imran Nazir", "Shahid Latif", "Akram Mughal",
  "Arshad Ali", "Saeed Ahmad", "Irfan Qureshi", "Mansoor Hassan", "Munir Hussain"
];

export const INITIAL_STUDENTS: Student[] = [];
let studentCount = 1;

for (const sec of INITIAL_SECTIONS) {
  for (let roll = 1; roll <= 40; roll++) {
    const sId = `44444444-4444-4444-4444-${String(studentCount).padStart(12, '0')}`;
    const fname = FIRST_NAMES[(studentCount + roll) % FIRST_NAMES.length];
    const fatName = FATHER_NAMES[(studentCount * 3 + roll) % FATHER_NAMES.length];
    INITIAL_STUDENTS.push({
      id: sId,
      section_id: sec.id,
      roll_no: roll,
      full_name: `${fname} ${fatName.split(' ')[0]}`,
      father_name: fatName,
      b_form: `35202-${1000000 + studentCount}-1`,
      dob: `${2026 - (sec.grade + 4)}-05-15`,
      address: "Gulberg III, Lahore",
      phone1: `0312${1000000 + studentCount}`,
      phone2: null,
      admission_date: "2024-03-01",
      status: "active",
      left_date: null,
      created_at: "2024-03-01T08:00:00Z"
    });
    studentCount++;
  }
}

export const INITIAL_ATTENDANCE: Attendance[] = [];
const ATT_DATES = ['2026-11-24', '2026-11-25', '2026-11-26'];

for (const d of ATT_DATES) {
  for (const s of INITIAL_STUDENTS.slice(0, 120)) { // Classes 6A, 6B, 6C
    let st: Attendance['status'] = 'present';
    if (s.roll_no === 5 || s.roll_no === 12) st = 'absent';
    else if (s.roll_no === 18) st = 'late';
    else if (s.roll_no === 25) st = 'leave';

    INITIAL_ATTENDANCE.push({
      id: `att-${s.id}-${d}`,
      student_id: s.id,
      date: d,
      status: st,
      marked_by: INITIAL_TEACHERS[0].id,
      created_at: `${d}T08:30:00Z`
    });
  }
}

export const INITIAL_FEES: FeePayment[] = [];
for (const s of INITIAL_STUDENTS) {
  const isPaid = s.roll_no % 3 !== 0;
  INITIAL_FEES.push({
    id: `fee-${s.id}-2026-11`,
    student_id: s.id,
    month: '2026-11-01',
    status: isPaid ? 'paid' : 'pending',
    paid_on: isPaid ? '2026-11-05' : null,
    amount: isPaid ? 3500 : null,
    recorded_by: isPaid ? '11111111-1111-1111-1111-111111111111' : null,
    created_at: '2026-11-01T00:00:00Z'
  });
}

export const INITIAL_EXAMS: Exam[] = [
  {
    id: "77777777-7777-7777-7777-000000000001",
    section_id: INITIAL_SECTIONS[0].id,
    subject: "Mathematics",
    type: "monthly",
    title: "November Assessment",
    total_marks: 50,
    exam_date: "2026-11-20",
    created_by: INITIAL_TEACHERS[0].id,
    created_at: "2026-11-10T08:00:00Z"
  }
];

export const INITIAL_MARKS: Mark[] = [];
for (const s of INITIAL_STUDENTS.slice(0, 40)) {
  const isAbs = s.roll_no === 5;
  INITIAL_MARKS.push({
    id: `mark-${s.id}`,
    exam_id: INITIAL_EXAMS[0].id,
    student_id: s.id,
    obtained: isAbs ? null : 32 + ((s.roll_no * 7) % 18),
    absent: isAbs,
    updated_by: INITIAL_TEACHERS[0].id,
    updated_at: "2026-11-21T10:00:00Z"
  });
}

export const INITIAL_EVENTS: Event[] = [
  {
    id: "ev-1",
    title: "Annual Sports Gala 2026",
    description: "Inter-house cricket, football & athletics tournament",
    start_date: "2026-12-05",
    end_date: "2026-12-07",
    created_by: "11111111-1111-1111-1111-111111111111",
    created_at: "2026-11-15T10:00:00Z"
  },
  {
    id: "ev-2",
    title: "Mid-Term Examinations",
    description: "Comprehensive mid-year examinations for Classes 6-10",
    start_date: "2026-12-15",
    end_date: "2026-12-24",
    created_by: "11111111-1111-1111-1111-111111111111",
    created_at: "2026-11-15T10:00:00Z"
  },
  {
    id: "ev-3",
    title: "Science & Robotics Exhibition",
    description: "Display of student working models in Auditorium",
    start_date: "2026-11-30",
    end_date: "2026-11-30",
    created_by: INITIAL_TEACHERS[1].id,
    created_at: "2026-11-18T10:00:00Z"
  }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "notif-1",
    title: "Monthly Staff Meeting",
    body: "All teaching faculty is requested to gather in Conference Hall B at 02:00 PM.",
    audience: "all",
    created_by: "11111111-1111-1111-1111-111111111111",
    created_at: "2026-11-26T08:00:00Z"
  },
  {
    id: "notif-2",
    title: "Submission of November Marks",
    body: "Please submit all November Monthly Assessment marks by Friday afternoon.",
    audience: "all",
    created_by: "11111111-1111-1111-1111-111111111111",
    created_at: "2026-11-25T11:30:00Z"
  }
];

export const INITIAL_GAMES: Game[] = [
  { id: "game-1", name: "Cricket", created_at: "2026-11-01T00:00:00Z" },
  { id: "game-2", name: "Football", created_at: "2026-11-01T00:00:00Z" },
  { id: "game-3", name: "Badminton", created_at: "2026-11-01T00:00:00Z" }
];

export const INITIAL_GAME_SLOTS: GameSlot[] = [
  { id: "slot-1", game_id: "game-1", label: "Under-16 Boys Team (Morning)", capacity: 22, created_at: "2026-11-01T00:00:00Z" },
  { id: "slot-2", game_id: "game-2", label: "Junior Football Squad", capacity: 18, created_at: "2026-11-01T00:00:00Z" }
];

export const INITIAL_SPORT_REGISTRATIONS: SportRegistration[] = [
  {
    id: "sp-1",
    slot_id: "slot-1",
    student_id: INITIAL_STUDENTS[0].id,
    details: "All-rounder batsman",
    registered_by: INITIAL_TEACHERS[0].id,
    created_at: "2026-11-10T09:00:00Z"
  },
  {
    id: "sp-2",
    slot_id: "slot-1",
    student_id: INITIAL_STUDENTS[1].id,
    details: "Wicket keeper",
    registered_by: INITIAL_TEACHERS[0].id,
    created_at: "2026-11-10T09:05:00Z"
  }
];

export const INITIAL_EXPENSES: Expense[] = [
  { id: "exp-1", date: "2026-11-02", category: "Stationery & Printing", amount: 14500, note: "Paper reams and test sheets printing", created_by: "11111111-1111-1111-1111-111111111111", created_at: "2026-11-02T10:00:00Z" },
  { id: "exp-2", date: "2026-11-10", category: "Utilities", amount: 87200, note: "Electricity bill Main Campus", created_by: "11111111-1111-1111-1111-111111111111", created_at: "2026-11-10T10:00:00Z" },
  { id: "exp-3", date: "2026-11-15", category: "Lab Equipment", amount: 32000, note: "Chemistry lab glassware", created_by: "11111111-1111-1111-1111-111111111111", created_at: "2026-11-15T10:00:00Z" },
  { id: "exp-4", date: "2026-11-20", category: "Maintenance & Repairs", amount: 18000, note: "Generator service & fuel", created_by: "11111111-1111-1111-1111-111111111111", created_at: "2026-11-20T10:00:00Z" }
];
