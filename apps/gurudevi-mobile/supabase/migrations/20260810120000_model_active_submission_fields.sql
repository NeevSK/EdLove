-- Reconcile fields used by the active assignment submission repository.
-- Safe to apply repeatedly; deploy to staging before production.

ALTER TABLE public.submissions
  ADD COLUMN IF NOT EXISTS photo_url TEXT;

CREATE INDEX IF NOT EXISTS submissions_student_submitted_at_idx
  ON public.submissions (student_id, submitted_at DESC);

CREATE INDEX IF NOT EXISTS submissions_assignment_submitted_at_idx
  ON public.submissions (assignment_id, submitted_at DESC);

CREATE INDEX IF NOT EXISTS notifications_user_created_at_idx
  ON public.notifications (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS notifications_user_is_read_idx
  ON public.notifications (user_id, is_read);
