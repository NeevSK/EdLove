-- ============================================================
-- Group Messages (Group Chat)
-- Real-time chat per community group.
-- Members of a group can send and read messages.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.group_messages (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id     UUID NOT NULL REFERENCES public.community_groups(id) ON DELETE CASCADE,
    author_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content      TEXT NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Fast per-group queries ordered chronologically
CREATE INDEX IF NOT EXISTS idx_group_messages_group_created
    ON public.group_messages (group_id, created_at ASC);

-- ── Row Level Security ────────────────────────────────────────
ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;

-- Members can read messages in groups they belong to
CREATE POLICY "group_messages_member_read"
    ON public.group_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.community_group_members m
            WHERE m.group_id = group_messages.group_id
              AND m.user_id = auth.uid()
              AND m.status = 'active'
        )
    );

-- Members can send messages to groups they belong to
CREATE POLICY "group_messages_member_insert"
    ON public.group_messages FOR INSERT
    WITH CHECK (
        author_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.community_group_members m
            WHERE m.group_id = group_messages.group_id
              AND m.user_id = auth.uid()
              AND m.status = 'active'
        )
    );

-- Authors can delete their own messages
CREATE POLICY "group_messages_own_delete"
    ON public.group_messages FOR DELETE
    USING (author_id = auth.uid());
