-- ============================================================================
-- Migration: 20260309000003_fix_anonymous_role_constraint
-- Purpose:   Fix anonymous user sign-in after role constraint violation.
--
-- Issues found from Postgres logs after migration 20260309000002:
--   1. ERROR: new row for relation "users" violates check constraint "users_role_check"
--      Trigger was inserting role='guest' which is NOT in the allowed set.
--      Fix: Add 'guest' and 'developer' to the check constraint.
--   2. ERROR: infinite recursion detected in policy for relation "community_group_members"
--      The policy referenced itself. Fixed with SECURITY DEFINER helper function.
-- ============================================================================

-- Fix 1: Add 'guest' and 'developer' to the role check constraint
ALTER TABLE public.users
DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE public.users
ADD CONSTRAINT users_role_check CHECK (
  role IS NULL OR role = ANY (ARRAY[
    'founder'::text,
    'admin'::text,
    'principal'::text,
    'section_head'::text,
    'grade_head'::text,
    'teacher'::text,
    'student'::text,
    'guest'::text,
    'developer'::text
  ])
);

-- Fix 2: Fix infinite recursion in community_group_members RLS policy.
-- The policy referenced community_group_members to check admin status,
-- causing infinite recursion. Use a SECURITY DEFINER function to break the cycle.

CREATE OR REPLACE FUNCTION public.is_group_admin(p_group_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.community_group_members
        WHERE group_id = p_group_id
          AND user_id = get_my_id()
          AND role = 'admin'
          AND status = 'active'
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp;

DROP POLICY IF EXISTS "group_members_management_v2" ON public.community_group_members;
CREATE POLICY "group_members_management_v3"
    ON public.community_group_members FOR ALL
    USING (
        is_group_admin(community_group_members.group_id)
        OR community_group_members.user_id = get_my_id()
    )
    WITH CHECK (
        is_group_admin(community_group_members.group_id)
        OR community_group_members.user_id = get_my_id()
    );

DROP POLICY IF EXISTS "group_messages_member_read" ON public.group_messages;
CREATE POLICY "group_messages_member_read"
    ON public.group_messages FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.community_group_members m
        WHERE m.group_id = group_messages.group_id
        AND m.user_id = get_my_id()
        AND m.status = 'active'
    ));

DROP POLICY IF EXISTS "group_messages_member_insert" ON public.group_messages;
CREATE POLICY "group_messages_member_insert"
    ON public.group_messages FOR INSERT
    WITH CHECK (
        author_id = get_my_id()
        AND EXISTS (
            SELECT 1 FROM public.community_group_members m
            WHERE m.group_id = group_messages.group_id
            AND m.user_id = get_my_id()
            AND m.status = 'active'
        )
    );
