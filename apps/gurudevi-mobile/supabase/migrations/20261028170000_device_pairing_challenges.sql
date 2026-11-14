-- Migration: 20261028170000_device_pairing_challenges.sql
-- Description: Zero-Trust Ephemeral Device Pairing Challenges for Cross-Device QR Authorization

BEGIN;

CREATE TABLE IF NOT EXISTS public.device_pairing_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_install_id TEXT NOT NULL,
    target_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'authorized', 'claimed', 'rejected', 'expired')),
    authorized_account_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    authorizing_device_id UUID REFERENCES public.device_registry(device_id) ON DELETE SET NULL,
    grant_token TEXT,
    encrypted_session_payload JSONB,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '2 minutes'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    claimed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_device_pairing_challenges_target_install
    ON public.device_pairing_challenges (target_install_id, status);

CREATE INDEX IF NOT EXISTS idx_device_pairing_challenges_expires_at
    ON public.device_pairing_challenges (expires_at);

ALTER TABLE public.device_pairing_challenges ENABLE ROW LEVEL SECURITY;

-- Anonymous and authenticated clients can read their own generated challenge by ID
DROP POLICY IF EXISTS "Clients can read challenge by ID" ON public.device_pairing_challenges;
CREATE POLICY "Clients can read challenge by ID"
    ON public.device_pairing_challenges
    FOR SELECT
    USING (true);

-- 1. Create a pairing challenge (called by unauthenticated / target device)
CREATE OR REPLACE FUNCTION public.create_device_pairing_challenge(
    p_install_id TEXT,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_challenge RECORD;
BEGIN
    IF p_install_id IS NULL OR BTRIM(p_install_id) = '' THEN
        RAISE EXCEPTION 'install_id is required' USING ERRCODE = '22023';
    END IF;

    -- Clean up any prior pending challenges for this same install
    UPDATE public.device_pairing_challenges
    SET status = 'expired'
    WHERE target_install_id = p_install_id AND status = 'pending';

    INSERT INTO public.device_pairing_challenges (
        target_install_id,
        target_metadata,
        status,
        expires_at
    )
    VALUES (
        p_install_id,
        COALESCE(p_metadata, '{}'::jsonb),
        'pending',
        now() + interval '2 minutes'
    )
    RETURNING * INTO v_challenge;

    RETURN jsonb_build_object(
        'challenge_id', v_challenge.id,
        'target_install_id', v_challenge.target_install_id,
        'expires_at', v_challenge.expires_at,
        'status', v_challenge.status
    );
END;
$$;

-- 2. Inspect a pairing challenge (called by scanning device before confirmation)
CREATE OR REPLACE FUNCTION public.get_device_pairing_challenge(
    p_challenge_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_challenge RECORD;
BEGIN
    SELECT * INTO v_challenge
    FROM public.device_pairing_challenges
    WHERE id = p_challenge_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('ok', false, 'error', 'Challenge not found');
    END IF;

    IF v_challenge.expires_at < now() OR v_challenge.status = 'expired' THEN
        RETURN jsonb_build_object('ok', false, 'error', 'Challenge expired', 'status', 'expired');
    END IF;

    RETURN jsonb_build_object(
        'ok', true,
        'challenge_id', v_challenge.id,
        'target_install_id', v_challenge.target_install_id,
        'target_metadata', v_challenge.target_metadata,
        'status', v_challenge.status,
        'expires_at', v_challenge.expires_at
    );
END;
$$;

-- 3. Authorize or reject a pairing challenge (called by authenticated scanning device)
CREATE OR REPLACE FUNCTION public.authorize_device_pairing(
    p_challenge_id UUID,
    p_approve BOOLEAN DEFAULT true,
    p_encrypted_session JSONB DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_my_id UUID;
    v_challenge RECORD;
    v_grant_token TEXT;
BEGIN
    v_my_id := public.get_my_id();
    IF v_my_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required to authorize device pairing' USING ERRCODE = '42501';
    END IF;

    SELECT * INTO v_challenge
    FROM public.device_pairing_challenges
    WHERE id = p_challenge_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Pairing challenge % does not exist', p_challenge_id USING ERRCODE = '22023';
    END IF;

    IF v_challenge.expires_at < now() THEN
        UPDATE public.device_pairing_challenges SET status = 'expired' WHERE id = p_challenge_id;
        RAISE EXCEPTION 'Pairing challenge % has expired', p_challenge_id USING ERRCODE = '22023';
    END IF;

    IF v_challenge.status != 'pending' THEN
        RAISE EXCEPTION 'Pairing challenge is no longer pending (status: %)', v_challenge.status USING ERRCODE = '22023';
    END IF;

    IF NOT p_approve THEN
        UPDATE public.device_pairing_challenges
        SET status = 'rejected'
        WHERE id = p_challenge_id;
        RETURN jsonb_build_object('ok', true, 'status', 'rejected');
    END IF;

    -- Generate single-use cryptographically strong grant token
    v_grant_token := encode(gen_random_bytes(32), 'hex');

    UPDATE public.device_pairing_challenges
    SET status = 'authorized',
        authorized_account_id = v_my_id,
        grant_token = v_grant_token,
        encrypted_session_payload = p_encrypted_session
    WHERE id = p_challenge_id;

    -- Log security audit event
    INSERT INTO public.security_audit_logs (
        account_id,
        action,
        metadata
    )
    VALUES (
        v_my_id,
        'ACCOUNT_DEVICE_PAIRING_AUTHORIZED',
        jsonb_build_object(
            'challenge_id', p_challenge_id,
            'target_install_id', v_challenge.target_install_id,
            'target_metadata', v_challenge.target_metadata
        )
    );

    RETURN jsonb_build_object(
        'ok', true,
        'status', 'authorized',
        'account_id', v_my_id
    );
END;
$$;

-- 4. Claim the authorized pairing session (called by target device using challenge_id)
CREATE OR REPLACE FUNCTION public.claim_device_pairing_session(
    p_challenge_id UUID,
    p_install_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_challenge RECORD;
    v_user RECORD;
    v_device RECORD;
BEGIN
    SELECT * INTO v_challenge
    FROM public.device_pairing_challenges
    WHERE id = p_challenge_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Pairing challenge not found' USING ERRCODE = '22023';
    END IF;

    IF v_challenge.target_install_id != p_install_id THEN
        RAISE EXCEPTION 'Install ID mismatch for pairing challenge' USING ERRCODE = '42501';
    END IF;

    IF v_challenge.expires_at < now() THEN
        UPDATE public.device_pairing_challenges SET status = 'expired' WHERE id = p_challenge_id;
        RAISE EXCEPTION 'Pairing challenge expired' USING ERRCODE = '22023';
    END IF;

    IF v_challenge.status != 'authorized' THEN
        RETURN jsonb_build_object('ok', false, 'status', v_challenge.status);
    END IF;

    -- Fetch user profile metadata
    SELECT id, email, display_name, avatar_url, capacity, school_id
    INTO v_user
    FROM public.users
    WHERE id = v_challenge.authorized_account_id;

    -- Register target device
    INSERT INTO public.device_registry (
        install_id,
        platform,
        created_by,
        last_seen_at
    )
    VALUES (
        p_install_id,
        COALESCE(v_challenge.target_metadata->>'platform', 'web'),
        v_challenge.authorized_account_id,
        now()
    )
    ON CONFLICT (install_id) DO UPDATE
    SET last_seen_at = now()
    RETURNING * INTO v_device;

    -- Link device to account
    INSERT INTO public.device_accounts (
        device_id,
        account_id,
        last_accessed_at
    )
    VALUES (
        v_device.device_id,
        v_challenge.authorized_account_id,
        now()
    )
    ON CONFLICT (device_id, account_id) DO UPDATE
    SET last_accessed_at = now();

    -- Mark challenge claimed and immediately purge the encrypted session payload from database
    UPDATE public.device_pairing_challenges
    SET status = 'claimed',
        claimed_at = now(),
        encrypted_session_payload = NULL
    WHERE id = p_challenge_id;

    RETURN jsonb_build_object(
        'ok', true,
        'status', 'claimed',
        'account', jsonb_build_object(
            'accountId', v_user.id,
            'displayName', v_user.display_name,
            'email', v_user.email,
            'avatarUrl', v_user.avatar_url,
            'capacity', v_user.capacity,
            'schoolId', v_user.school_id
        ),
        'session', v_challenge.encrypted_session_payload,
        'device_id', v_device.device_id
    );
END;
$$;

GRANT SELECT ON public.device_pairing_challenges TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_device_pairing_challenge(TEXT, JSONB) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_device_pairing_challenge(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.authorize_device_pairing(UUID, BOOLEAN, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_device_pairing_session(UUID, TEXT) TO anon, authenticated;

COMMIT;
