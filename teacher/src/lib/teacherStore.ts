import {
  isSupabaseConfigured,
  supabase,
  remoteClient,
  bridgeClient,
  setActiveClient,
  activeSupabase
} from './supabase';
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
    this.exams = [];
    this.marks = [];
    this.fees = [];
    this.timetableEntries = [];
    this.events = [];
    this.notifications = [];
    this.games = [];
    this.gameSlots = [];
    this.sportRegistrations = [];

    if (isSupabaseConfigured) {
      this.loadFromSupabase();
    }
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => fn());
  }

  async loadFromSupabase() {
    if (!isSupabaseConfigured) return;
    try {
      const [
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
        { data: tts }
      ] = await Promise.all([
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
        supabase.from('timetable_entries').select('*')
      ]);

      if (secs) this.sections = secs as unknown as Section[];
      if (stus) this.students = stus as unknown as Student[];
      if (atts) this.attendance = atts as unknown as Attendance[];
      if (fees) this.fees = fees as unknown as FeePayment[];
      if (exms) this.exams = exms as unknown as Exam[];
      if (mrks) this.marks = mrks as unknown as Mark[];
      if (evts) this.events = evts as unknown as Event[];
      if (notifs) {
        this.notifications = notifs as unknown as Notification[];
        this.unreadNotificationCount = this.notifications.length;
      }
      if (gms) this.games = gms as unknown as Game[];
      if (slots) this.gameSlots = slots as unknown as GameSlot[];
      if (spRegs) this.sportRegistrations = spRegs as unknown as SportRegistration[];
      if (tts) this.timetableEntries = tts as unknown as TimetableEntry[];

      this.notify();
    } catch (err) {
      console.warn('TeacherStore: Failed to load from Supabase:', err);
    }
  }

  // --- AUTHENTICATION BY CNIC ---
  async login(cnic: string, password: string): Promise<{ success: boolean; mustChangePassword?: boolean; error?: string }> {
    const clean = cnic.replace(/\D/g, '');
    if (clean.length !== 13) {
      return { success: false, error: 'CNIC must be exactly 13 numeric digits.' };
    }

    if (!password || password.trim().length === 0) {
      return { success: false, error: 'Please enter your password.' };
    }

    if (!isSupabaseConfigured) {
      return { success: false, error: 'Database is not configured.' };
    }

    try {
      let { data, error } = await supabase.rpc('teacher_login', {
        p_cnic: clean,
        p_password: password
      });

      // If network failed, toggle between bridge and remote client and retry
      if (error && (error.message?.includes('Network request failed') || error.message?.includes('fetch failed'))) {
        const altClient = activeSupabase === bridgeClient ? remoteClient : bridgeClient;
        const retryRes = await altClient.rpc('teacher_login', {
          p_cnic: clean,
          p_password: password
        });
        if (!retryRes.error) {
          setActiveClient(altClient === bridgeClient);
          data = retryRes.data;
          error = null;
        } else {
          error = retryRes.error;
        }
      }

      if (error) {
        console.error('Teacher RPC login error:', error.message);
        return { success: false, error: error.message || 'Login request failed.' };
      }

      if (!data) {
        return { success: false, error: 'No response from authentication server.' };
      }

      if (!data.success) {
        return { success: false, error: data.error || 'Invalid credentials.' };
      }

      // Valid registered teacher authenticated by Supabase
      this.currentTeacher = data.teacher as unknown as TeacherProfile;
      await this.loadFromSupabase();
      this.notify();

      return {
        success: true,
        mustChangePassword: Boolean(data.must_change_password)
      };
    } catch (err: any) {
      console.error('Teacher login exception:', err);
      return { success: false, error: err.message || 'Connection error. Please try again.' };
    }
  }

  async completePasswordChange(newPassword: string): Promise<{ success: boolean; error?: string }> {
    if (!this.currentTeacher || !this.currentTeacher.cnic) {
      return { success: false, error: 'No active session.' };
    }

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.rpc('teacher_change_password', {
          p_cnic: this.currentTeacher.cnic,
          p_new_password: newPassword
        });

        if (error) {
          return { success: false, error: error.message };
        }
        if (data && !data.success) {
          return { success: false, error: data.error || 'Password update failed.' };
        }
      } catch (err: any) {
        console.warn('TeacherStore: Failed to change password in Supabase:', err);
      }
    }

    this.currentTeacher.must_change_password = false;
    this.notify();
    return { success: true };
  }

  logout() {
    this.currentTeacher = null;
    this.sections = [];
    this.students = [];
    this.attendance = [];
    this.exams = [];
    this.marks = [];
    this.fees = [];
    this.timetableEntries = [];
    this.events = [];
    this.notifications = [];
    this.games = [];
    this.gameSlots = [];
    this.sportRegistrations = [];
    this.notify();
  }

  // Check if current teacher leads the given section
  isClassTeacher(sectionId: string): boolean {
    const sec = this.sections.find(s => s.id === sectionId);
    return Boolean(sec?.class_teacher_id && sec.class_teacher_id === this.currentTeacher?.id);
  }

  // --- ATTENDANCE ---
  async saveAttendance(date: string, records: Array<{ student_id: string; status: AttendanceStatus }>) {
    const upsertRows: Array<{
      id: string;
      student_id: string;
      date: string;
      status: AttendanceStatus;
      marked_by: string | null;
      created_at: string;
    }> = [];

    records.forEach(r => {
      const existingIdx = this.attendance.findIndex(a => a.student_id === r.student_id && a.date === date);
      const rowId = existingIdx >= 0 ? this.attendance[existingIdx].id : `att-${r.student_id}-${date}`;
      const newAtt: Attendance = {
        id: rowId,
        student_id: r.student_id,
        date,
        status: r.status,
        marked_by: this.currentTeacher?.id || null,
        created_at: new Date().toISOString()
      };

      if (existingIdx >= 0) {
        this.attendance[existingIdx].status = r.status;
      } else {
        this.attendance.push(newAtt);
      }

      upsertRows.push(newAtt);
    });

    this.notify();

    if (isSupabaseConfigured && upsertRows.length > 0) {
      try {
        await supabase.from('attendance').upsert(upsertRows, { onConflict: 'student_id,date' });
      } catch (err) {
        console.warn('TeacherStore: Failed to persist attendance to Supabase:', err);
      }
    }
  }

  // --- MARKS ---
  async createExam(title: string, type: Exam['type'], totalMarks: number, date: string, sectionId: string) {
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
    this.exams.unshift(newExam);
    this.notify();

    if (isSupabaseConfigured) {
      try {
        await supabase.from('exams').insert([newExam]);
      } catch (err) {
        console.warn('TeacherStore: Failed to insert exam in Supabase:', err);
      }
    }
    return newExam;
  }

  async saveMarks(examId: string, records: Array<{ student_id: string; obtained: number | null; absent: boolean }>) {
    const upsertRows: Array<{
      id: string;
      exam_id: string;
      student_id: string;
      obtained: number | null;
      absent: boolean;
      updated_by: string | null;
      updated_at: string;
    }> = [];

    records.forEach(r => {
      const existingIdx = this.marks.findIndex(m => m.exam_id === examId && m.student_id === r.student_id);
      const rowId = existingIdx >= 0 ? this.marks[existingIdx].id : `mk-${Date.now()}-${r.student_id}`;
      const newMark: Mark = {
        id: rowId,
        exam_id: examId,
        student_id: r.student_id,
        obtained: r.obtained,
        absent: r.absent,
        updated_by: this.currentTeacher?.id || null,
        updated_at: new Date().toISOString()
      };

      if (existingIdx >= 0) {
        this.marks[existingIdx].obtained = r.obtained;
        this.marks[existingIdx].absent = r.absent;
        this.marks[existingIdx].updated_at = new Date().toISOString();
      } else {
        this.marks.push(newMark);
      }

      upsertRows.push(newMark);
    });

    this.notify();

    if (isSupabaseConfigured && upsertRows.length > 0) {
      try {
        await supabase.from('marks').upsert(upsertRows, { onConflict: 'exam_id,student_id' });
      } catch (err) {
        console.warn('TeacherStore: Failed to persist marks in Supabase:', err);
      }
    }
  }

  // --- EVENTS ---
  async addEvent(title: string, description: string, startDate: string) {
    const newEvent: Event = {
      id: `ev-${Date.now()}`,
      title,
      description: description || null,
      start_date: startDate,
      end_date: null,
      created_by: this.currentTeacher?.id || null,
      created_at: new Date().toISOString()
    };
    this.events.unshift(newEvent);
    this.notify();

    if (isSupabaseConfigured) {
      try {
        await supabase.from('events').insert([newEvent]);
      } catch (err) {
        console.warn('TeacherStore: Failed to insert event into Supabase:', err);
      }
    }
    return newEvent;
  }

  // --- SPORTS REGISTRATION ---
  async registerSport(slotId: string, studentId: string, details?: string) {
    const exists = this.sportRegistrations.some(r => r.slot_id === slotId && r.student_id === studentId);
    if (exists) {
      throw new Error("Student is already registered in this sport slot.");
    }
    const newReg: SportRegistration = {
      id: `sp-reg-${Date.now()}`,
      slot_id: slotId,
      student_id: studentId,
      details: details || null,
      registered_by: this.currentTeacher?.id || null,
      created_at: new Date().toISOString()
    };
    this.sportRegistrations.push(newReg);
    this.notify();

    if (isSupabaseConfigured) {
      try {
        await supabase.from('sport_registrations').insert([newReg]);
      } catch (err) {
        console.warn('TeacherStore: Failed to insert sport registration into Supabase:', err);
      }
    }
    return newReg;
  }

  // --- TEACHER PROFILE EDIT ---
  async updateOwnProfile(updates: { phone?: string; address?: string; qualification?: string }) {
    if (!this.currentTeacher) return;
    this.currentTeacher = {
      ...this.currentTeacher,
      phone: updates.phone !== undefined ? updates.phone : this.currentTeacher.phone,
      address: updates.address !== undefined ? updates.address : this.currentTeacher.address,
      qualification: updates.qualification !== undefined ? updates.qualification : this.currentTeacher.qualification
    };
    this.notify();

    if (isSupabaseConfigured && this.currentTeacher.id) {
      try {
        await supabase
          .from('profiles')
          .update({
            phone: this.currentTeacher.phone,
            address: this.currentTeacher.address,
            qualification: this.currentTeacher.qualification
          })
          .eq('id', this.currentTeacher.id);
      } catch (err) {
        console.warn('TeacherStore: Failed to update profile in Supabase:', err);
      }
    }
  }
}

export const teacherStore = new TeacherStore();
