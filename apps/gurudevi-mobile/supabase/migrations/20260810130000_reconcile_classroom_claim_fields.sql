-- Reconcile fields used by the existing classroom shadow/claim workflow.
-- Deploy to staging first; this migration is intentionally additive.

ALTER TABLE public.classroom_students
  ADD COLUMN IF NOT EXISTS notes TEXT;

CREATE INDEX IF NOT EXISTS classroom_students_classroom_status_idx
  ON public.classroom_students (classroom_id, status);
