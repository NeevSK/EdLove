export type AttendanceStatus = 'present' | 'absent' | 'late';

export interface AttendanceRecord {
    id: string;
    classroom_id: string;
    student_id: string;
    status: AttendanceStatus;
    date: string;
    created_at: string;
    updated_at: string;
}

/**
 * View model for attendance UI (includes flattened student info)
 */
export interface StudentAttendance {
    id: string;
    student_id: string;
    full_name: string;
    roll_number?: string | null;
    status: AttendanceStatus;
}
