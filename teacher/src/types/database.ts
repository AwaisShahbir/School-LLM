export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'admin' | 'teacher';
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'leave';
export type ExamType = 'weekly' | 'monthly' | 'term' | 'annual';
export type StudentStatus = 'active' | 'left' | 'passed_out';
export type VersionStatus = 'draft' | 'proposed' | 'approved';
export type FeePaymentStatus = 'paid' | 'pending';

export interface TeacherProfile {
  id: string;
  role: UserRole;
  full_name: string;
  cnic: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  qualification: string | null;
  photo_path: string | null;
  subject: string | null;
  joining_date: string | null;
  resignation_date: string | null;
  active: boolean;
  must_change_password: boolean;
  created_at: string;
}

export interface Section {
  id: string;
  grade: number;
  name: string;
  class_teacher_id: string | null;
}

export interface Student {
  id: string;
  section_id: string;
  roll_no: number;
  full_name: string;
  father_name: string | null;
  b_form: string | null;
  dob: string | null;
  address: string | null;
  phone1: string | null;
  phone2: string | null;
  admission_date: string;
  status: StudentStatus;
  left_date: string | null;
  created_at: string;
}

export interface Attendance {
  id: string;
  student_id: string;
  date: string;
  status: AttendanceStatus;
  marked_by: string | null;
  created_at: string;
}

export interface Exam {
  id: string;
  section_id: string;
  subject: string;
  type: ExamType;
  title: string | null;
  total_marks: number;
  exam_date: string;
  created_by: string | null;
  created_at: string;
}

export interface Mark {
  id: string;
  exam_id: string;
  student_id: string;
  obtained: number | null;
  absent: boolean;
  updated_by: string | null;
  updated_at: string;
}

export interface FeePayment {
  id: string;
  student_id: string;
  month: string;
  status: FeePaymentStatus;
  paid_on: string | null;
  amount: number | null;
  recorded_by: string | null;
  created_at: string;
}

export interface TimetableEntry {
  id: string;
  version_id: string;
  section_id: string;
  day: number;
  period_no: number;
  subject: string;
  teacher_id: string | null;
}

export interface Event {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  audience: string;
  created_by: string | null;
  created_at: string;
}

export interface Game {
  id: string;
  name: string;
  created_at: string;
}

export interface GameSlot {
  id: string;
  game_id: string;
  label: string;
  capacity: number;
  created_at: string;
}

export interface SportRegistration {
  id: string;
  slot_id: string;
  student_id: string;
  details: string | null;
  registered_by: string | null;
  created_at: string;
}
