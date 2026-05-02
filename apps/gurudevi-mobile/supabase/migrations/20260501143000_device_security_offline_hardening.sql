/**
 * Phase 1.7 Device Security Offline Hardening
 *
 * Goals:
 * - replace hard deletion with soft state transitions for device links
 * - make audit writes replay-safe with idempotency keys
 * - make security-session revoke flows idempotent
 * - add an install-scoped revoke function for local sign-out reconciliation
 */

ALTER TABLE public.device_accounts
    ADD COLUMN IF NOT EXISTS linked_at TIMESTAMPTZ DEFAULT now(),
    ADD COLUMN IF NOT EXISTS link_status TEXT NOT NULL DEFAULT 'active',
    ADD COLUMN IF NOT EXISTS unlinked_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS unlink_reason TEXT,
    ADD COLUMN IF NOT EXISTS unlinked_by UUID REFERENCES public.users(id) ON DELETE SET NULL;

UPDATE public.device_accounts
SET
    linked_at = COALESCE(linked_at, now()),
    link_status = COALESCE(NULLIF(BTRIM(link_status), ''), 'active');

ALTER TABLE public.security_audit_logs
    ADD COLUMN IF NOT EXISTS idempotency_key TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS security_audit_logs_idempotency_key_key
    ON public.security_audit_logs (idempotency_key)
    WHERE idempotency_key IS NOT NULL;

CREATE OR REPLACE FUNCTION public.resolve_device_trust_status(
    p_is_trusted BOOLEAN,
    p_created_at TIMESTAMPTZ,
    p_last_seen_at TIMESTAMPTZ
)
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
    SELECT CASE
        WHEN COALESCE(p_is_trusted, TRUE) = FALSE THEN 'restricted'
        WHEN p_created_at >= now() - INTERVAL '24 hours' THEN 'new'
        WHEN p_last_seen_at IS NOT NULL AND p_last_seen_at < now() - INTERVAL '30 days' THEN 'stale'
        ELSE 'trusted'
    END;
$$;

CREATE OR REPLACE FUNCTION public.link_my_device_account(
    p_device_id UUID,
    p_account_id UUID DEFAULT NULL
)
RETURNS public.device_accounts
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_my_id UUID;
    v_account_id UUID;
    v_link public.device_accounts;
BEGIN
    v_my_id := public.get_my_id();
    v_account_id := COALESCE(p_account_id, v_my_id);

    IF v_my_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required to link a device account';
    END IF;

    IF v_account_id IS DISTINCT FROM v_my_id THEN
        RAISE EXCEPTION 'You may only link the current account to this device';
    END IF;

    IF p_device_id IS NULL THEN
        RAISE EXCEPTION 'device_id is required';
    END IF;

    PERFORM 1
    FROM public.device_registry
    WHERE device_id = p_device_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Device % is not registered', p_device_id;
    END IF;

    INSERT INTO public.device_accounts (
        device_id,
        account_id,
        linked_at,
        last_accessed_at,
        link_status,
        unlinked_at,
        unlink_reason,
        unlinked_by
    )
    VALUES (
        p_device_id,
        v_account_id,
        now(),
        now(),
        'active',
        NULL,
        NULL,
        NULL
    )
    ON CONFLICT (device_id, account_id) DO UPDATE
    SET
        linked_at = COALESCE(public.device_accounts.linked_at, now()),
        last_accessed_at = now(),
        link_status = 'active',
        unlinked_at = NULL,
        unlink_reason = NULL,
        unlinked_by = NULL
    RETURNING * INTO v_link;

    UPDATE public.device_registry
    SET last_seen_at = now()
    WHERE device_id = p_device_id;

    RETURN v_link;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_my_device_trust(
    p_device_id UUID DEFAULT NULL,
    p_install_id TEXT DEFAULT NULL
)
RETURNS TABLE (
    device_id UUID,
    install_id TEXT,
    is_trusted BOOLEAN,
    model_name TEXT,
    os_version TEXT,
    platform TEXT,
    last_seen_at TIMESTAMPTZ,
    last_accessed_at TIMESTAMPTZ,
    linked_account_id UUID
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        dr.device_id,
        dr.install_id,
        dr.is_trusted,
        dr.model_name,
        dr.os_version,
        dr.platform,
        dr.last_seen_at,
        da.last_accessed_at,
        da.account_id AS linked_account_id
    FROM public.device_registry dr
    JOIN public.device_accounts da
      ON da.device_id = dr.device_id
    WHERE da.account_id = public.get_my_id()
      AND da.link_status = 'active'
      AND (
          (p_device_id IS NOT NULL AND dr.device_id = p_device_id)
          OR (p_device_id IS NULL AND p_install_id IS NOT NULL AND dr.install_id = p_install_id)
          OR (p_device_id IS NULL AND p_install_id IS NULL)
      )
    ORDER BY da.last_accessed_at DESC NULLS LAST
    LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.touch_my_device_account(
    p_device_id UUID,
    p_account_id UUID DEFAULT NULL
)
RETURNS TABLE (
    device_id UUID,
    install_id TEXT,
    is_trusted BOOLEAN,
    model_name TEXT,
    os_version TEXT,
    platform TEXT,
    last_seen_at TIMESTAMPTZ,
    last_accessed_at TIMESTAMPTZ,
    linked_account_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_my_id UUID;
    v_account_id UUID;
BEGIN
    v_my_id := public.get_my_id();
    v_account_id := COALESCE(p_account_id, v_my_id);

    IF v_my_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required to touch a device account';
    END IF;

    IF v_account_id IS DISTINCT FROM v_my_id THEN
        RAISE EXCEPTION 'You may only touch the current account device link';
    END IF;

    IF p_device_id IS NULL THEN
        RAISE EXCEPTION 'device_id is required';
    END IF;

    PERFORM 1
    FROM public.device_accounts da
    WHERE da.device_id = p_device_id
      AND da.account_id = v_account_id
      AND da.link_status = 'active';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Device % is not linked to account %', p_device_id, v_account_id;
    END IF;

    UPDATE public.device_registry
    SET last_seen_at = now()
    WHERE device_id = p_device_id;

    UPDATE public.device_accounts
    SET last_accessed_at = now()
    WHERE device_id = p_device_id
      AND account_id = v_account_id
      AND link_status = 'active';

    RETURN QUERY
    SELECT *
    FROM public.get_my_device_trust(p_device_id, NULL);
END;
$$;

CREATE OR REPLACE FUNCTION public.list_my_devices()
RETURNS TABLE (
    device_id UUID,
    install_id TEXT,
    is_trusted BOOLEAN,
    trust_status TEXT,
    model_name TEXT,
    os_version TEXT,
    platform TEXT,
    last_seen_at TIMESTAMPTZ,
    last_accessed_at TIMESTAMPTZ,
    linked_account_id UUID
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        dr.device_id,
        dr.install_id,
        dr.is_trusted,
        public.resolve_device_trust_status(dr.is_trusted, dr.created_at, dr.last_seen_at) AS trust_status,
        dr.model_name,
        dr.os_version,
        dr.platform,
        dr.last_seen_at,
        da.last_accessed_at,
        da.account_id AS linked_account_id
    FROM public.device_accounts da
    JOIN public.device_registry dr
      ON dr.device_id = da.device_id
    WHERE da.account_id = public.get_my_id()
      AND da.link_status = 'active'
    ORDER BY da.last_accessed_at DESC NULLS LAST, dr.last_seen_at DESC NULLS LAST;
$$;

CREATE OR REPLACE FUNCTION public.log_my_device_audit(
    p_action TEXT,
    p_device_id UUID DEFAULT NULL,
    p_account_id UUID DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_my_id UUID;
    v_account_id UUID;
    v_log_id UUID;
    v_existing_id UUID;
    v_idempotency_key TEXT;
BEGIN
    v_my_id := public.get_my_id();
    v_account_id := COALESCE(p_account_id, v_my_id);
    v_idempotency_key := NULLIF(BTRIM(COALESCE(p_metadata ->> 'idempotency_key', '')), '');

    IF v_my_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required to write device audit logs';
    END IF;

    IF COALESCE(BTRIM(p_action), '') = '' THEN
        RAISE EXCEPTION 'action is required';
    END IF;

    IF v_account_id IS DISTINCT FROM v_my_id THEN
        RAISE EXCEPTION 'You may only write audit logs for the current account';
    END IF;

    IF p_device_id IS NOT NULL THEN
        PERFORM 1
        FROM public.device_accounts da
        WHERE da.device_id = p_device_id
          AND da.account_id = v_account_id
          AND da.link_status = 'active';

        IF NOT FOUND THEN
            PERFORM 1
            FROM public.device_registry dr
            WHERE dr.device_id = p_device_id
              AND dr.created_by = v_account_id;

            IF NOT FOUND THEN
                RAISE EXCEPTION 'Device % is not linked to account %', p_device_id, v_account_id;
            END IF;
        END IF;
    END IF;

    IF v_idempotency_key IS NOT NULL THEN
        SELECT sal.id
        INTO v_existing_id
        FROM public.security_audit_logs sal
        WHERE sal.idempotency_key = v_idempotency_key
        LIMIT 1;

        IF v_existing_id IS NOT NULL THEN
            RETURN v_existing_id;
        END IF;
    END IF;

    INSERT INTO public.security_audit_logs (
        account_id,
        device_id,
        action,
        metadata,
        idempotency_key,
        created_at
    )
    VALUES (
        v_account_id,
        p_device_id,
        BTRIM(p_action),
        COALESCE(p_metadata, '{}'::jsonb),
        v_idempotency_key,
        now()
    )
    RETURNING id INTO v_log_id;

    RETURN v_log_id;
END;
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

    SELECT ass.*
    INTO v_session
    FROM public.account_security_sessions ass
    WHERE ass.session_id = p_session_id
      AND ass.account_id = v_account_id
    LIMIT 1;

    IF v_session.session_id IS NULL THEN
        RAISE EXCEPTION 'Security session % was not found for the current account', p_session_id;
    END IF;

    IF v_session.status <> 'revoked' THEN
        UPDATE public.account_security_sessions
        SET
            status = 'revoked',
            trust_status = 'restricted',
            revoked_at = COALESCE(revoked_at, now()),
            revoke_reason = COALESCE(NULLIF(BTRIM(p_reason), ''), 'manual')
        WHERE session_id = p_session_id
        RETURNING * INTO v_session;
    END IF;

    RETURN v_session;
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
    v_link public.device_accounts;
BEGIN
    v_account_id := public.get_my_id();

    IF v_account_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required to unlink a device';
    END IF;

    SELECT da.*
    INTO v_link
    FROM public.device_accounts da
    WHERE da.device_id = p_device_id
      AND da.account_id = v_account_id
    LIMIT 1;

    IF v_link.id IS NULL THEN
        RAISE EXCEPTION 'Device % is not linked to the current account', p_device_id;
    END IF;

    IF v_link.link_status <> 'unlinked' THEN
        UPDATE public.device_accounts
        SET
            link_status = 'unlinked',
            unlinked_at = now(),
            unlink_reason = 'manual_unlink',
            unlinked_by = v_account_id
        WHERE id = v_link.id;
    END IF;

    IF COALESCE(p_revoke_sessions, TRUE) THEN
        UPDATE public.account_security_sessions
        SET
            status = 'revoked',
            trust_status = 'restricted',
            revoked_at = COALESCE(revoked_at, now()),
            revoke_reason = COALESCE(revoke_reason, 'device_unlinked')
        WHERE account_id = v_account_id
          AND device_id = p_device_id
          AND status = 'active';
    END IF;

    RETURN p_device_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.revoke_my_install_security_sessions(
    p_install_id TEXT,
    p_reason TEXT DEFAULT 'signed_out_locally'
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
        RAISE EXCEPTION 'Authentication required to revoke install security sessions';
    END IF;

    IF COALESCE(BTRIM(p_install_id), '') = '' THEN
        RAISE EXCEPTION 'install_id is required';
    END IF;

    UPDATE public.account_security_sessions
    SET
        status = 'revoked',
        trust_status = 'restricted',
        revoked_at = COALESCE(revoked_at, now()),
        revoke_reason = COALESCE(NULLIF(BTRIM(p_reason), ''), 'signed_out_locally')
    WHERE account_id = v_account_id
      AND install_id = p_install_id
      AND status = 'active';

    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN COALESCE(v_count, 0);
END;
$$;

GRANT EXECUTE ON FUNCTION public.revoke_my_install_security_sessions(TEXT, TEXT) TO authenticated;
