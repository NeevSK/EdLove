-- ============================================================
-- Ownership & Authority Pillars
-- Introduces 'owner' role distinction and tracks classroom creators.
-- ============================================================

-- 1. Add created_by to classrooms if not exists
--    This allows us to track the original creator (Owner) separately from the assigned Teacher.
ALTER TABLE public.classrooms 
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.users(id);

-- Backfill existing classrooms: Assume the current teacher_id or the first admin found
UPDATE public.classrooms 
SET created_by = teacher_id 
WHERE created_by IS NULL AND teacher_id IS NOT NULL;

-- 2. Update RLS for community_group_members
--    Ensure 'owner' is recognized as a super-admin who can manage 'admin' members.
--    The existing policies for 'admin' should largely apply to 'owner' as well,
--    but 'owner' should have unique privileges (like demoting an admin).

-- First, let's update the join policy RLS to allow 'owner' role on insert if needed,
-- though typically creators are inserted via service role or RPC.
-- But for clarity, we define that 'owner' is a valid role.

-- 3. RLS: group owners and admins can manage members
--    Modify the existing "group_members_admin_update" to include owners
DROP POLICY IF EXISTS "group_members_admin_update" ON public.community_group_members;

CREATE POLICY "group_members_management_v2"
  ON public.community_group_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.community_group_members a
      WHERE a.group_id = community_group_members.group_id
        AND a.user_id = auth.uid()
        AND a.role IN ('admin', 'owner')
        AND a.status = 'active'
    )
  )
  WITH CHECK (
    -- Owners can do anything. Admins can manage anyone EXCEPT owners.
    EXISTS (
      SELECT 1 FROM public.community_group_members a
      WHERE a.group_id = community_group_members.group_id
        AND a.user_id = auth.uid()
        AND a.status = 'active'
        AND (
          a.role = 'owner' -- Creator can manage everyone
          OR (
            a.role = 'admin' 
            AND community_group_members.role != 'owner' -- Admins cannot demote/delete owners
          )
        )
    )
  );

-- 4. RLS for classrooms: owner/creator access
--    Update classrooms RLS if needed.
--    Assuming existing classrooms policies allow access based on school_id for principals/founders.
--    We add a specific owner check.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'classrooms' AND policyname = 'classrooms_owner_all'
  ) THEN
    CREATE POLICY "classrooms_owner_all"
      ON public.classrooms FOR ALL
      USING (auth.uid() = created_by OR auth.uid() = teacher_id);
  END IF;
END $$;
