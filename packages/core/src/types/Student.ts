export interface Student {
    id: string;
    class_id: string;
    student_id?: string | null; // ID of the user profile if claimed
    full_name: string;
    roll_number?: string | null;
    index_number?: string | null;
    notes?: string | null;
    parent_phone?: string | null;
    guardian_name?: string | null;
    is_claimed?: boolean;
    invite_code?: string | null;
    created_at: string;
    updated_at: string;
}

export type ClassroomStudent = Student;
