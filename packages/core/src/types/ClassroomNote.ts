export interface ClassroomNote {
  id: string;
  classroom_id: string;
  author_id: string;
  content: string;
  /** 'note' = general teacher note | 'announcement' = visible to class | 'lesson_recap' = what was covered today | 'reminder' = teacher self-reminder | 'personal' = student study note */
  note_type: 'note' | 'announcement' | 'lesson_recap' | 'reminder' | 'personal';
  /** 'private' = only author | 'class' = all enrolled members */
  visibility: 'private' | 'class';
  is_pinned: boolean;
  created_at: Date;
  updated_at: Date;
  /** Joined from users table when fetching */
  author?: { full_name: string; capacity: string };
}
