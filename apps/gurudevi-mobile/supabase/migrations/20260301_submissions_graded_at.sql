-- Migration: add graded_at column to submissions
-- Purpose: The notification trigger trg_notify_grade and usePendingActions both
--          reference submissions.graded_at to detect when a submission is graded.
--          The column was missing from all prior migrations, causing the trigger
--          to error and the pending-actions query to silently treat every submission
--          as ungraded.

ALTER TABLE public.submissions
    ADD COLUMN IF NOT EXISTS graded_at TIMESTAMPTZ;
