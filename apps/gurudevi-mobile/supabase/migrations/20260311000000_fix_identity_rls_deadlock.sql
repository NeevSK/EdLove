-- ========================================================
-- FIX IDENTITY RLS DEADLOCK
-- ========================================================
-- Allowing users to manage their own identities if auth.uid() matches user_id.
-- This unblocks "legacy healing" where get_my_id() returns NULL.
-- ========================================================

-- 1. Update Authenticated Policy
DROP POLICY IF EXISTS "Users can manage their own auth identities" ON public.auth_identities;
CREATE POLICY "Users can manage their own auth identities"
    ON public.auth_identities FOR ALL TO authenticated
    USING (
        get_my_id() = user_id 
        OR auth.uid() = user_id
    )
    WITH CHECK (
        get_my_id() = user_id 
        OR auth.uid() = user_id
    );

-- 2. Update Anonymous Policy
DROP POLICY IF EXISTS "Anonymous users can manage their own identities" ON public.auth_identities;
CREATE POLICY "Anonymous users can manage their own identities"
    ON public.auth_identities FOR ALL TO anon
    USING (
        get_my_id() = user_id 
        OR auth.uid() = user_id
    )
    WITH CHECK (
        get_my_id() = user_id 
        OR auth.uid() = user_id
    );

-- 3. Ensure proper grants for bootstrapping
GRANT ALL ON public.auth_identities TO authenticated;
GRANT ALL ON public.auth_identities TO anon;
