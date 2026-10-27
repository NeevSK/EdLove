-- The operation ledger is readable only by the server-held postgres role.
-- This avoids granting table access while giving the worker a stable summary
-- contract for audit and checkpoint reporting.
CREATE OR REPLACE FUNCTION private.get_edlove_historical_assignment_operation_summary(
  p_operation_id uuid
)
RETURNS TABLE (
  id uuid,
  operation_key uuid,
  state text,
  max_batch_size integer,
  max_attempts_per_account integer,
  max_failed_accounts integer,
  candidate_count integer,
  assigned_count integer,
  skipped_count integer,
  failed_count integer,
  created_at timestamptz,
  approved_at timestamptz,
  started_at timestamptz,
  paused_at timestamptz,
  completed_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT operation.id, operation.operation_key, operation.state,
         operation.max_batch_size, operation.max_attempts_per_account,
         operation.max_failed_accounts, operation.candidate_count,
         operation.assigned_count, operation.skipped_count, operation.failed_count,
         operation.created_at, operation.approved_at, operation.started_at,
         operation.paused_at, operation.completed_at
    FROM private.edlove_historical_assignment_operations AS operation
   WHERE operation.id = p_operation_id;
$$;

REVOKE ALL ON FUNCTION private.get_edlove_historical_assignment_operation_summary(uuid)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.get_edlove_historical_assignment_operation_summary(uuid)
  TO postgres;
