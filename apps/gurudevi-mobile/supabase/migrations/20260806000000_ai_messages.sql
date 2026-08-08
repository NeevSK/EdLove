-- ============================================================
-- AI Messages (AI chat persistence)
-- Per-user AI conversation history.
-- Owners can read/insert/update/delete their own messages.
-- privacy_mode: saved (retained per retention policy) | temporary | incognito
-- ============================================================

CREATE TABLE IF NOT EXISTS public.ai_messages (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id    TEXT NOT NULL,
    user_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role         TEXT NOT NULL,
    content      TEXT NOT NULL,
    privacy_mode TEXT NOT NULL DEFAULT 'saved',
    expires_at   TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Fast per-user, per-thread chronological queries
CREATE INDEX IF NOT EXISTS idx_ai_messages_user_thread_created
    ON public.ai_messages (user_id, thread_id, created_at ASC);

-- Retention cleanup target (temporary expiry)
CREATE INDEX IF NOT EXISTS idx_ai_messages_expires_at
    ON public.ai_messages (expires_at);

-- ── Row Level Security ────────────────────────────────────────
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;

-- Owners can read their own messages
CREATE POLICY "ai_messages_owner_read"
    ON public.ai_messages FOR SELECT
    USING (user_id = auth.uid());

-- Owners can insert messages on their own behalf
CREATE POLICY "ai_messages_owner_insert"
    ON public.ai_messages FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Owners can update their own messages (e.g. promote temporary -> saved)
CREATE POLICY "ai_messages_owner_update"
    ON public.ai_messages FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Owners can delete their own messages
CREATE POLICY "ai_messages_owner_delete"
    ON public.ai_messages FOR DELETE
    USING (user_id = auth.uid());

-- ── App config (retention policy) ─────────────────────────────
CREATE TABLE IF NOT EXISTS public.app_config (
    key        TEXT PRIMARY KEY,
    value      TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Retention default: 90 days for saved messages
INSERT INTO public.app_config (key, value)
VALUES ('ai_message_retention_days', '90')
ON CONFLICT (key) DO NOTHING;
