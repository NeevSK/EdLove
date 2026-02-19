export interface Assignment {
    id: string;
    classroom_id: string;
    lesson_id?: string;
    title: string;
    description?: string;
    due_date?: string;
    max_points?: number;
    created_at: string;
    updated_at: string;
}
