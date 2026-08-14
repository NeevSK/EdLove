-- Establishes schema ownership for two real product surfaces that existed in
-- clients and worker code but were missing from the active migration stream:
-- private teacher notes and the self decision journal.
--
-- This migration is intentionally additive and idempotent. It must still pass
-- the normal linked-schema review before deployment; it does not rewrite
-- remote migration history.

CREATE TABLE IF NOT EXISTS public.teacher_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'note'
    CHECK (type IN ('venting', 'reflection', 'note')),
  idempotency_key TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.teacher_notes
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE UNIQUE INDEX IF NOT EXISTS teacher_notes_idempotency_key_idx
  ON public.teacher_notes (idempotency_key)
  WHERE idempotency_key IS NOT NULL;

ALTER TABLE public.teacher_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS teacher_notes_read_own ON public.teacher_notes;
CREATE POLICY teacher_notes_read_own
  ON public.teacher_notes FOR SELECT TO authenticated
  USING (teacher_id = auth.uid());

DROP POLICY IF EXISTS teacher_notes_insert_own ON public.teacher_notes;
CREATE POLICY teacher_notes_insert_own
  ON public.teacher_notes FOR INSERT TO authenticated
  WITH CHECK (teacher_id = auth.uid());

DROP POLICY IF EXISTS teacher_notes_update_own ON public.teacher_notes;
CREATE POLICY teacher_notes_update_own
  ON public.teacher_notes FOR UPDATE TO authenticated
  USING (teacher_id = auth.uid())
  WITH CHECK (teacher_id = auth.uid());

DROP POLICY IF EXISTS teacher_notes_delete_own ON public.teacher_notes;
CREATE POLICY teacher_notes_delete_own
  ON public.teacher_notes FOR DELETE TO authenticated
  USING (teacher_id = auth.uid());

CREATE INDEX IF NOT EXISTS teacher_notes_teacher_created_idx
  ON public.teacher_notes (teacher_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.decision_journals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  decision_text TEXT NOT NULL,
  context TEXT,
  is_reviewed BOOLEAN NOT NULL DEFAULT false,
  idempotency_key TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.decision_journals
  ADD COLUMN IF NOT EXISTS context TEXT,
  ADD COLUMN IF NOT EXISTS is_reviewed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS decision_journals_idempotency_key_idx
  ON public.decision_journals (idempotency_key)
  WHERE idempotency_key IS NOT NULL;

ALTER TABLE public.decision_journals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS decision_journals_read_own ON public.decision_journals;
CREATE POLICY decision_journals_read_own
  ON public.decision_journals FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS decision_journals_insert_own ON public.decision_journals;
CREATE POLICY decision_journals_insert_own
  ON public.decision_journals FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS decision_journals_update_own ON public.decision_journals;
CREATE POLICY decision_journals_update_own
  ON public.decision_journals FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS decision_journals_delete_own ON public.decision_journals;
CREATE POLICY decision_journals_delete_own
  ON public.decision_journals FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS decision_journals_user_created_idx
  ON public.decision_journals (user_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.teacher_notes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.decision_journals TO authenticated;
