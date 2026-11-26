import {
  INITIAL_TEACHERS,
  INITIAL_SECTIONS,
  INITIAL_STUDENTS,
  INITIAL_ATTENDANCE,
  INITIAL_FEES,
  INITIAL_EXAMS,
  INITIAL_MARKS,
  INITIAL_EVENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_GAMES,
  INITIAL_GAME_SLOTS,
  INITIAL_SPORT_REGISTRATIONS,
  INITIAL_EXPENSES
} from './mockData';
import type { Database } from '../types/database';

type Teacher = Database['public']['Tables']['profiles']['Row'];
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

class SchoolStore {
  teachers: Teacher[] = [...INITIAL_TEACHERS];
  sections: Section[] = [...INITIAL_SECTIONS];
  students: Student[] = [...INITIAL_STUDENTS];
  attendance: Attendance[] = [...INITIAL_ATTENDANCE];
  fees: FeePayment[] = [...INITIAL_FEES];
  exams: Exam[] = [...INITIAL_EXAMS];
  marks: Mark[] = [...INITIAL_MARKS];
  events: Event[] = [...INITIAL_EVENTS];
  notifications: Notification[] = [...INITIAL_NOTIFICATIONS];
  games: Game[] = [...INITIAL_GAMES];
  gameSlots: GameSlot[] = [...INITIAL_GAME_SLOTS];
  sportRegistrations: SportRegistration[] = [...INITIAL_SPORT_REGISTRATIONS];
  expenses: Expense[] = [...INITIAL_EXPENSES];
  auditLogs: AuditLog[] = [];
  monthlyFeeAmount: number = 3500;
  timetableEntries: TimetableEntry[] = [];

  private listeners: Set<() => void> = new Set();

  constructor() {
    this.initTimetable();
  }

  private initTimetable() {
    // Generate initial valid timetable entries
    const entries: TimetableEntry[] = [];
    const secKeys = this.sections;
    for (let day = 1; day <= 6; day++) {
      for (let period = 1; period <= 7; period++) {
        const offset = (day * 3 + period * 5) % this.teachers.length;
        for (let i = 0; i < this.teachers.length; i++) {
          const tIdx = (offset + i) % this.teachers.length;
          const teacher = this.teachers[tIdx];
          const sec = secKeys[i % secKeys.length];
          entries.push({
            id: `tt-${sec.id}-${day}-${period}`,
            version_id: "66666666-6666-6666-6666-000000000001",
            section_id: sec.id,
            day,
            period_no: period,
            subject: teacher.subject || "General",
            teacher_id: teacher.id
          });
        }
      }
    }
    this.timetableEntries = entries;
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

  private addAudit(tableName: string, rowId: string, action: string, oldData: any, newData: any) {
    this.auditLogs.unshift({
      id: Date.now(),
      table_name: tableName,
      row_id: rowId,
      action,
      old_data: oldData ? JSON.stringify(oldData) : null,
      new_data: newData ? JSON.stringify(newData) : null,
      changed_by: "11111111-1111-1111-1111-111111111111",
      changed_at: new Date().toISOString()
    });
  }

  // --- TEACHERS ---
  addTeacher(data: Omit<Teacher, 'id' | 'created_at' | 'must_change_password' | 'role'>) {
    const id = `teach-${Date.now()}`;
    const newTeacher: Teacher = {
      ...data,
      id,
      role: 'teacher',
      must_change_password: true,
      created_at: new Date().toISOString()
    };
    this.teachers.push(newTeacher);
    this.notify();
    return newTeacher;
  }

  updateTeacher(id: string, updates: Partial<Teacher>) {
    this.teachers = this.teachers.map(t => t.id === id ? { ...t, ...updates } : t);
    this.notify();
  }

  resetTeacherPassword(id: string) {
    this.teachers = this.teachers.map(t => 
      t.id === id ? { ...t, must_change_password: true } : t
    );
    this.notify();
    return `Teach#${(this.teachers.find(t => t.id === id)?.cnic || "9999").slice(-4)}`;
  }

  // --- STUDENTS ---
  addStudent(data: Omit<Student, 'id' | 'created_at'>) {
    // Check unique roll number in section
    const exists = this.students.some(s => s.section_id === data.section_id && s.roll_no === data.roll_no && s.status === 'active');
    if (exists) {
      throw new Error(`Roll number ${data.roll_no} already exists in this section.`);
    }
    const id = `stu-${Date.now()}`;
    const newStudent: Student = {
      ...data,
      id,
      created_at: new Date().toISOString()
    };
    this.students.push(newStudent);
    this.addAudit('students', id, 'INSERT', null, newStudent);
    this.notify();
    return newStudent;
  }

  updateStudent(id: string, updates: Partial<Student>) {
    const old = this.students.find(s => s.id === id);
    this.students = this.students.map(s => s.id === id ? { ...s, ...updates } : s);
    this.addAudit('students', id, 'UPDATE', old, updates);
    this.notify();
  }

  markStudentLeft(id: string) {
    const old = this.students.find(s => s.id === id);
    const updates = { status: 'left' as const, left_date: new Date().toISOString().split('T')[0] };
    this.students = this.students.map(s => s.id === id ? { ...s, ...updates } : s);
    this.addAudit('students', id, 'UPDATE', old, updates);
    this.notify();
  }

  bulkImportStudents(imported: Array<{
    grade: number;
    section: string;
    roll_no: number;
    full_name: string;
    father_name: string;
    b_form?: string;
    dob?: string;
    phone1?: string;
  }>) {
    let successCount = 0;
    const errors: string[] = [];

    imported.forEach((row, idx) => {
      const section = this.sections.find(sec => sec.grade === row.grade && sec.name.toUpperCase() === row.section.toUpperCase());
      if (!section) {
        errors.push(`Row ${idx + 1}: Section Grade ${row.grade}-${row.section} not found.`);
        return;
      }

      const rollExists = this.students.some(s => s.section_id === section.id && s.roll_no === row.roll_no && s.status === 'active');
      if (rollExists) {
        errors.push(`Row ${idx + 1}: Roll #${row.roll_no} already exists in Class ${row.grade}-${row.section}.`);
        return;
      }

      const id = `stu-imp-${Date.now()}-${idx}`;
      const newStu: Student = {
        id,
        section_id: section.id,
        roll_no: Number(row.roll_no),
        full_name: row.full_name,
        father_name: row.father_name || null,
        b_form: row.b_form || null,
        dob: row.dob || '2012-01-01',
        address: 'Lahore, Pakistan',
        phone1: row.phone1 || null,
        phone2: null,
        admission_date: new Date().toISOString().split('T')[0],
        status: 'active',
        left_date: null,
        created_at: new Date().toISOString()
      };
      this.students.push(newStu);
      successCount++;
    });

    this.notify();
    return { successCount, errors };
  }

  // --- ATTENDANCE ---
  getAttendanceForSection(sectionId: string, date: string) {
    const sectionStudents = this.students.filter(s => s.section_id === sectionId && s.status === 'active');
    return sectionStudents.map(student => {
      const record = this.attendance.find(a => a.student_id === student.id && a.date === date);
      return {
        student,
        status: record ? record.status : 'present' as Attendance['status'],
        recordId: record?.id
      };
    });
  }

  saveAttendance(date: string, records: Array<{ student_id: string; status: Attendance['status'] }>) {
    records.forEach(rec => {
      const existingIdx = this.attendance.findIndex(a => a.student_id === rec.student_id && a.date === date);
      if (existingIdx >= 0) {
        const old = this.attendance[existingIdx];
        this.attendance[existingIdx] = { ...old, status: rec.status };
        this.addAudit('attendance', old.id, 'UPDATE', old, this.attendance[existingIdx]);
      } else {
        const newAtt: Attendance = {
          id: `att-${rec.student_id}-${date}`,
          student_id: rec.student_id,
          date,
          status: rec.status,
          marked_by: "11111111-1111-1111-1111-111111111111",
          created_at: new Date().toISOString()
        };
        this.attendance.push(newAtt);
        this.addAudit('attendance', newAtt.id, 'INSERT', null, newAtt);
      }
    });
    this.notify();
  }

  // --- MARKS ---
  saveMarks(examId: string, records: Array<{ student_id: string; obtained: number | null; absent: boolean }>) {
    records.forEach(rec => {
      const existingIdx = this.marks.findIndex(m => m.exam_id === examId && m.student_id === rec.student_id);
      if (existingIdx >= 0) {
        const old = this.marks[existingIdx];
        this.marks[existingIdx] = {
          ...old,
          obtained: rec.absent ? null : rec.obtained,
          absent: rec.absent,
          updated_at: new Date().toISOString()
        };
        this.addAudit('marks', old.id, 'UPDATE', old, this.marks[existingIdx]);
      } else {
        const newMark: Mark = {
          id: `mk-${Date.now()}-${rec.student_id}`,
          exam_id: examId,
          student_id: rec.student_id,
          obtained: rec.absent ? null : rec.obtained,
          absent: rec.absent,
          updated_by: "11111111-1111-1111-1111-111111111111",
          updated_at: new Date().toISOString()
        };
        this.marks.push(newMark);
        this.addAudit('marks', newMark.id, 'INSERT', null, newMark);
      }
    });
    this.notify();
  }

  // --- FEES ---
  toggleFeeStatus(studentId: string, month: string) {
    const existing = this.fees.find(f => f.student_id === studentId && f.month === month);
    if (existing) {
      const nextStatus = existing.status === 'paid' ? 'pending' : 'paid';
      const old = { ...existing };
      existing.status = nextStatus;
      existing.amount = nextStatus === 'paid' ? this.monthlyFeeAmount : null;
      existing.paid_on = nextStatus === 'paid' ? new Date().toISOString().split('T')[0] : null;
      this.addAudit('fee_payments', existing.id, 'UPDATE', old, existing);
    } else {
      const newFee: FeePayment = {
        id: `fee-${studentId}-${month}`,
        student_id: studentId,
        month,
        status: 'paid',
        paid_on: new Date().toISOString().split('T')[0],
        amount: this.monthlyFeeAmount,
        recorded_by: "11111111-1111-1111-1111-111111111111",
        created_at: new Date().toISOString()
      };
      this.fees.push(newFee);
      this.addAudit('fee_payments', newFee.id, 'INSERT', null, newFee);
    }
    this.notify();
  }

  updateMonthlyFeeAmount(newAmount: number) {
    this.monthlyFeeAmount = newAmount;
    this.notify();
  }

  // --- TIMETABLE ---
  setTimetableEntry(sectionId: string, day: number, periodNo: number, subject: string, teacherId: string) {
    // Double-booking check: is this teacher assigned to ANY other section on this day & period?
    const conflict = this.timetableEntries.find(e => 
      e.teacher_id === teacherId &&
      e.day === day &&
      e.period_no === periodNo &&
      e.section_id !== sectionId
    );

    if (conflict) {
      const conflictSec = this.sections.find(s => s.id === conflict.section_id);
      const teacher = this.teachers.find(t => t.id === teacherId);
      throw new Error(`Double-booking conflict: ${teacher?.full_name} is already assigned to Class ${conflictSec?.grade}-${conflictSec?.name} in Period ${periodNo}!`);
    }

    const existingIdx = this.timetableEntries.findIndex(e => 
      e.section_id === sectionId && e.day === day && e.period_no === periodNo
    );

    if (existingIdx >= 0) {
      this.timetableEntries[existingIdx] = {
        ...this.timetableEntries[existingIdx],
        subject,
        teacher_id: teacherId
      };
    } else {
      this.timetableEntries.push({
        id: `tt-${sectionId}-${day}-${periodNo}`,
        version_id: "66666666-6666-6666-6666-000000000001",
        section_id: sectionId,
        day,
        period_no: periodNo,
        subject,
        teacher_id: teacherId
      });
    }
    this.notify();
  }

  // --- EVENTS ---
  addEvent(event: Omit<Event, 'id' | 'created_at' | 'created_by'>) {
    const newEvent: Event = {
      ...event,
      id: `ev-${Date.now()}`,
      created_by: "11111111-1111-1111-1111-111111111111",
      created_at: new Date().toISOString()
    };
    this.events.unshift(newEvent);
    this.notify();
  }

  // --- NOTIFICATIONS ---
  addNotification(notif: Omit<Notification, 'id' | 'created_at' | 'created_by'>) {
    const newNotif: Notification = {
      ...notif,
      id: `notif-${Date.now()}`,
      created_by: "11111111-1111-1111-1111-111111111111",
      created_at: new Date().toISOString()
    };
    this.notifications.unshift(newNotif);
    this.notify();
  }

  // --- EXPENSES ---
  addExpense(exp: Omit<Expense, 'id' | 'created_at' | 'created_by'>) {
    const newExp: Expense = {
      ...exp,
      id: `exp-${Date.now()}`,
      created_by: "11111111-1111-1111-1111-111111111111",
      created_at: new Date().toISOString()
    };
    this.expenses.unshift(newExp);
    this.notify();
  }

  // --- SPORTS ---
  registerStudentSport(slotId: string, studentId: string, details: string) {
    const existing = this.sportRegistrations.find(r => r.slot_id === slotId && r.student_id === studentId);
    if (existing) {
      throw new Error("Student is already registered in this sport slot.");
    }
    const reg: SportRegistration = {
      id: `sp-${Date.now()}`,
      slot_id: slotId,
      student_id: studentId,
      details,
      registered_by: "11111111-1111-1111-1111-111111111111",
      created_at: new Date().toISOString()
    };
    this.sportRegistrations.push(reg);
    this.notify();
  }

  // --- 3+ DAYS ABSENT VIEW ---
  getConsecutiveAbsentStudents() {
    // Finds students with 3 or more absences across the 3 seeded dates
    const alertList: Array<{
      student: Student;
      section: Section;
      consecutiveDays: number;
    }> = [];

    this.students.filter(s => s.status === 'active').forEach(s => {
      const studentAtt = this.attendance.filter(a => a.student_id === s.id);
      const absentCount = studentAtt.filter(a => a.status === 'absent').length;
      if (absentCount >= 3) {
        const sec = this.sections.find(sec => sec.id === s.section_id);
        if (sec) {
          alertList.push({
            student: s,
            section: sec,
            consecutiveDays: absentCount
          });
        }
      }
    });

    return alertList;
  }
}

export const schoolStore = new SchoolStore();
