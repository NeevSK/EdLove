-- Create a view in the public schema to expose audit logs
-- This allows accessing the audit schema via Supabase client (PostgREST)
CREATE OR REPLACE VIEW public.audit_logs AS
SELECT 
    id,
    table_name,
    record_id,
    action,
    old_data,
    new_data,
    changed_by,
    changed_at
FROM audit.logs;

-- Grant access to authenticated users
GRANT SELECT ON public.audit_logs TO authenticated;

-- Ensure RLS is handled or the view is secure
-- For now, we allow select, but in a production environment, 
-- we'd filter the view based on the user's role or access to the original table.
ALTER VIEW public.audit_logs SET (security_invoker = on);
