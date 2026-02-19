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
