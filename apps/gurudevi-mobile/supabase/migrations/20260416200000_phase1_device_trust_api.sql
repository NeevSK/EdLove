/**
 * Phase 1 Device Trust API
 *
 * Shared-device account support needs a server contract, but Phase 1 keeps that
 * contract intentionally modest:
 * - register one physical install
 * - link the current internal account to that install
 * - read basic trust state
 * - log device/account security events
 *
 * This migration also fixes an identity mismatch from earlier migrations:
 * device tables reference public.users(id), so policies must use get_my_id()
 * rather than auth.uid().
 */

ALTER TABLE public.device_registry
    ADD COLUMN IF NOT EXISTS install_id TEXT,
    ADD COLUMN IF NOT EXISTS platform TEXT,
    ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.users(id) ON DELETE SET NULL;

UPDATE public.device_registry
SET install_id = device_id::text
WHERE install_id IS NULL;

UPDATE public.device_registry dr
SET created_by = da.account_id
FROM public.device_accounts da
WHERE da.device_id = dr.device_id
  AND dr.created_by IS NULL;

ALTER TABLE public.device_registry
    ALTER COLUMN install_id SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS device_registry_install_id_key
    ON public.device_registry (install_id);

CREATE INDEX IF NOT EXISTS idx_device_accounts_account_id
    ON public.device_accounts (account_id);

CREATE INDEX IF NOT EXISTS idx_device_accounts_device_id
    ON public.device_accounts (device_id);

CREATE INDEX IF NOT EXISTS idx_security_audit_logs_account_created_at
    ON public.security_audit_logs (account_id, created_at DESC);

ALTER TABLE public.device_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can see their registered devices" ON public.device_registry;
DROP POLICY IF EXISTS "Users can create their own devices" ON public.device_registry;
DROP POLICY IF EXISTS "Users can update their own devices" ON public.device_registry;
DROP POLICY IF EXISTS "Users can view their own device links" ON public.device_accounts;
DROP POLICY IF EXISTS "Users can insert their own device links" ON public.device_accounts;
DROP POLICY IF EXISTS "Users can update their own device links" ON public.device_accounts;
DROP POLICY IF EXISTS "Users can delete their own device links" ON public.device_accounts;
DROP POLICY IF EXISTS "Users can manage their own device links" ON public.device_accounts;
DROP POLICY IF EXISTS "Users can view their own security logs" ON public.security_audit_logs;
DROP POLICY IF EXISTS "Users can insert their own security logs" ON public.security_audit_logs;

CREATE POLICY "Users can see their registered devices" ON public.device_registry
    FOR SELECT
    USING (
        created_by = public.get_my_id()
        OR EXISTS (
            SELECT 1
            FROM public.device_accounts da
            WHERE da.device_id = public.device_registry.device_id
              AND da.account_id = public.get_my_id()
        )
    );

CREATE POLICY "Users can create their own devices" ON public.device_registry
    FOR INSERT
    WITH CHECK (created_by = public.get_my_id());

CREATE POLICY "Users can update their own devices" ON public.device_registry
    FOR UPDATE
    USING (created_by = public.get_my_id())
    WITH CHECK (created_by = public.get_my_id());

CREATE POLICY "Users can view their own device links" ON public.device_accounts
    FOR SELECT
    USING (account_id = public.get_my_id());

CREATE POLICY "Users can insert their own device links" ON public.device_accounts
    FOR INSERT
    WITH CHECK (account_id = public.get_my_id());

CREATE POLICY "Users can update their own device links" ON public.device_accounts
    FOR UPDATE
    USING (account_id = public.get_my_id())
    WITH CHECK (account_id = public.get_my_id());

CREATE POLICY "Users can delete their own device links" ON public.device_accounts
    FOR DELETE
    USING (account_id = public.get_my_id());

CREATE POLICY "Users can view their own security logs" ON public.security_audit_logs
    FOR SELECT
    USING (account_id = public.get_my_id());

CREATE POLICY "Users can insert their own security logs" ON public.security_audit_logs
    FOR INSERT
    WITH CHECK (account_id = public.get_my_id());

CREATE OR REPLACE FUNCTION public.register_my_device(
    p_install_id TEXT,
    p_model_name TEXT DEFAULT NULL,
    p_os_version TEXT DEFAULT NULL,
    p_platform TEXT DEFAULT NULL
)
RETURNS public.device_registry
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_my_id UUID;
    v_device public.device_registry;
BEGIN
    v_my_id := public.get_my_id();

    IF v_my_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required to register a device';
    END IF;

    IF COALESCE(BTRIM(p_install_id), '') = '' THEN
        RAISE EXCEPTION 'install_id is required';
    END IF;

    INSERT INTO public.device_registry (
        install_id,
        model_name,
        os_version,
        platform,
        created_by,
        last_seen_at
    )
    VALUES (
        p_install_id,
        NULLIF(BTRIM(p_model_name), ''),
        NULLIF(BTRIM(p_os_version), ''),
        NULLIF(BTRIM(p_platform), ''),
        v_my_id,
        now()
    )
    ON CONFLICT (install_id) DO UPDATE
    SET
        model_name = COALESCE(EXCLUDED.model_name, public.device_registry.model_name),
        os_version = COALESCE(EXCLUDED.os_version, public.device_registry.os_version),
        platform = COALESCE(EXCLUDED.platform, public.device_registry.platform),
        last_seen_at = now(),
        created_by = COALESCE(public.device_registry.created_by, EXCLUDED.created_by)
    RETURNING * INTO v_device;

    RETURN v_device;
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
        last_accessed_at
    )
    VALUES (
        p_device_id,
        v_account_id,
        now()
    )
    ON CONFLICT (device_id, account_id) DO UPDATE
    SET last_accessed_at = now()
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
      AND da.account_id = v_account_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Device % is not linked to account %', p_device_id, v_account_id;
    END IF;

    UPDATE public.device_registry
    SET last_seen_at = now()
    WHERE device_id = p_device_id;

    UPDATE public.device_accounts
    SET last_accessed_at = now()
    WHERE device_id = p_device_id
      AND account_id = v_account_id;

    RETURN QUERY
    SELECT *
    FROM public.get_my_device_trust(p_device_id, NULL);
END;
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
BEGIN
    v_my_id := public.get_my_id();
    v_account_id := COALESCE(p_account_id, v_my_id);

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
          AND da.account_id = v_account_id;

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

    INSERT INTO public.security_audit_logs (
        account_id,
        device_id,
        action,
        metadata,
        created_at
    )
    VALUES (
        v_account_id,
        p_device_id,
        BTRIM(p_action),
        COALESCE(p_metadata, '{}'::jsonb),
        now()
    )
    RETURNING id INTO v_log_id;

    RETURN v_log_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.register_my_device(TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.link_my_device_account(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_device_trust(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.touch_my_device_account(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_my_device_audit(TEXT, UUID, UUID, JSONB) TO authenticated;
