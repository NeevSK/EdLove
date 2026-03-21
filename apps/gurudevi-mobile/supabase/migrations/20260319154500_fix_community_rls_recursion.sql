-- ============================================================
-- Fix Recursive RLS Policies for Community Groups
-- ============================================================

-- 1. Create is_group_member security definer function
CREATE OR REPLACE FUNCTION public.is_group_member(p_group_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM community_group_members
        WHERE group_id = p_group_id
          AND user_id = get_my_id()
          AND status = 'active'
    );
$$;

-- 2. Update community_group_members policies
-- Drop the recursive SELECT policy
DROP POLICY IF EXISTS "Members can view group membership" ON public.community_group_members;

-- Re-create it using the security definer function
CREATE POLICY "Members can view group membership" ON public.community_group_members
    FOR SELECT USING (is_group_member(group_id));

-- Fix typo in policy name
DROP POLICY IF EXISTS "Users can join groupss" ON public.community_group_members;
DROP POLICY IF EXISTS "Users can join groups" ON public.community_group_members;
CREATE POLICY "Users can join groups" ON public.community_group_members
    FOR INSERT WITH CHECK (get_my_id() = user_id);

-- 3. Update community_groups policies
-- Use is_group_admin for management consistency and precision
DROP POLICY IF EXISTS "Creators and admins can manage groups" ON public.community_groups;
CREATE POLICY "Creators and admins can manage groups" ON public.community_groups
    FOR ALL USING (
        (get_my_id() = created_by) 
        OR is_group_admin(id)
    );

-- 4. Update community_posts policies
-- Use is_group_member for performance and consistency
DROP POLICY IF EXISTS "Group members can view posts" ON public.community_posts;
CREATE POLICY "Group members can view posts" ON public.community_posts
    FOR SELECT USING (
        is_group_member(group_id)
        -- Keep the blocked users check if it was joined previously (though standard RLS handles multiple policies)
        -- Actually the existing one had a separate blocked users check.
    );

-- 5. Update community_reactions policies
DROP POLICY IF EXISTS "Group members can view reactions" ON public.community_reactions;
CREATE POLICY "Group members can view reactions" ON public.community_reactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.community_posts p
            WHERE p.id = community_reactions.post_id
              AND is_group_member(p.group_id)
        )
    );
