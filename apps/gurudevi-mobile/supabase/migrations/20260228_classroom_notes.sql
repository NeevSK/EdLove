-- ============================================================
-- Classroom Notes
-- A persistent, date-stamped logbook per classroom.
-- Teachers: private notes + class-wide announcements.
-- Students: personal study notes; can read teacher announcements.
-- Old notes are never deleted — they scroll back in time.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.classroom_notes (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    classroom_id  UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
    author_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content       TEXT NOT NULL,
    note_type     TEXT NOT NULL DEFAULT 'note'
                  CHECK (note_type IN ('note', 'announcement', 'lesson_recap', 'reminder', 'personal')),
    visibility    TEXT NOT NULL DEFAULT 'private'
                  CHECK (visibility IN ('private', 'class')),
    is_pinned     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast per-classroom queries ordered by date
CREATE INDEX IF NOT EXISTS idx_classroom_notes_classroom_date
    ON public.classroom_notes (classroom_id, created_at DESC);

-- Index for author lookups
CREATE INDEX IF NOT EXISTS idx_classroom_notes_author
    ON public.classroom_notes (author_id, classroom_id);

-- ── Row Level Security ────────────────────────────────────────
ALTER TABLE public.classroom_notes ENABLE ROW LEVEL SECURITY;

-- Authors can always read their own notes
CREATE POLICY "classroom_notes_own_read"
    ON public.classroom_notes FOR SELECT
    USING (author_id = auth.uid());

-- Class-wide notes (visibility='class') are readable by any enrolled user
-- We check membership via classrooms.teacher_id (teacher) or classroom_students (students)
CREATE POLICY "classroom_notes_class_read"
    ON public.classroom_notes FOR SELECT
    USING (
        visibility = 'class'
        AND (
            -- Teacher of the classroom
            EXISTS (
                SELECT 1 FROM public.classrooms c
                WHERE c.id = classroom_notes.classroom_id
                  AND c.teacher_id = auth.uid()
            )
            OR
            -- Enrolled student
            EXISTS (
                SELECT 1 FROM public.classroom_students cs
                WHERE cs.classroom_id = classroom_notes.classroom_id
                  AND cs.student_id = auth.uid()
            )
        )
    );

-- Authors can insert their own notes
CREATE POLICY "classroom_notes_insert"
    ON public.classroom_notes FOR INSERT
    WITH CHECK (author_id = auth.uid());

-- Authors can update their own notes
CREATE POLICY "classroom_notes_update"
    ON public.classroom_notes FOR UPDATE
    USING (author_id = auth.uid())
    WITH CHECK (author_id = auth.uid());

-- Only the author can delete (hard-delete; old notes are removed when explicitly requested)
CREATE POLICY "classroom_notes_delete"
    ON public.classroom_notes FOR DELETE
    USING (author_id = auth.uid());
