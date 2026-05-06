/**
 * Phase 1.6 Device Security Sessions and Revocation
 *
 * Adds:
 * - a platform-owned session inventory separate from remembered device-account links
 * - account-owned device unlinking
 * - session revocation
 * - richer trust posture in read models
 */

CREATE TABLE IF NOT EXISTS public.account_security_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    device_id UUID REFERENCES public.device_registry(device_id) ON DELETE SET NULL,
    install_id TEXT,
    auth_user_id UUID,
    platform TEXT,
    model_name TEXT,
    os_version TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    auth_strength TEXT NOT NULL DEFAULT 'session',
    trust_status TEXT NOT NULL DEFAULT 'standard',
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    revoked_at TIMESTAMPTZ,
    revoke_reason TEXT
);

CREATE INDEX IF NOT EXISTS idx_account_security_sessions_account_last_seen
    ON public.account_security_sessions (account_id, last_seen_at DESC);

CREATE INDEX IF NOT EXISTS idx_account_security_sessions_device
    ON public.account_security_sessions (device_id);

ALTER TABLE public.account_security_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own security sessions" ON public.account_security_sessions;
DROP POLICY IF EXISTS "Users can insert their own security sessions" ON public.account_security_sessions;
DROP POLICY IF EXISTS "Users can update their own security sessions" ON public.account_security_sessions;

CREATE POLICY "Users can view their own security sessions" ON public.account_security_sessions
    FOR SELECT
    USING (account_id = public.get_my_id());

CREATE POLICY "Users can insert their own security sessions" ON public.account_security_sessions
    FOR INSERT
    WITH CHECK (account_id = public.get_my_id());

CREATE POLICY "Users can update their own security sessions" ON public.account_security_sessions
    FOR UPDATE
    USING (account_id = public.get_my_id())
    WITH CHECK (account_id = public.get_my_id());

CREATE OR REPLACE FUNCTION public.resolve_device_trust_status(
    p_is_trusted BOOLEAN,
    p_created_at TIMESTAMPTZ,
    p_last_seen_at TIMESTAMPTZ
)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
    SELECT CASE
        WHEN COALESCE(p_is_trusted, TRUE) = FALSE THEN 'restricted'
        WHEN p_created_at >= now() - INTERVAL '24 hours' THEN 'new'
        WHEN p_last_seen_at IS NOT NULL AND p_last_seen_at < now() - INTERVAL '30 days' THEN 'stale'
        ELSE 'trusted'
    END;
$$;

CREATE OR REPLACE FUNCTION public.upsert_my_security_session(
    p_device_id UUID DEFAULT NULL,
    p_install_id TEXT DEFAULT NULL,
    p_auth_user_id UUID DEFAULT NULL,
    p_platform TEXT DEFAULT NULL,
    p_model_name TEXT DEFAULT NULL,
    p_os_version TEXT DEFAULT NULL,
    p_auth_strength TEXT DEFAULT 'session'
)
RETURNS public.account_security_sessions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_account_id UUID;
    v_existing public.account_security_sessions;
    v_next public.account_security_sessions;
    v_is_trusted BOOLEAN;
    v_created_at TIMESTAMPTZ;
    v_last_seen_at TIMESTAMPTZ;
BEGIN
    v_account_id := public.get_my_id();

    IF v_account_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required to upsert a security session';
    END IF;

    IF p_device_id IS NOT NULL THEN
        SELECT dr.is_trusted, dr.created_at, dr.last_seen_at
        INTO v_is_trusted, v_created_at, v_last_seen_at
        FROM public.device_registry dr
        WHERE dr.device_id = p_device_id;
    END IF;

    SELECT ass.*
    INTO v_existing
    FROM public.account_security_sessions ass
    WHERE ass.account_id = v_account_id
      AND (
          (p_device_id IS NOT NULL AND ass.device_id = p_device_id AND ass.status = 'active')
          OR (
              p_device_id IS NULL
              AND p_install_id IS NOT NULL
              AND ass.install_id = p_install_id
              AND ass.status = 'active'
          )
      )
    ORDER BY ass.last_seen_at DESC
    LIMIT 1;

    IF v_existing.session_id IS NULL THEN
        INSERT INTO public.account_security_sessions (
            account_id,
            device_id,
            install_id,
            auth_user_id,
            platform,
            model_name,
            os_version,
            status,
            auth_strength,
            trust_status,
            started_at,
            last_seen_at
        )
        VALUES (
            v_account_id,
            p_device_id,
            NULLIF(BTRIM(p_install_id), ''),
            p_auth_user_id,
            NULLIF(BTRIM(p_platform), ''),
            NULLIF(BTRIM(p_model_name), ''),
            NULLIF(BTRIM(p_os_version), ''),
            'active',
            COALESCE(NULLIF(BTRIM(p_auth_strength), ''), 'session'),
            public.resolve_device_trust_status(v_is_trusted, v_created_at, v_last_seen_at),
            now(),
            now()
        )
        RETURNING * INTO v_next;
    ELSE
        UPDATE public.account_security_sessions
        SET
            auth_user_id = COALESCE(p_auth_user_id, auth_user_id),
            platform = COALESCE(NULLIF(BTRIM(p_platform), ''), platform),
            model_name = COALESCE(NULLIF(BTRIM(p_model_name), ''), model_name),
            os_version = COALESCE(NULLIF(BTRIM(p_os_version), ''), os_version),
            auth_strength = COALESCE(NULLIF(BTRIM(p_auth_strength), ''), auth_strength),
            trust_status = public.resolve_device_trust_status(v_is_trusted, v_created_at, v_last_seen_at),
            status = CASE WHEN status = 'revoked' THEN 'active' ELSE status END,
            revoked_at = NULL,
            revoke_reason = NULL,
            last_seen_at = now()
        WHERE session_id = v_existing.session_id
        RETURNING * INTO v_next;
    END IF;

    RETURN v_next;
END;
$$;

CREATE OR REPLACE FUNCTION public.list_my_security_sessions(
    p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
    session_id UUID,
    account_id UUID,
    device_id UUID,
    install_id TEXT,
    auth_user_id UUID,
    platform TEXT,
    model_name TEXT,
    os_version TEXT,
    status TEXT,
    auth_strength TEXT,
    trust_status TEXT,
    started_at TIMESTAMPTZ,
    last_seen_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    revoke_reason TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        ass.session_id,
        ass.account_id,
        ass.device_id,
        ass.install_id,
        ass.auth_user_id,
        ass.platform,
        ass.model_name,
        ass.os_version,
        ass.status,
        ass.auth_strength,
        ass.trust_status,
        ass.started_at,
        ass.last_seen_at,
        ass.revoked_at,
        ass.revoke_reason
    FROM public.account_security_sessions ass
    WHERE ass.account_id = public.get_my_id()
    ORDER BY ass.last_seen_at DESC
    LIMIT GREATEST(COALESCE(p_limit, 20), 1);
$$;

CREATE OR REPLACE FUNCTION public.revoke_my_security_session(
    p_session_id UUID,
    p_reason TEXT DEFAULT 'manual'
)
RETURNS public.account_security_sessions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_account_id UUID;
    v_session public.account_security_sessions;
BEGIN
    v_account_id := public.get_my_id();

    IF v_account_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required to revoke a security session';
    END IF;

    UPDATE public.account_security_sessions
    SET
        status = 'revoked',
        trust_status = 'restricted',
        revoked_at = now(),
        revoke_reason = COALESCE(NULLIF(BTRIM(p_reason), ''), 'manual')
    WHERE session_id = p_session_id
      AND account_id = v_account_id
    RETURNING * INTO v_session;

    IF v_session.session_id IS NULL THEN
        RAISE EXCEPTION 'Security session % was not found for the current account', p_session_id;
    END IF;

    RETURN v_session;
END;
$$;

CREATE OR REPLACE FUNCTION public.revoke_my_other_security_sessions(
    p_keep_session_id UUID DEFAULT NULL,
    p_reason TEXT DEFAULT 'manual'
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_account_id UUID;
    v_count INTEGER;
BEGIN
    v_account_id := public.get_my_id();

    IF v_account_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required to revoke other security sessions';
    END IF;

    UPDATE public.account_security_sessions
    SET
        status = 'revoked',
        trust_status = 'restricted',
        revoked_at = now(),
        revoke_reason = COALESCE(NULLIF(BTRIM(p_reason), ''), 'manual')
    WHERE account_id = v_account_id
      AND status = 'active'
      AND (p_keep_session_id IS NULL OR session_id <> p_keep_session_id);

    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN COALESCE(v_count, 0);
END;
$$;

CREATE OR REPLACE FUNCTION public.unlink_my_device(
    p_device_id UUID,
    p_revoke_sessions BOOLEAN DEFAULT TRUE
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_account_id UUID;
BEGIN
    v_account_id := public.get_my_id();

    IF v_account_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required to unlink a device';
    END IF;

    DELETE FROM public.device_accounts
    WHERE device_id = p_device_id
      AND account_id = v_account_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Device % is not linked to the current account', p_device_id;
    END IF;

    IF COALESCE(p_revoke_sessions, TRUE) THEN
        UPDATE public.account_security_sessions
        SET
            status = 'revoked',
            trust_status = 'restricted',
            revoked_at = now(),
            revoke_reason = 'device_unlinked'
        WHERE account_id = v_account_id
          AND device_id = p_device_id
          AND status = 'active';
    END IF;

    RETURN p_device_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.upsert_my_security_session(UUID, TEXT, UUID, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_my_security_sessions(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.revoke_my_security_session(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.revoke_my_other_security_sessions(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.unlink_my_device(UUID, BOOLEAN) TO authenticated;
