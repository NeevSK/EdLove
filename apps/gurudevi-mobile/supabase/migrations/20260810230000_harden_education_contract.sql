-- Education contract hardening.
-- Evidence: linked Supabase zero-null scan on 2026-08-10.

ALTER TABLE public.lessons
  ALTER COLUMN order_index SET NOT NULL;

DO $$
BEGIN
  IF to_regclass('public.lesson_materials') IS NOT NULL THEN
    ALTER TABLE public.lesson_materials ALTER COLUMN is_pinned SET NOT NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.student_grades') IS NOT NULL THEN
    ALTER TABLE public.student_grades ALTER COLUMN graded_at SET NOT NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.attendance') IS NOT NULL THEN
    ALTER TABLE public.attendance ALTER COLUMN idempotency_key SET DEFAULT gen_random_uuid();
  END IF;
END $$;
