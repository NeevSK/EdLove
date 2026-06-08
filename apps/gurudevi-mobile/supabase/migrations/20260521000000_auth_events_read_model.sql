/**
 * Auth Events Read Model
 *
 * Adds a dedicated read model for security audit rows that represent
 * authentication-method activity. These rows still live in
 * public.security_audit_logs so we keep one append-only security ledger,
 * but the auth-specific read model makes the UI and future reporting much
 * easier to reason about.
 */

CREATE OR REPLACE FUNCTION public.list_my_auth_events(
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
      AND sal.action LIKE 'AUTH_%'
    ORDER BY sal.created_at DESC
    LIMIT GREATEST(COALESCE(p_limit, 50), 1);
$$;

GRANT EXECUTE ON FUNCTION public.list_my_auth_events(INTEGER) TO authenticated;
