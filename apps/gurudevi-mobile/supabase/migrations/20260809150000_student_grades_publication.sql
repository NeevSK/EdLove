-- Add publication and audit columns to student_grades table to align with ZModel Grade definition

BEGIN;

DO $$
BEGIN
  IF to_regclass('public.student_grades') IS NOT NULL THEN
    ALTER TABLE public.student_grades
      ADD COLUMN IF NOT EXISTS publication_state TEXT NOT NULL DEFAULT 'draft',
      ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS published_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS publication_action TEXT,
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
  END IF;
END $$;

COMMIT;
