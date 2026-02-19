export interface AttendanceRecord {
    id: string;
    classroom_id: string;
    student_id: string;
    status: 'present' | 'absent' | 'late';
    date: string;
    created_at: string;
    updated_at: string;
}
