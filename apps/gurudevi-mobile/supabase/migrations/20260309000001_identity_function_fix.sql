-- ============================================================================
-- Migration: 20260309000001_identity_function_fix.sql
-- Purpose:   Replace auth.uid() with get_my_id() inside the
--            get_or_create_direct_conversation() function body so that the
--            new Sovereign Identity Architecture is used end-to-end.
--
-- Context:   20260309000000_identity_rls_fix.sql already updated the RLS
--            policies for direct_conversations and direct_messages tables.
--            This migration fixes the remaining function body that still
--            compared auth.uid() (Supabase auth UID) instead of get_my_id()
--            (internal users.id).
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_or_create_direct_conversation(target_user_id UUID)
RETURNS UUID AS $$
DECLARE
    my_id  UUID;
    uid1   UUID;
    uid2   UUID;
    conv_id UUID;
BEGIN
    -- Resolve caller's internal users.id (not the raw Supabase auth UID).
    my_id := public.get_my_id();

    IF my_id IS NULL THEN
        RAISE EXCEPTION 'Identity resolution failed: no internal user ID found for current session';
    END IF;

    -- Sort IDs to maintain unique pair constraint (user1_id < user2_id).
    IF my_id < target_user_id THEN
        uid1 := my_id;
        uid2 := target_user_id;
    ELSE
        uid1 := target_user_id;
        uid2 := my_id;
    END IF;

    -- Atomically find or create the conversation.
    -- ON CONFLICT handles concurrent requests without a SELECT-then-INSERT race.
    INSERT INTO public.direct_conversations (user1_id, user2_id)
    VALUES (uid1, uid2)
    ON CONFLICT (user1_id, user2_id) DO UPDATE SET updated_at = now()
    RETURNING id INTO conv_id;

    RETURN conv_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;
