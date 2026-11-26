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
        Insert: {
          id: string;
          role: UserRole;
          full_name: string;
          cnic?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          qualification?: string | null;
          photo_path?: string | null;
          subject?: string | null;
          joining_date?: string | null;
          resignation_date?: string | null;
          active?: boolean;
          must_change_password?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          role?: UserRole;
          full_name?: string;
          cnic?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          qualification?: string | null;
          photo_path?: string | null;
          subject?: string | null;
          joining_date?: string | null;
          resignation_date?: string | null;
          active?: boolean;
          must_change_password?: boolean;
          created_at?: string;
        };
      };
      salary_records: {
        Row: {
          id: string;
          teacher_id: string;
          month: string;
          amount: number;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          teacher_id: string;
          month: string;
          amount: number;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          teacher_id?: string;
          month?: string;
          amount?: number;
          note?: string | null;
          created_at?: string;
        };
      };
      sections: {
        Row: {
          id: string;
          grade: number;
          name: string;
          class_teacher_id: string | null;
        };
        Insert: {
          id?: string;
          grade: number;
          name: string;
          class_teacher_id?: string | null;
        };
        Update: {
          id?: string;
          grade?: number;
          name?: string;
          class_teacher_id?: string | null;
        };
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
        Insert: {
          id?: string;
          section_id: string;
          roll_no: number;
          full_name: string;
          father_name?: string | null;
          b_form?: string | null;
          dob?: string | null;
          address?: string | null;
          phone1?: string | null;
          phone2?: string | null;
          admission_date?: string;
          status?: StudentStatus;
          left_date?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          section_id?: string;
          roll_no?: number;
          full_name?: string;
          father_name?: string | null;
          b_form?: string | null;
          dob?: string | null;
          address?: string | null;
          phone1?: string | null;
          phone2?: string | null;
          admission_date?: string;
          status?: StudentStatus;
          left_date?: string | null;
          created_at?: string;
        };
      };
      student_documents: {
        Row: {
          id: string;
          student_id: string;
          label: string;
          storage_path: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          label: string;
          storage_path: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          label?: string;
          storage_path?: string;
          created_at?: string;
        };
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
        Insert: {
          id?: string;
          student_id: string;
          date: string;
          status: AttendanceStatus;
          marked_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          date?: string;
          status?: AttendanceStatus;
          marked_by?: string | null;
          created_at?: string;
        };
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
        Insert: {
          id?: string;
          section_id: string;
          subject: string;
          type: ExamType;
          title?: string | null;
          total_marks: number;
          exam_date: string;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          section_id?: string;
          subject?: string;
          type?: ExamType;
          title?: string | null;
          total_marks?: number;
          exam_date?: string;
          created_by?: string | null;
          created_at?: string;
        };
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
        Insert: {
          id?: string;
          exam_id: string;
          student_id: string;
          obtained?: number | null;
          absent?: boolean;
          updated_by?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          exam_id?: string;
          student_id?: string;
          obtained?: number | null;
          absent?: boolean;
          updated_by?: string | null;
          updated_at?: string;
        };
      };
      fee_settings: {
        Row: {
          id: string;
          monthly_amount: number;
          effective_from: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          monthly_amount: number;
          effective_from: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          monthly_amount?: number;
          effective_from?: string;
          created_at?: string;
        };
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
        Insert: {
          id?: string;
          student_id: string;
          month: string;
          status?: FeePaymentStatus;
          paid_on?: string | null;
          amount?: number | null;
          recorded_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          month?: string;
          status?: FeePaymentStatus;
          paid_on?: string | null;
          amount?: number | null;
          recorded_by?: string | null;
          created_at?: string;
        };
      };
      period_config: {
        Row: {
          period_no: number;
          start_time: string;
          end_time: string;
        };
        Insert: {
          period_no: number;
          start_time: string;
          end_time: string;
        };
        Update: {
          period_no?: number;
          start_time?: string;
          end_time?: string;
        };
      };
      timetable_versions: {
        Row: {
          id: string;
          name: string;
          status: VersionStatus;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          status?: VersionStatus;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          status?: VersionStatus;
          created_by?: string | null;
          created_at?: string;
        };
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
        Insert: {
          id?: string;
          version_id: string;
          section_id: string;
          day: number;
          period_no: number;
          subject: string;
          teacher_id?: string | null;
        };
        Update: {
          id?: string;
          version_id?: string;
          section_id?: string;
          day?: number;
          period_no?: number;
          subject?: string;
          teacher_id?: string | null;
        };
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
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          start_date: string;
          end_date?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          start_date?: string;
          end_date?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
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
        Insert: {
          id?: string;
          title: string;
          body: string;
          audience?: string;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          body?: string;
          audience?: string;
          created_by?: string | null;
          created_at?: string;
        };
      };
      notification_recipients: {
        Row: {
          notification_id: string;
          teacher_id: string;
          read_at: string | null;
        };
        Insert: {
          notification_id: string;
          teacher_id: string;
          read_at?: string | null;
        };
        Update: {
          notification_id?: string;
          teacher_id?: string;
          read_at?: string | null;
        };
      };
      games: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
        };
      };
      game_slots: {
        Row: {
          id: string;
          game_id: string;
          label: string;
          capacity: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          game_id: string;
          label: string;
          capacity: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          game_id?: string;
          label?: string;
          capacity?: number;
          created_at?: string;
        };
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
        Insert: {
          id?: string;
          slot_id: string;
          student_id: string;
          details?: string | null;
          registered_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          slot_id?: string;
          student_id?: string;
          details?: string | null;
          registered_by?: string | null;
          created_at?: string;
        };
      };
      expenses: {
        Row: {
          id: string;
          date: string;
          category: string;
          amount: number;
          note: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          date?: string;
          category: string;
          amount: number;
          note?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          category?: string;
          amount?: number;
          note?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
      };
      audit_log: {
        Row: {
          id: number;
          table_name: string;
          row_id: string;
          action: string;
          old_data: Json | null;
          new_data: Json | null;
          changed_by: string | null;
          changed_at: string;
        };
        Insert: {
          id?: number;
          table_name: string;
          row_id: string;
          action: string;
          old_data?: Json | null;
          new_data?: Json | null;
          changed_by?: string | null;
          changed_at?: string;
        };
        Update: {
          id?: number;
          table_name?: string;
          row_id?: string;
          action?: string;
          old_data?: Json | null;
          new_data?: Json | null;
          changed_by?: string | null;
          changed_at?: string;
        };
      };
    };
    Views: {
      absent_in_a_row_alert: {
        Row: {
          student_id: string;
          full_name: string;
          roll_no: number;
          section_id: string;
          grade: number;
          section_name: string;
          consecutive_absent_count: number;
        };
      };
    };
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_teacher: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      update_own_profile: {
        Args: {
          p_phone: string | null;
          p_address: string | null;
          p_email: string | null;
          p_qualification: string | null;
          p_photo_path: string | null;
        };
        Returns: void;
      };
      complete_password_change: {
        Args: Record<PropertyKey, never>;
        Returns: void;
      };
    };
  };
}
