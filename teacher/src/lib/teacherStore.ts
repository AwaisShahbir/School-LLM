import type {
  TeacherProfile,
  Section,
  Student,
  Attendance,
  Exam,
  Mark,
  FeePayment,
  TimetableEntry,
  Event,
  Notification,
  Game,
  GameSlot,
  SportRegistration,
  AttendanceStatus
} from '../types/database';

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
  }
];

export const INITIAL_SECTIONS: Section[] = [];
const GRADES = [6, 7, 8, 9, 10];
const SEC_NAMES = ['A', 'B', 'C'];
let secIdx = 1;

for (const g of GRADES) {
  for (const s of SEC_NAMES) {
    const secId = `33333333-3333-3333-3333-${String(secIdx).padStart(12, '0')}`;
    const teacherId = INITIAL_TEACHERS[(secIdx - 1) % INITIAL_TEACHERS.length]?.id;
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
  "Fatima", "Ayesha", "Zainab", "Maryam", "Khadija", "Hafsa", "Noor", "Hiba", "Eman", "Mahnoor"
];

const FATHER_NAMES = [
  "Muhammad Rashid", "Tariq Mehmood", "Khalid Javaid", "Aslam Pervez", "Abdul Rehman",
  "Sohail Anwar", "Naveed Akhtar", "Imran Nazir", "Shahid Latif", "Akram Mughal"
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

class TeacherStore {
  currentTeacher: TeacherProfile | null = INITIAL_TEACHERS[0]; // Logged in as Muhammad Ahmed (Class 6-A teacher)
  sections: Section[] = [...INITIAL_SECTIONS];
  students: Student[] = [...INITIAL_STUDENTS];
  attendance: Attendance[] = [];
  exams: Exam[] = [];
  marks: Mark[] = [];
  fees: FeePayment[] = [];
  timetableEntries: TimetableEntry[] = [];
  events: Event[] = [];
  notifications: Notification[] = [];
  games: Game[] = [];
  gameSlots: GameSlot[] = [];
  sportRegistrations: SportRegistration[] = [];

  unreadNotificationCount: number = 2;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.initMockData();
  }

  private initMockData() {
    // Attendance for 6-A today
    const sec6A = this.sections[0];
    const secStudents = this.students.filter(s => s.section_id === sec6A.id);
    this.attendance = secStudents.map(s => {
      let st: AttendanceStatus = 'present';
      if (s.roll_no === 5 || s.roll_no === 12) st = 'absent';
      else if (s.roll_no === 18) st = 'late';
      else if (s.roll_no === 25) st = 'leave';
      return {
        id: `att-${s.id}-2026-11-26`,
        student_id: s.id,
        date: '2026-11-26',
        status: st,
        marked_by: this.currentTeacher?.id || null,
        created_at: '2026-11-26T08:30:00Z'
      };
    });

    // Sample Exam
    this.exams = [
      {
        id: "77777777-7777-7777-7777-000000000001",
        section_id: sec6A.id,
        subject: "Mathematics",
        type: "monthly",
        title: "November Assessment",
        total_marks: 50,
        exam_date: "2026-11-20",
        created_by: this.currentTeacher?.id || null,
        created_at: "2026-11-10T08:00:00Z"
      }
    ];

    // Marks
    this.marks = secStudents.map(s => ({
      id: `mark-${s.id}`,
      exam_id: this.exams[0].id,
      student_id: s.id,
      obtained: s.roll_no === 5 ? null : 32 + ((s.roll_no * 7) % 18),
      absent: s.roll_no === 5,
      updated_by: this.currentTeacher?.id || null,
      updated_at: "2026-11-21T10:00:00Z"
    }));

    // Fees (read only)
    this.fees = secStudents.map(s => ({
      id: `fee-${s.id}`,
      student_id: s.id,
      month: '2026-11-01',
      status: s.roll_no % 3 === 0 ? 'pending' : 'paid',
      paid_on: s.roll_no % 3 === 0 ? null : '2026-11-05',
      amount: s.roll_no % 3 === 0 ? null : 3500,
      recorded_by: null,
      created_at: '2026-11-01T00:00:00Z'
    }));

    // Timetable for current teacher
    this.timetableEntries = [
      { id: 'tt-1', version_id: 'v1', section_id: sec6A.id, day: 1, period_no: 1, subject: 'Mathematics', teacher_id: this.currentTeacher?.id || null },
      { id: 'tt-2', version_id: 'v1', section_id: this.sections[1].id, day: 1, period_no: 3, subject: 'Mathematics', teacher_id: this.currentTeacher?.id || null },
      { id: 'tt-3', version_id: 'v1', section_id: this.sections[2].id, day: 1, period_no: 5, subject: 'Mathematics', teacher_id: this.currentTeacher?.id || null },
      { id: 'tt-4', version_id: 'v1', section_id: sec6A.id, day: 2, period_no: 2, subject: 'Mathematics', teacher_id: this.currentTeacher?.id || null },
      { id: 'tt-5', version_id: 'v1', section_id: sec6A.id, day: 3, period_no: 1, subject: 'Mathematics', teacher_id: this.currentTeacher?.id || null },
      { id: 'tt-6', version_id: 'v1', section_id: sec6A.id, day: 4, period_no: 4, subject: 'Mathematics', teacher_id: this.currentTeacher?.id || null },
      { id: 'tt-7', version_id: 'v1', section_id: sec6A.id, day: 5, period_no: 2, subject: 'Mathematics', teacher_id: this.currentTeacher?.id || null },
      { id: 'tt-8', version_id: 'v1', section_id: sec6A.id, day: 6, period_no: 3, subject: 'Mathematics', teacher_id: this.currentTeacher?.id || null }
    ];

    // Events
    this.events = [
      { id: 'ev-1', title: 'Annual Sports Gala 2026', description: 'Inter-house cricket, football & athletics tournament', start_date: '2026-12-05', end_date: '2026-12-07', created_by: null, created_at: '2026-11-15T10:00:00Z' },
      { id: 'ev-2', title: 'Mid-Term Examinations', description: 'Comprehensive mid-year assessments', start_date: '2026-12-15', end_date: '2026-12-24', created_by: null, created_at: '2026-11-15T10:00:00Z' }
    ];

    // Notifications
    this.notifications = [
      { id: 'notif-1', title: 'Monthly Staff Meeting', body: 'All faculty members requested in Conference Room at 2:00 PM.', audience: 'all', created_by: null, created_at: '2026-11-26T08:00:00Z' },
      { id: 'notif-2', title: 'Submission of Assessment Marks', body: 'Please finalize November assessment marks before Friday.', audience: 'all', created_by: null, created_at: '2026-11-25T11:00:00Z' }
    ];

    // Games
    this.games = [
      { id: 'g-1', name: 'Cricket', created_at: '2026-11-01T00:00:00Z' },
      { id: 'g-2', name: 'Football', created_at: '2026-11-01T00:00:00Z' }
    ];
    this.gameSlots = [
      { id: 'sl-1', game_id: 'g-1', label: 'Under-16 Boys Team', capacity: 22, created_at: '2026-11-01T00:00:00Z' }
    ];
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach(fn => fn());
  }

  // --- AUTHENTICATION BY CNIC ---
  login(cnic: string, password: string): { success: boolean; mustChangePassword?: boolean; error?: string } {
    const clean = cnic.replace(/\D/g, '');
    if (clean.length !== 13) {
      return { success: false, error: 'CNIC must be exactly 13 numeric digits.' };
    }

    const teacher = INITIAL_TEACHERS.find(t => t.cnic === clean);
    if (!teacher) {
      // Mock match for any valid 13-digit CNIC
      this.currentTeacher = {
        id: `teach-${clean}`,
        role: 'teacher',
        full_name: 'Muhammad Ahmed',
        cnic: clean,
        phone: '03001234567',
        email: `${clean}@teachers.school.app`,
        address: 'Lahore, Pakistan',
        qualification: 'M.Sc Mathematics',
        photo_path: null,
        subject: 'Mathematics',
        joining_date: '2024-01-01',
        resignation_date: null,
        active: true,
        must_change_password: true, // triggers forced change password
        created_at: new Date().toISOString()
      };
      this.notify();
      return { success: true, mustChangePassword: true };
    }

    if (!teacher.active) {
      return { success: false, error: 'Teacher account is deactivated. Contact administration.' };
    }

    this.currentTeacher = teacher;
    this.notify();
    return { success: true, mustChangePassword: teacher.must_change_password };
  }

  completePasswordChange(newPassword: string) {
    if (this.currentTeacher) {
      this.currentTeacher.must_change_password = false;
      this.notify();
    }
  }

  logout() {
    this.currentTeacher = null;
    this.notify();
  }

  // Check if current teacher leads the given section
  isClassTeacher(sectionId: string): boolean {
    const sec = this.sections.find(s => s.id === sectionId);
    return sec?.class_teacher_id === this.currentTeacher?.id;
  }

  // --- ATTENDANCE ---
  saveAttendance(date: string, records: Array<{ student_id: string; status: AttendanceStatus }>) {
    records.forEach(r => {
      const existingIdx = this.attendance.findIndex(a => a.student_id === r.student_id && a.date === date);
      if (existingIdx >= 0) {
        this.attendance[existingIdx].status = r.status;
      } else {
        this.attendance.push({
          id: `att-${r.student_id}-${date}`,
          student_id: r.student_id,
          date,
          status: r.status,
          marked_by: this.currentTeacher?.id || null,
          created_at: new Date().toISOString()
        });
      }
    });
    this.notify();
  }

  // --- MARKS ---
  createExam(title: string, type: Exam['type'], totalMarks: number, date: string, sectionId: string) {
    const newExam: Exam = {
      id: `ex-${Date.now()}`,
      section_id: sectionId,
      subject: this.currentTeacher?.subject || 'Mathematics',
      type,
      title,
      total_marks: totalMarks,
      exam_date: date,
      created_by: this.currentTeacher?.id || null,
      created_at: new Date().toISOString()
    };
    this.exams.unshift(newExam);
    this.notify();
    return newExam;
  }

  saveMarks(examId: string, records: Array<{ student_id: string; obtained: number | null; absent: boolean }>) {
    records.forEach(r => {
      const idx = this.marks.findIndex(m => m.exam_id === examId && m.student_id === r.student_id);
      if (idx >= 0) {
        this.marks[idx].obtained = r.absent ? null : r.obtained;
        this.marks[idx].absent = r.absent;
        this.marks[idx].updated_at = new Date().toISOString();
      } else {
        this.marks.push({
          id: `mk-${Date.now()}-${r.student_id}`,
          exam_id: examId,
          student_id: r.student_id,
          obtained: r.absent ? null : r.obtained,
          absent: r.absent,
          updated_by: this.currentTeacher?.id || null,
          updated_at: new Date().toISOString()
        });
      }
    });
    this.notify();
  }

  // --- EVENTS ---
  addEvent(title: string, description: string, startDate: string, endDate?: string) {
    this.events.unshift({
      id: `ev-${Date.now()}`,
      title,
      description,
      start_date: startDate,
      end_date: endDate || null,
      created_by: this.currentTeacher?.id || null,
      created_at: new Date().toISOString()
    });
    this.notify();
  }

  // --- SPORTS ---
  registerSport(slotId: string, studentId: string, details: string) {
    this.sportRegistrations.push({
      id: `sp-${Date.now()}`,
      slot_id: slotId,
      student_id: studentId,
      details,
      registered_by: this.currentTeacher?.id || null,
      created_at: new Date().toISOString()
    });
    this.notify();
  }

  // --- PROFILE RPC UPDATE ---
  updateOwnProfile(updates: { phone?: string; address?: string; qualification?: string }) {
    if (!this.currentTeacher) return;
    this.currentTeacher = {
      ...this.currentTeacher,
      phone: updates.phone !== undefined ? updates.phone : this.currentTeacher.phone,
      address: updates.address !== undefined ? updates.address : this.currentTeacher.address,
      qualification: updates.qualification !== undefined ? updates.qualification : this.currentTeacher.qualification,
    };
    this.notify();
  }
}

export const teacherStore = new TeacherStore();
