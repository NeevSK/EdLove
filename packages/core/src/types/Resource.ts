export interface LessonMaterial {
    id: string;
    classroom_id: string;
    lesson_id?: string;
    title: string;
    type: 'pdf' | 'link' | 'note' | 'video' | 'text' | 'doc';
    url?: string;
    content?: string;
    is_pinned: boolean;
    created_at: string;
    updated_at: string;
}

export interface ClassroomResource {
    id: string;
    classroom_id: string;
    teacher_id: string;
    title: string;
    description?: string;
    type: 'pdf' | 'link' | 'note' | 'video' | 'text' | 'doc';
    url?: string;
    content?: string;
    is_pinned: boolean;
    created_at: string;
    updated_at: string;
}
