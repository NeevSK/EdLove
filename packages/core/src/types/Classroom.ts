export interface Classroom {
    id: string;
    school_id?: string | null;
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
