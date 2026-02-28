-- ============================================================
-- Principal Notes (School Logbook)
-- The principal's personal memory-offload layer, scoped to
-- their school. Mirrors the classroom notes topology but:
--   • Always private — this is a personal logbook, not shared
--   • Note types reflect governance work: todo, observation,
--     decision, reminder, note
--   • Todos carry a `is_done` flag (checked off, never deleted)
--   • Optional context: tag an entry to a specific teacher or
--     classroom (for walk-through observations etc.)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.principal_notes (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id           UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    author_id           UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content             TEXT NOT NULL,
    note_type           TEXT NOT NULL DEFAULT 'note'
                        CHECK (note_type IN ('todo', 'observation', 'decision', 'reminder', 'note')),
    is_pinned           BOOLEAN NOT NULL DEFAULT FALSE,
    is_done             BOOLEAN NOT NULL DEFAULT FALSE,   -- for todo items; checked off but kept
    context_teacher_id  UUID REFERENCES public.users(id) ON DELETE SET NULL,
    context_classroom_id UUID REFERENCES public.classrooms(id) ON DELETE SET NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Fast per-school queries ordered newest-first
CREATE INDEX IF NOT EXISTS idx_principal_notes_school_date
    ON public.principal_notes (school_id, created_at DESC);

-- Fast author lookups (one principal can manage multiple schools)
CREATE INDEX IF NOT EXISTS idx_principal_notes_author
    ON public.principal_notes (author_id, school_id);

-- ── Row Level Security ────────────────────────────────────────
ALTER TABLE public.principal_notes ENABLE ROW LEVEL SECURITY;

-- Only the author can read their own notes (fully private logbook)
CREATE POLICY "principal_notes_own_read"
    ON public.principal_notes FOR SELECT
    USING (author_id = auth.uid());

-- Only the author can insert
CREATE POLICY "principal_notes_insert"
    ON public.principal_notes FOR INSERT
    WITH CHECK (author_id = auth.uid());

-- Only the author can update
CREATE POLICY "principal_notes_update"
    ON public.principal_notes FOR UPDATE
    USING (author_id = auth.uid());

-- Only the author can delete
CREATE POLICY "principal_notes_delete"
    ON public.principal_notes FOR DELETE
    USING (author_id = auth.uid());
