export type AttendanceStatus = 'present' | 'absent' | 'late';

export interface StudentAttendance {
    id: string;
    student_id: string;
    full_name: string;
    roll_number?: number;
    status: AttendanceStatus;
}
