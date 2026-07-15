-- 20260714000000_fix_is_onboarded_and_nodes_insert_policy.sql
-- ============================================================
-- Problem:  `is_onboarded()` only checks `user_growth_state.onboarding_completed`
--           but the `completeOnboarding` API handler writes `public.users.onboarding_completed`.
--           These are different tables → developer/fast-track users fail `is_onboarded()`
--           and cannot pass the SELECT policy on nodes, which causes their INSERT .select()
--           to return nothing and surface a "Failed to create resource" error.
--
-- Fix 1:   Widen `is_onboarded()` to accept EITHER table having the flag set to true.
-- Fix 2:   Keep the nodes_community_insert policy unchanged — it is correct.
-- ============================================================

-- ── Fix 1: Widen is_onboarded() to check BOTH tables ───────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_onboarded(u_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Accept the flag from EITHER the growth-state table OR the primary users table.
    -- The API's completeOnboarding handler writes to public.users; the RLS migration
    -- originally only checked user_growth_state — this bridges the gap.
    RETURN EXISTS (
        SELECT 1 FROM public.user_growth_state
        WHERE user_id = u_id AND onboarding_completed = true
    )
    OR EXISTS (
        SELECT 1 FROM public.users
        WHERE id = u_id AND onboarding_completed = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ── Fix 2: Ensure the nodes SELECT policy also grants access to the row creator ─────────────
-- The original `nodes_public_read` policy already has `creator_id = auth.uid()` so creators
-- can always read their own rows.  But if that policy was dropped/replaced by the hardening
-- migration, re-add a creator-bypass policy so inserters can always read what they wrote.

DROP POLICY IF EXISTS "nodes_creator_read_own" ON public.nodes;
CREATE POLICY "nodes_creator_read_own" ON public.nodes
    FOR SELECT TO authenticated
    USING (creator_id = auth.uid());
