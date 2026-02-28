-- ============================================================
-- Community Group Enhancements
-- Adds status + join_policy to community tables.
-- Required for:
--   • group_messages RLS (needs community_group_members.status = 'active')
--   • GroupMemberManagement join policy controls
--   • CreateGroupModal creator-as-admin flow
-- ============================================================

-- 1. Add status column to community_group_members
--    Needed by group_messages RLS policy.
ALTER TABLE public.community_group_members
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'
    CHECK (status IN ('active', 'pending', 'banned'));

-- Backfill existing rows as active
UPDATE public.community_group_members SET status = 'active' WHERE status IS NULL;

-- 2. Add join_policy column to community_groups
ALTER TABLE public.community_groups
  ADD COLUMN IF NOT EXISTS join_policy TEXT DEFAULT 'open'
    CHECK (join_policy IN ('open', 'approval_required', 'invite_only'));

-- 3. Add group_type column if it doesn't already exist (older baseline may lack it)
ALTER TABLE public.community_groups
  ADD COLUMN IF NOT EXISTS group_type TEXT DEFAULT 'general'
    CHECK (group_type IN ('class', 'interest', 'staff', 'public', 'general', 'club', 'subject'));

-- 4. Add image_url (group profile picture / avatar)
ALTER TABLE public.community_groups
  ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 5. Add member_count column (maintained by triggers below) if not present
ALTER TABLE public.community_groups
  ADD COLUMN IF NOT EXISTS member_count INTEGER DEFAULT 0;

-- Backfill member_count for existing groups
UPDATE public.community_groups g
SET member_count = (
  SELECT COUNT(*) FROM public.community_group_members m
  WHERE m.group_id = g.id AND m.status = 'active'
);

-- 5. Trigger: keep member_count accurate on insert/delete/update of status
CREATE OR REPLACE FUNCTION public.update_group_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.community_groups
    SET member_count = (
      SELECT COUNT(*) FROM public.community_group_members
      WHERE group_id = NEW.group_id AND status = 'active'
    )
    WHERE id = NEW.group_id;
  END IF;

  IF TG_OP = 'DELETE' THEN
    UPDATE public.community_groups
    SET member_count = (
      SELECT COUNT(*) FROM public.community_group_members
      WHERE group_id = OLD.group_id AND status = 'active'
    )
    WHERE id = OLD.group_id;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_group_member_count ON public.community_group_members;
CREATE TRIGGER trg_group_member_count
  AFTER INSERT OR UPDATE OR DELETE ON public.community_group_members
  FOR EACH ROW EXECUTE FUNCTION public.update_group_member_count();

-- 6. RLS: members can select their own membership row
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'community_group_members'
      AND policyname = 'group_members_self_read'
  ) THEN
    CREATE POLICY "group_members_self_read"
      ON public.community_group_members FOR SELECT
      USING (user_id = auth.uid());
  END IF;
END $$;

-- 7. RLS: anyone can join an open group (insert with status='active')
--    For restricted groups the app sets status='pending' and admin approves.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'community_group_members'
      AND policyname = 'group_members_join'
  ) THEN
    CREATE POLICY "group_members_join"
      ON public.community_group_members FOR INSERT
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- 8. RLS: group admins can update member status (approve / ban)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'community_group_members'
      AND policyname = 'group_members_admin_update'
  ) THEN
    CREATE POLICY "group_members_admin_update"
      ON public.community_group_members FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM public.community_group_members a
          WHERE a.group_id = community_group_members.group_id
            AND a.user_id = auth.uid()
            AND a.role = 'admin'
            AND a.status = 'active'
        )
      );
  END IF;
END $$;
