-- Migration: 20261031000000_platform_broadcasts.sql
-- Description: Creates the transactional platform_broadcasts table with strict sovereign RLS,
--              canonical EdLove UUIDv8 account identity binding (public.get_my_id()),
--              and attribute-based device security checks.

CREATE TABLE IF NOT EXISTS public.platform_broadcasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'advisory', 'urgent', 'critical')),
    target_school_ids UUID[] DEFAULT ARRAY[]::UUID[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

-- Enable Row Level Security
ALTER TABLE public.platform_broadcasts ENABLE ROW LEVEL SECURITY;

-- Helper Function: Calculate Current Session Trust Tier (0..4)
-- Tier 0: Anonymous / No account
-- Tier 1: Soft / Standard (Local install identity only, unlinked)
-- Tier 2: Verified (Active linked device in device_accounts with is_trusted = true)
-- Tier 3: Hardware (Verified device + biometric / hardware key authentication)
-- Tier 4: Attested (Verified device + OS platform attestation nonce / play integrity)
CREATE OR REPLACE FUNCTION public.get_current_session_trust_tier()
RETURNS INT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_device_id TEXT := auth.jwt() ->> 'device_id';
    v_account_id UUID := public.get_my_id();
    v_is_trusted BOOLEAN;
BEGIN
    IF v_account_id IS NULL THEN
        RETURN 0;
    END IF;

    IF v_device_id IS NULL THEN
        RETURN 1;
    END IF;

    -- Query device link status and trust state
    SELECT COALESCE(dr.is_trusted, false)
    INTO v_is_trusted
    FROM public.device_accounts da
    JOIN public.device_registry dr ON dr.device_id = da.device_id
    WHERE da.account_id = v_account_id
      AND da.device_id::text = v_device_id
      AND da.link_status = 'active';

    IF NOT FOUND OR v_is_trusted IS NOT TRUE THEN
        RETURN 1;
    END IF;

    -- Check step-up claims in authenticated session JWT
    IF (auth.jwt() ->> 'trust_tier') = 'attested' THEN
        RETURN 4;
    ELSIF (auth.jwt() ->> 'trust_tier') = 'hardware' 
       OR (auth.jwt() ->> 'amr') LIKE '%biometric%' 
       OR (auth.jwt() ->> 'amr') LIKE '%webauthn%' THEN
        RETURN 3;
    ELSE
        RETURN 2;
    END IF;
END;
$$;

-- 1. Read Policy: All authenticated accounts with active bonds in targeted schools (or global) can read
DROP POLICY IF EXISTS "platform_broadcasts_select" ON public.platform_broadcasts;
CREATE POLICY "platform_broadcasts_select"
    ON public.platform_broadcasts
    FOR SELECT
    TO authenticated
    USING (
        -- Global broadcast (empty target array) OR targeted to user's bonded institution
        target_school_ids = ARRAY[]::UUID[]
        OR EXISTS (
            SELECT 1 FROM public.bonds b
            WHERE b.user_id = public.get_my_id()
              AND b.entity_id = ANY(target_school_ids::text[])
              AND b.status = 'active'
        )
    );

-- 2. Insert Policy: 
--    (a) Identity & Non-Spoofing: sender_id MUST strictly match the actor's canonical UUIDv8 identity (public.get_my_id()).
--    (b) Sovereign Role / ReBAC: Actor MUST hold an active PLATFORM bond with sovereign stewardship capacity (founder, coFounder, director).
--    (c) ABAC & Device Security: If the actor is performing a privileged superadmin/founder mutation,
--        their device must be trusted (is_trusted = TRUE) in the device registry.
DROP POLICY IF EXISTS "platform_broadcasts_insert_founder" ON public.platform_broadcasts;
CREATE POLICY "platform_broadcasts_insert_founder"
    ON public.platform_broadcasts
    FOR INSERT
    TO authenticated
    WITH CHECK (
        -- (a) Anti-spoofing: Caller can only emit broadcasts under their own canonical account
        sender_id = public.get_my_id()

        -- (b) Sovereign Platform Bond ReBAC enforcement (no profile-column fallback)
        AND EXISTS (
            SELECT 1 FROM public.bonds b
            WHERE b.user_id = public.get_my_id()
              AND b.entity_type = 'PLATFORM'
              AND b.capacity IN ('founder', 'coFounder', 'director')
              AND b.status = 'active'
        )

        -- (c) ABAC & Graded Device Security Invariant:
        --     Routine announcements (info, advisory) require at least Tier 2 (Verified Paired Device).
        --     High-impact or emergency bulletins (urgent, critical) require at least Tier 3 (Hardware / Biometric Step-Up).
        --     Zero fail-open: Sessions below required threshold are rejected.
        AND (
            (severity IN ('info', 'advisory') AND public.get_current_session_trust_tier() >= 2)
            OR (severity IN ('urgent', 'critical') AND public.get_current_session_trust_tier() >= 3)
            -- Allow non-production development environments to bypass device check ONLY if explicitly enabled via app config flag
            OR (
                COALESCE(current_setting('app.allow_untrusted_device_broadcast', true), 'false') = 'true'
                AND (auth.jwt() ->> 'role') = 'service_role'
            )
        )
    );

-- Indexes for lightning fast delivery and foreign key lookups
CREATE INDEX IF NOT EXISTS idx_platform_broadcasts_created_at
    ON public.platform_broadcasts (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_platform_broadcasts_sender_id
    ON public.platform_broadcasts (sender_id);
