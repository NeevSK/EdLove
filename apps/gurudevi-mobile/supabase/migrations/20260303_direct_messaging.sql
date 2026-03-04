-- ============================================================
-- Direct Messaging (1:1 Chat)
-- Private conversations between two users.
-- ============================================================

-- 1. Direct Conversations (pairs)
CREATE TABLE IF NOT EXISTS public.direct_conversations (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    user2_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure user1_id < user2_id for unique pairing
    CONSTRAINT unique_user_pair UNIQUE (user1_id, user2_id),
    CONSTRAINT different_users CHECK (user1_id != user2_id)
);

-- 2. Direct Messages
CREATE TABLE IF NOT EXISTS public.direct_messages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.direct_conversations(id) ON DELETE CASCADE,
    author_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content         TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_direct_conv_user1 ON public.direct_conversations(user1_id);
CREATE INDEX IF NOT EXISTS idx_direct_conv_user2 ON public.direct_conversations(user2_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_conv_created ON public.direct_messages(conversation_id, created_at ASC);

-- ── Row Level Security ────────────────────────────────────────

ALTER TABLE public.direct_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

-- Conversations: Participants can read
CREATE POLICY "direct_conversations_read"
    ON public.direct_conversations FOR SELECT
    USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Messages: Participants of the conversation can read
CREATE POLICY "direct_messages_read"
    ON public.direct_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.direct_conversations c
            WHERE c.id = direct_messages.conversation_id
              AND (auth.uid() = c.user1_id OR auth.uid() = c.user2_id)
        )
    );

-- Messages: Participants can insert
CREATE POLICY "direct_messages_insert"
    ON public.direct_messages FOR INSERT
    WITH CHECK (
        author_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.direct_conversations c
            WHERE c.id = direct_messages.conversation_id
              AND (auth.uid() = c.user1_id OR auth.uid() = c.user2_id)
        )
    );

-- ── Helper RPC ───────────────────────────────────────────────

/**
 * get_or_create_direct_conversation
 * 
 * Safely finds or creates a 1:1 conversation between the caller and target_user_id.
 * Ensures user1_id < user2_id for consistent pairing.
 */
CREATE OR REPLACE FUNCTION public.get_or_create_direct_conversation(target_user_id UUID)
RETURNS UUID AS $$
DECLARE
    uid1 UUID;
    uid2 UUID;
    conv_id UUID;
BEGIN
    -- Sort IDs to maintain unique pair constraint
    IF auth.uid() < target_user_id THEN
        uid1 := auth.uid();
        uid2 := target_user_id;
    ELSE
        uid1 := target_user_id;
        uid2 := auth.uid();
    END IF;

    -- Try to find existing
    SELECT id INTO conv_id
    FROM public.direct_conversations
    WHERE user1_id = uid1 AND user2_id = uid2;

    -- Create if not found
    IF conv_id IS NULL THEN
        INSERT INTO public.direct_conversations (user1_id, user2_id)
        VALUES (uid1, uid2)
        RETURNING id INTO conv_id;
    END IF;

    RETURN conv_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── Update Trigger ──────────────────────────────────────────

-- Update direct_conversations.updated_at when a new message arrives
CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.direct_conversations
    SET updated_at = NOW()
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conv_timestamp
AFTER INSERT ON public.direct_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_conversation_timestamp();
