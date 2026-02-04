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

// ============================================================================
// SHARED TYPES
// ============================================================================

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
}
