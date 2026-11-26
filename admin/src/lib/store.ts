import { isSupabaseConfigured, supabase } from './supabase';
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
  teachers: Teacher[] = [];
  sections: Section[] = [];
  students: Student[] = [];
  attendance: Attendance[] = [];
  fees: FeePayment[] = [];
  exams: Exam[] = [];
  marks: Mark[] = [];
  events: Event[] = [];
  notifications: Notification[] = [];
  games: Game[] = [];
  gameSlots: GameSlot[] = [];
  sportRegistrations: SportRegistration[] = [];
  expenses: Expense[] = [];
  auditLogs: AuditLog[] = [];
  monthlyFeeAmount: number = 3500;
  timetableEntries: TimetableEntry[] = [];

  private listeners: Set<() => void> = new Set();

  constructor() {
    this.timetableEntries = [];
    if (isSupabaseConfigured) {
      this.loadFromSupabase();
    }
  }

  async loadFromSupabase() {
    if (!isSupabaseConfigured) return;
    try {
      const [
        { data: profs },
        { data: secs },
        { data: stus },
        { data: atts },
        { data: fees },
        { data: exms },
        { data: mrks },
        { data: evts },
        { data: notifs },
        { data: gms },
        { data: slots },
        { data: spRegs },
        { data: exps },
        { data: audits }
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('role', 'teacher'),
        supabase.from('sections').select('*').order('grade').order('name'),
        supabase.from('students').select('*').order('roll_no'),
        supabase.from('attendance').select('*'),
        supabase.from('fee_payments').select('*'),
        supabase.from('exams').select('*'),
        supabase.from('marks').select('*'),
        supabase.from('events').select('*'),
        supabase.from('notifications').select('*'),
        supabase.from('games').select('*'),
        supabase.from('game_slots').select('*'),
        supabase.from('sport_registrations').select('*'),
        supabase.from('expenses').select('*'),
        supabase.from('audit_log').select('*').order('changed_at', { ascending: false }).limit(100)
      ]);

      if (profs) this.teachers = profs;
      if (secs) this.sections = secs;
      if (stus) this.students = stus;
      if (atts) this.attendance = atts;
      if (fees) this.fees = fees;
      if (exms) this.exams = exms;
      if (mrks) this.marks = mrks;
      if (evts) this.events = evts;
      if (notifs) this.notifications = notifs;
      if (gms) this.games = gms;
      if (slots) this.gameSlots = slots;
      if (spRegs) this.sportRegistrations = spRegs;
      if (exps) this.expenses = exps;
      if (audits) this.auditLogs = audits;
      this.notify();
    } catch (err) {
      console.error('Failed to load records from Supabase:', err);
    }
  }

  private initTimetable() {
    this.timetableEntries = [];
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

  // --- SECTIONS ---
  addSection(grade: number, name: string, classTeacherId: string | null = null) {
    const exists = this.sections.some(s => s.grade === grade && s.name.toUpperCase() === name.toUpperCase());
    if (exists) {
      throw new Error(`Section Grade ${grade}-${name} already exists.`);
    }
    const id = `sec-${Date.now()}`;
    const newSection: Section = {
      id,
      grade,
      name: name.toUpperCase(),
      class_teacher_id: classTeacherId
    };
    this.sections.push(newSection);
    this.notify();
    return newSection;
  }

  updateSection(id: string, updates: Partial<Section>) {
    this.sections = this.sections.map(s => s.id === id ? { ...s, ...updates } : s);
    this.notify();
  }

  deleteSection(id: string) {
    const hasStudents = this.students.some(s => s.section_id === id && s.status === 'active');
    if (hasStudents) {
      throw new Error("Cannot delete a section with enrolled active students.");
    }
    this.sections = this.sections.filter(s => s.id !== id);
    this.notify();
  }

  // --- TEACHERS ---
  async addTeacher(data: {
    full_name: string;
    cnic: string;
    phone?: string | null;
    subject: string;
    qualification?: string | null;
    salary?: number;
    temp_password?: string;
  }): Promise<{ id: string; cnic: string; temp_password: string; full_name: string }> {
    if (isSupabaseConfigured) {
      const { data: res, error } = await supabase.rpc('admin_create_teacher', {
        p_cnic: data.cnic,
        p_full_name: data.full_name,
        p_subject: data.subject,
        p_phone: data.phone || null,
        p_qualification: data.qualification || 'B.Ed / Masters',
        p_salary: data.salary || 50000,
        p_temp_password: data.temp_password || null
      });

      if (error) {
        throw new Error(error.message);
      }

      await this.loadFromSupabase();
      return {
        id: res.teacher_id,
        cnic: res.cnic,
        temp_password: res.temp_password,
        full_name: data.full_name
      };
    }

    const id = `teach-${Date.now()}`;
    const newTeacher: Teacher = {
      id,
      role: 'teacher',
      full_name: data.full_name,
      cnic: data.cnic,
      phone: data.phone || null,
      email: null,
      address: null,
      qualification: data.qualification || null,
      photo_path: null,
      subject: data.subject,
      joining_date: new Date().toISOString().split('T')[0],
      resignation_date: null,
      active: true,
      must_change_password: true,
      created_at: new Date().toISOString()
    };
    this.teachers.push(newTeacher);
    this.notify();
    return {
      id,
      cnic: data.cnic,
      temp_password: data.temp_password || `Teach#${data.cnic.slice(-4)}`,
      full_name: data.full_name
    };
  }

  updateTeacher(id: string, updates: Partial<Teacher>) {
    this.teachers = this.teachers.map(t => t.id === id ? { ...t, ...updates } : t);
    this.notify();
    if (isSupabaseConfigured) {
      supabase.from('profiles').update(updates).eq('id', id).then(() => {});
    }
  }

  async resetTeacherPassword(id: string, tempPassword?: string): Promise<string> {
    if (isSupabaseConfigured) {
      const { data: res, error } = await supabase.rpc('admin_reset_teacher_password', {
        p_teacher_id: id,
        p_temp_password: tempPassword || null
      });

      if (error) {
        throw new Error(error.message);
      }

      await this.loadFromSupabase();
      return res.temp_password;
    }

    const t = this.teachers.find(tea => tea.id === id);
    if (t) {
      t.must_change_password = true;
      this.notify();
      return `Teach#${(t.cnic || '9999').slice(-4)}`;
    }
    return 'Teach#1234';
  }

  // --- STUDENTS ---
  addStudent(data: Omit<Student, 'id' | 'created_at'>) {
    const activeCount = this.students.filter(s => s.status === 'active').length;
    if (activeCount >= 1000) {
      throw new Error(`Student capacity limit reached (Maximum 1,000 active students allowed). Current active: ${activeCount}.`);
    }
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
    const activeCount = this.students.filter(s => s.status === 'active').length;
    if (activeCount + imported.length > 1000) {
      throw new Error(`Cannot import ${imported.length} students. School database limit is 1,000 active students (Current active: ${activeCount}, Available capacity: ${1000 - activeCount}).`);
    }
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
