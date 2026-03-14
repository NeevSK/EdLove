export interface Classroom {
    id: string;
    school_id?: string | null;
    grade_id?: string | null;
    teacher_id?: string | null;
    section_id?: string | null;
    name: string;
    handle?: string;
    subject?: string | null;
    description?: string | null;
    color_theme?: string;
    syllabus_version?: string;
    is_archived?: boolean;
    /** Academic year label, e.g. '2026'. Set automatically on creation; used for year-end rollover and historical queries. */
    academic_year?: string;
    created_at: string;
    updated_at: string;
}

/**
 * Per-year snapshot of a student's academic record in one classroom.
 * Created at year-end rollover; never mutated after creation so historical
 * patterns are permanently preserved.
 */
export interface StudentAcademicRecord {
    id: string;
    student_id: string;
    classroom_id: string;
    teacher_id?: string | null;
    school_id: string;
    academic_year: string;         // e.g. '2026'
    grade_number?: number | null;
    subject?: string | null;
    handle?: string | null; // Added handle field
    avg_grade?: number | null;
    highest_grade?: number | null;
    lowest_grade?: number | null;
    assignments_total: number;
    assignments_submitted: number;
    teacher_note?: string | null;
    created_at: string;
    updated_at: string;
}
