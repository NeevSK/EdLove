-- ============================================================
-- Social Shield v2: Blocking and Muting
-- ============================================================

-- 1. User Blocks (Global per-user)
CREATE TABLE IF NOT EXISTS public.user_blocks (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocker_id   UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    blocked_id   UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT unique_block_pair UNIQUE (blocker_id, blocked_id),
    CONSTRAINT no_self_block CHECK (blocker_id != blocked_id)
);

-- 2. Conversation Settings (Per-chat muting)
CREATE TABLE IF NOT EXISTS public.conversation_settings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES public.direct_conversations(id) ON DELETE CASCADE,
    group_id        UUID REFERENCES public.community_groups(id) ON DELETE CASCADE,
    is_muted        BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Ensure it's either a DM or a Group, not both or neither
    CONSTRAINT one_target CHECK (
        (conversation_id IS NOT NULL AND group_id IS NULL) OR
        (conversation_id IS NULL AND group_id IS NOT NULL)
    ),
    CONSTRAINT unique_user_chat_settings UNIQUE (user_id, conversation_id, group_id)
);

-- 3. Update community_reports
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'report_target_type') THEN
        CREATE TYPE report_target_type AS ENUM ('teacher', 'principal', 'platform');
    END IF;
END $$;

ALTER TABLE public.community_reports 
ADD COLUMN IF NOT EXISTS report_target report_target_type DEFAULT 'platform',
ADD COLUMN IF NOT EXISTS assigned_handler_id UUID REFERENCES public.users(id);

-- ── Row Level Security ────────────────────────────────────────

ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_settings ENABLE ROW LEVEL SECURITY;

-- Blocks: Only the blocker can see their blocks
CREATE POLICY "user_blocks_read_own"
    ON public.user_blocks FOR SELECT
    USING (auth.uid() = blocker_id);

CREATE POLICY "user_blocks_insert_own"
    ON public.user_blocks FOR INSERT
    WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "user_blocks_delete_own"
    ON public.user_blocks FOR DELETE
    USING (auth.uid() = blocker_id);

-- Settings: Only the owner can see/edit their muting settings
CREATE POLICY "conv_settings_read_own"
    ON public.conversation_settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "conv_settings_all_own"
    ON public.conversation_settings FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ── Block Enforcement ────────────────────────────────────────

-- Update direct_messages insert policy to respect blocks
DROP POLICY IF EXISTS "direct_messages_insert" ON public.direct_messages;
CREATE POLICY "direct_messages_insert"
    ON public.direct_messages FOR INSERT
    WITH CHECK (
        author_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.direct_conversations c
            WHERE c.id = direct_messages.conversation_id
              AND (auth.uid() = c.user1_id OR auth.uid() = c.user2_id)
              -- Check that the OTHER person hasn't blocked the author
              AND NOT EXISTS (
                  SELECT 1 FROM public.user_blocks b
                  WHERE b.blocker_id = (CASE WHEN c.user1_id = auth.uid() THEN c.user2_id ELSE c.user1_id END)
                    AND b.blocked_id = auth.uid()
              )
        )
    );
