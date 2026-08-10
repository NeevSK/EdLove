-- Education contract hardening.
-- Evidence: linked Supabase zero-null scan on 2026-08-10.

ALTER TABLE public.lessons
  ALTER COLUMN order_index SET NOT NULL;

ALTER TABLE public.lesson_materials
  ALTER COLUMN is_pinned SET NOT NULL;

ALTER TABLE public.student_grades
  ALTER COLUMN graded_at SET NOT NULL;

ALTER TABLE public.attendance
  ALTER COLUMN idempotency_key SET DEFAULT gen_random_uuid();
