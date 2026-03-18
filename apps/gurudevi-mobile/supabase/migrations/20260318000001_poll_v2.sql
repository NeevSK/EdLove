-- ─────────────────────────────────────────────────────────────────────────────
-- POLL SYSTEM V2
-- Adds: multi-choice support, vote retraction, anonymous/expiry metadata
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Replace the single-user unique constraint with a per-option unique
--    constraint so a user can vote for multiple options in a multi-choice poll
--    while still being prevented from double-voting on the same option.
ALTER TABLE public.community_poll_votes
    DROP CONSTRAINT IF EXISTS community_poll_votes_post_id_user_id_key;

ALTER TABLE public.community_poll_votes
    ADD CONSTRAINT community_poll_votes_post_id_user_id_option_id_key
    UNIQUE (post_id, user_id, option_id);

-- 2. Allow users to retract / change their own votes.
DROP POLICY IF EXISTS "poll_votes_delete_own" ON public.community_poll_votes;
CREATE POLICY "poll_votes_delete_own" ON public.community_poll_votes
    FOR DELETE USING (user_id = auth.uid());

-- 3. poll_data JSONB in community_posts already exists (from prior migration).
--    No schema change needed — the new fields (allow_multiple, is_anonymous,
--    ends_at) are stored as additional keys inside the existing JSONB column.
--    Shape after this migration:
--      {
--        "options":        [{ "id": "opt_0", "text": "Option text" }],
--        "allow_multiple": false,   -- default: single-choice
--        "is_anonymous":   false,   -- default: votes are attributed
--        "ends_at":        null     -- null = no expiry; ISO 8601 string otherwise
--      }
