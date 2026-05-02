/**
 * Phase 1.5 Device Security Read Models
 *
 * Adds read-oriented RPCs so the client can show:
 * - devices linked to the current account
 * - recent security/device audit activity for the current account
 *
 * This stays intentionally modest: no revoke/wipe behavior yet, just the
 * minimum read surface needed for trusted-device and security-activity UI.
 */

CREATE OR REPLACE FUNCTION public.list_my_devices()
RETURNS TABLE (
    device_id UUID,
    install_id TEXT,
    is_trusted BOOLEAN,
    trust_status TEXT,
    model_name TEXT,
    os_version TEXT,
    platform TEXT,
    created_at TIMESTAMPTZ,
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
        CASE
            WHEN COALESCE(dr.is_trusted, TRUE) = FALSE THEN 'restricted'
            WHEN dr.created_at >= now() - INTERVAL '24 hours' THEN 'new'
            WHEN dr.last_seen_at IS NOT NULL AND dr.last_seen_at < now() - INTERVAL '30 days' THEN 'stale'
            ELSE 'trusted'
        END AS trust_status,
        dr.model_name,
        dr.os_version,
        dr.platform,
        dr.created_at,
        dr.last_seen_at,
        da.last_accessed_at,
        da.account_id AS linked_account_id
    FROM public.device_accounts da
    JOIN public.device_registry dr
      ON dr.device_id = da.device_id
    WHERE da.account_id = public.get_my_id()
    ORDER BY
        da.last_accessed_at DESC NULLS LAST,
        dr.last_seen_at DESC NULLS LAST,
        dr.created_at DESC;
$$;

CREATE OR REPLACE FUNCTION public.list_my_security_audit_events(
    p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
    id UUID,
    action TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ,
    account_id UUID,
    device_id UUID,
    install_id TEXT,
    is_trusted BOOLEAN,
    model_name TEXT,
    os_version TEXT,
    platform TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        sal.id,
        sal.action,
        sal.metadata,
        sal.created_at,
        sal.account_id,
        sal.device_id,
        dr.install_id,
        dr.is_trusted,
        dr.model_name,
        dr.os_version,
        dr.platform
    FROM public.security_audit_logs sal
    LEFT JOIN public.device_registry dr
      ON dr.device_id = sal.device_id
    WHERE sal.account_id = public.get_my_id()
    ORDER BY sal.created_at DESC
    LIMIT GREATEST(COALESCE(p_limit, 50), 1);
$$;

GRANT EXECUTE ON FUNCTION public.list_my_devices() TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_my_security_audit_events(INTEGER) TO authenticated;
