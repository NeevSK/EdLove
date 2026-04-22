export type StaffAttendanceStatus = 'present' | 'absent' | 'late' | 'half_day';

export interface StaffAttendance {
  id: string;
  user_id: string;
  school_id: string;
  check_in: string;
  check_out?: string;
  status: StaffAttendanceStatus;
  notes?: string;
  created_at: string;
}
