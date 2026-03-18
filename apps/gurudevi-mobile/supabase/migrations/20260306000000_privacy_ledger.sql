-- ============================================================
-- Privacy Ledger
-- Tracking data access and sensitive changes
-- ============================================================

CREATE TABLE IF NOT EXISTS public.privacy_ledger_entries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    activity_type   TEXT NOT NULL,
    resource_name   TEXT NOT NULL,
    description     TEXT NOT NULL,
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast user-specific lookups
CREATE INDEX IF NOT EXISTS idx_privacy_ledger_user ON public.privacy_ledger_entries(user_id, created_at DESC);

-- ── Row Level Security ────────────────────────────────────────

ALTER TABLE public.privacy_ledger_entries ENABLE ROW LEVEL SECURITY;

-- Users can only read their own ledger
CREATE POLICY "privacy_ledger_read_own"
    ON public.privacy_ledger_entries FOR SELECT
    USING (auth.uid() = user_id);

-- Only service role or triggers should insert (for now, allow user-initiated logs from app)
CREATE POLICY "privacy_ledger_insert_own"
    ON public.privacy_ledger_entries FOR INSERT
    WITH CHECK (auth.uid() = user_id);
