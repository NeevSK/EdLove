export interface Task {
    id: string;
    title: string;
    description?: string;
    is_completed: boolean;
    teacher_id: string;
    created_at: string;
    updated_at: string;
}
