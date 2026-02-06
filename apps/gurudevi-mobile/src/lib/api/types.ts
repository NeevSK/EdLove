// ============================================================================
// SHARED TYPES
// ============================================================================

export class APIError extends Error {
    constructor(
        message: string,
        public code?: string,
        public details?: any
    ) {
        super(message);
        this.name = 'APIError';
    }
}

export interface Task {
    id: string;
    title: string;
    description?: string;
    is_completed: boolean;
    teacher_id: string;
    created_at: string;
    updated_at: string;
}

export interface Lesson {
    id: string;
    title: string;
    description?: string;
    teacher_id: string;
    class_id?: string;
    date: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface Student {
    id: string;
    full_name: string;
    grade?: string;
    class_id?: string;
    notes?: string;
    created_at: string;
}

export interface TeacherNote {
    id: string;
    teacher_id: string;
    content: string;
    type: 'venting' | 'reflection' | 'note';
    created_at: string;
    updated_at: string;
}

// Attendance types
export interface AttendanceRecord {
    id: string;
    classroom_id: string;
    student_id: string;
    status: 'present' | 'absent' | 'late';
    date: string;
    created_at: string;
    updated_at: string;
}

// Resource types
export interface ClassroomResource {
    id: string;
    classroom_id: string;
    teacher_id: string;
    title: string;
    description?: string;
    type: 'pdf' | 'link' | 'note';
    url?: string;
    content?: string;
    is_pinned: boolean;
    created_at: string;
    updated_at: string;
}

// Group types
export interface StudentGroup {
    id: string;
    classroom_id: string;
    teacher_id: string;
    name: string;
    description?: string;
    student_ids: string[];
    color: string;
    created_at: string;
    updated_at: string;
}

// Classroom student types
export interface ClassroomStudent {
    id: string;
    classroom_id: string;
    student_id: string;
    full_name: string;
    roll_number?: number;
    notes?: string;
    enrolled_at: string;
}

// Classroom types
export interface Classroom {
    id: string;
    school_id: string;
    grade_id?: string | null;
    teacher_id?: string | null;
    section_id?: string | null;
    name: string;
    subject?: string | null;
    description?: string | null;
    color_theme?: string;
    is_archived?: boolean;
    created_at: string;
    updated_at: string;
}
