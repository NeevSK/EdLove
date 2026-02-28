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

-- 3. Add group_type column if it doesn't already exist (older baseline may lack it).
--    If the column already existed with a more restrictive CHECK, drop that constraint
--    and replace it with the full allowed set so app-supported values don't fail insert.
ALTER TABLE public.community_groups
  ADD COLUMN IF NOT EXISTS group_type TEXT DEFAULT 'general';

DO $$
DECLARE
  r RECORD;
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'community_groups' AND column_name = 'group_type'
  ) THEN
    -- Drop any existing CHECK constraints referencing group_type
    FOR r IN
      SELECT tc.constraint_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.constraint_column_usage ccu
        ON tc.constraint_name = ccu.constraint_name AND tc.table_schema = ccu.table_schema
      WHERE tc.table_schema = 'public'
        AND tc.table_name = 'community_groups'
        AND tc.constraint_type = 'CHECK'
        AND ccu.column_name = 'group_type'
    LOOP
      EXECUTE format('ALTER TABLE public.community_groups DROP CONSTRAINT %I', r.constraint_name);
    END LOOP;

    -- Recreate with the full unified allowed set
    ALTER TABLE public.community_groups
      ADD CONSTRAINT community_groups_group_type_check
      CHECK (group_type IN ('class', 'interest', 'staff', 'public', 'general', 'club', 'subject'));
  END IF;
END;
$$;

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

-- 7. RLS: users can join a group only as a plain member with appropriate status.
--    • open groups  → status must be 'active'
--    • restricted/invite-only groups → status must be 'pending' (awaiting admin approval)
--    Prevents self-granting admin role or bypassing join policies.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'community_group_members'
      AND policyname = 'group_members_join'
  ) THEN
    CREATE POLICY "group_members_join"
      ON public.community_group_members FOR INSERT
      WITH CHECK (
        user_id = auth.uid()
        AND role = 'member'
        AND EXISTS (
          SELECT 1 FROM public.community_groups g
          WHERE g.id = community_group_members.group_id
            AND (
              (g.join_policy = 'open' AND status = 'active')
              OR (g.join_policy IN ('approval_required', 'invite_only') AND status = 'pending')
            )
        )
      );
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
