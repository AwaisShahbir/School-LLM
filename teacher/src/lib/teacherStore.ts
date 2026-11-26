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

export const INITIAL_TEACHERS: TeacherProfile[] = [];
export const INITIAL_SECTIONS: Section[] = [];
export const INITIAL_STUDENTS: Student[] = [];

class TeacherStore {
  currentTeacher: TeacherProfile | null = null;
  sections: Section[] = [];
  students: Student[] = [];
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

  unreadNotificationCount: number = 0;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.currentTeacher = null;
    this.sections = [];
    this.students = [];
    this.attendance = [];
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

    if (!password || password.trim().length === 0) {
      return { success: false, error: 'Please enter your password.' };
    }

    // Dynamic teacher account session
    const defaultSubject = 'General Faculty';
    this.currentTeacher = {
      id: `teach-${clean}`,
      role: 'teacher',
      full_name: `Faculty (${clean.slice(-4)})`,
      cnic: clean,
      phone: '03000000000',
      email: `${clean}@teachers.school.app`,
      address: 'School Faculty',
      qualification: 'B.Ed / Masters',
      photo_path: null,
      subject: defaultSubject,
      joining_date: new Date().toISOString().split('T')[0],
      resignation_date: null,
      active: true,
      must_change_password: false,
      created_at: new Date().toISOString()
    };

    this.notify();
    return { success: true, mustChangePassword: false };
  }

  completePasswordChange(newPassword: string) {
    if (this.currentTeacher) {
      this.currentTeacher.must_change_password = false;
      this.notify();
    }
  }

  logout() {
    this.currentTeacher = null;
    this.sections = [];
    this.students = [];
    this.attendance = [];
    this.notify();
  }

  // Check if current teacher leads the given section
  isClassTeacher(sectionId: string): boolean {
    const sec = this.sections.find(s => s.id === sectionId);
    return Boolean(sec?.class_teacher_id && sec.class_teacher_id === this.currentTeacher?.id);
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
      subject: this.currentTeacher?.subject || 'General',
      type,
      title,
      total_marks: totalMarks,
      exam_date: date,
      created_by: this.currentTeacher?.id || null,
      created_at: new Date().toISOString()
    };
    this.exams.push(newExam);
    this.notify();
    return newExam;
  }

  saveMarks(examId: string, records: Array<{ student_id: string; obtained: number | null; absent: boolean }>) {
    records.forEach(r => {
      const existingIdx = this.marks.findIndex(m => m.exam_id === examId && m.student_id === r.student_id);
      if (existingIdx >= 0) {
        this.marks[existingIdx].obtained = r.obtained;
        this.marks[existingIdx].absent = r.absent;
        this.marks[existingIdx].updated_at = new Date().toISOString();
      } else {
        this.marks.push({
          id: `mk-${Date.now()}-${r.student_id}`,
          exam_id: examId,
          student_id: r.student_id,
          obtained: r.obtained,
          absent: r.absent,
          updated_by: this.currentTeacher?.id || null,
          updated_at: new Date().toISOString()
        });
      }
    });
    this.notify();
  }

  // --- SPORTS REGISTRATION ---
  registerStudentForSport(gameSlotId: string, studentId: string) {
    const exists = this.sportRegistrations.some(r => r.game_slot_id === gameSlotId && r.student_id === studentId);
    if (exists) {
      throw new Error("Student is already registered in this sport slot.");
    }
    const newReg: SportRegistration = {
      id: `sp-reg-${Date.now()}`,
      game_slot_id: gameSlotId,
      student_id: studentId,
      registered_by: this.currentTeacher?.id || null,
      registered_at: new Date().toISOString()
    };
    this.sportRegistrations.push(newReg);
    this.notify();
    return newReg;
  }

  // --- TEACHER PROFILE EDIT (RPC simulation) ---
  updateProfile(updates: { phone?: string; address?: string; qualification?: string }) {
    if (!this.currentTeacher) return;
    this.currentTeacher = {
      ...this.currentTeacher,
      phone: updates.phone !== undefined ? updates.phone : this.currentTeacher.phone,
      address: updates.address !== undefined ? updates.address : this.currentTeacher.address,
      qualification: updates.qualification !== undefined ? updates.qualification : this.currentTeacher.qualification
    };
    this.notify();
  }
}

export const teacherStore = new TeacherStore();
