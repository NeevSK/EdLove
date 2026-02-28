-- Notifications table
-- Used by: NotificationDrawer component
-- One row per notification; polymorphic reference_id covers posts, submissions, etc.

CREATE TABLE IF NOT EXISTS public.notifications (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  type          TEXT NOT NULL CHECK (type IN (
                  'new_submission',    -- student submitted an assignment
                  'submission_graded', -- teacher graded a submission
                  'new_post',          -- new community post
                  'group_joined',      -- someone joined your group
                  'new_message',       -- DM / group message (future)
                  'school_circular',   -- principal sent a circular
                  'system'             -- app-level info
                )),
  title         TEXT NOT NULL,
  body          TEXT,
  is_read       BOOLEAN DEFAULT FALSE NOT NULL,
  reference_id  UUID,                 -- e.g. submission_id, post_id
  reference_type TEXT CHECK (reference_type IN (
                  'submission', 'post', 'classroom', 'group', 'user', 'school'
                )),                   -- which table reference_id points to
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS notifications_user_id_idx      ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx   ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS notifications_unread_idx       ON public.notifications(user_id, is_read) WHERE is_read = FALSE;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Each user can only see their own notifications
CREATE POLICY "notifications_select_own"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Backend functions / triggers insert notifications (not direct user writes)
CREATE POLICY "notifications_insert_service"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- User can mark their own notifications as read
CREATE POLICY "notifications_update_own"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- User can delete their own notifications
CREATE POLICY "notifications_delete_own"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);
