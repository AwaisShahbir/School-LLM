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

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
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
        };
        Insert: Partial<Database['public']['Tables']['profiles']['Row']>;
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
      };
      sections: {
        Row: {
          id: string;
          grade: number;
          name: string;
          class_teacher_id: string | null;
        };
        Insert: Partial<Database['public']['Tables']['sections']['Row']>;
        Update: Partial<Database['public']['Tables']['sections']['Row']>;
      };
      students: {
        Row: {
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
        };
        Insert: Partial<Database['public']['Tables']['students']['Row']>;
        Update: Partial<Database['public']['Tables']['students']['Row']>;
      };
      attendance: {
        Row: {
          id: string;
          student_id: string;
          date: string;
          status: AttendanceStatus;
          marked_by: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['attendance']['Row']>;
        Update: Partial<Database['public']['Tables']['attendance']['Row']>;
      };
      exams: {
        Row: {
          id: string;
          section_id: string;
          subject: string;
          type: ExamType;
          title: string | null;
          total_marks: number;
          exam_date: string;
          created_by: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['exams']['Row']>;
        Update: Partial<Database['public']['Tables']['exams']['Row']>;
      };
      marks: {
        Row: {
          id: string;
          exam_id: string;
          student_id: string;
          obtained: number | null;
          absent: boolean;
          updated_by: string | null;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['marks']['Row']>;
        Update: Partial<Database['public']['Tables']['marks']['Row']>;
      };
      fee_payments: {
        Row: {
          id: string;
          student_id: string;
          month: string;
          status: FeePaymentStatus;
          paid_on: string | null;
          amount: number | null;
          recorded_by: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['fee_payments']['Row']>;
        Update: Partial<Database['public']['Tables']['fee_payments']['Row']>;
      };
      timetable_entries: {
        Row: {
          id: string;
          version_id: string;
          section_id: string;
          day: number;
          period_no: number;
          subject: string;
          teacher_id: string | null;
        };
        Insert: Partial<Database['public']['Tables']['timetable_entries']['Row']>;
        Update: Partial<Database['public']['Tables']['timetable_entries']['Row']>;
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          start_date: string;
          end_date: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['events']['Row']>;
        Update: Partial<Database['public']['Tables']['events']['Row']>;
      };
      notifications: {
        Row: {
          id: string;
          title: string;
          body: string;
          audience: string;
          created_by: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['notifications']['Row']>;
        Update: Partial<Database['public']['Tables']['notifications']['Row']>;
      };
      games: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['games']['Row']>;
        Update: Partial<Database['public']['Tables']['games']['Row']>;
      };
      game_slots: {
        Row: {
          id: string;
          game_id: string;
          label: string;
          capacity: number;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['game_slots']['Row']>;
        Update: Partial<Database['public']['Tables']['game_slots']['Row']>;
      };
      sport_registrations: {
        Row: {
          id: string;
          slot_id: string;
          student_id: string;
          details: string | null;
          registered_by: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['sport_registrations']['Row']>;
        Update: Partial<Database['public']['Tables']['sport_registrations']['Row']>;
      };
    };
  };
}

export type TeacherProfile = Database['public']['Tables']['profiles']['Row'];
export type Section = Database['public']['Tables']['sections']['Row'];
export type Student = Database['public']['Tables']['students']['Row'];
export type Attendance = Database['public']['Tables']['attendance']['Row'];
export type Exam = Database['public']['Tables']['exams']['Row'];
export type Mark = Database['public']['Tables']['marks']['Row'];
export type FeePayment = Database['public']['Tables']['fee_payments']['Row'];
export type TimetableEntry = Database['public']['Tables']['timetable_entries']['Row'];
export type Event = Database['public']['Tables']['events']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row'];
export type Game = Database['public']['Tables']['games']['Row'];
export type GameSlot = Database['public']['Tables']['game_slots']['Row'];
export type SportRegistration = Database['public']['Tables']['sport_registrations']['Row'];
