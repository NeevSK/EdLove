export interface PrincipalNote {
    id: string;
    school_id: string;
    author_id: string;
    content: string;
    /**
     * 'todo'        = action item ("do this tomorrow")
     * 'observation' = classroom/teacher walk-through note
     * 'decision'    = strategic decision logged with reasoning
     * 'reminder'    = time-sensitive alert to self
     * 'note'        = general free-form entry
     */
    note_type: 'todo' | 'observation' | 'decision' | 'reminder' | 'note';
    is_pinned: boolean;
    /** For todo items: checked off but never deleted — the history stays */
    is_done: boolean;
    /** Optional: tag this note to a specific teacher */
    context_teacher_id: string | null;
    /** Optional: tag this note to a specific classroom */
    context_classroom_id: string | null;
    /** Joined from users table when fetching (context teacher name) */
    context_teacher?: { full_name: string } | null;
    /** Joined from classrooms table when fetching (context classroom name) */
    context_classroom?: { name: string } | null;
    created_at: string;
    updated_at: string;
}
