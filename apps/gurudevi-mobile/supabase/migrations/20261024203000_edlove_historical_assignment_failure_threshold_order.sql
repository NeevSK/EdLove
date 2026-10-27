-- Apply the failure stop before refreshing terminal counters. Otherwise the
-- final failed item can make an operation look completed before its configured
-- failure threshold has a chance to pause it.
CREATE OR REPLACE FUNCTION private.release_edlove_historical_assignment_operation_item(
  p_operation_id uuid,
  p_account_id uuid,
  p_claim_token uuid,
  p_error_code text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_max_attempts integer;
  v_max_failed_accounts integer;
  v_updated boolean;
BEGIN
  SELECT max_attempts_per_account, max_failed_accounts
    INTO v_max_attempts, v_max_failed_accounts
    FROM private.edlove_historical_assignment_operations
   WHERE id = p_operation_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'operation does not exist' USING ERRCODE = 'P0002';
  END IF;

  UPDATE private.edlove_historical_assignment_operation_items
     SET attempts = attempts + 1,
         state = CASE WHEN attempts + 1 >= v_max_attempts THEN 'failed' ELSE 'pending' END,
         completed_at = CASE WHEN attempts + 1 >= v_max_attempts THEN pg_catalog.clock_timestamp() ELSE NULL END,
         claim_token = NULL, claim_expires_at = NULL,
         last_error_code = LEFT(COALESCE(NULLIF(p_error_code, ''), 'EDLOVE_HISTORICAL_ASSIGNMENT_FAILED'), 96)
   WHERE operation_id = p_operation_id AND account_id = p_account_id
     AND state = 'claimed' AND claim_token = p_claim_token
  RETURNING true INTO v_updated;

  IF v_updated THEN
    UPDATE private.edlove_historical_assignment_operations AS operation
       SET state = 'paused', paused_at = pg_catalog.clock_timestamp()
     WHERE operation.id = p_operation_id AND operation.state = 'running'
       AND (
         SELECT count(*)
           FROM private.edlove_historical_assignment_operation_items AS item
          WHERE item.operation_id = operation.id AND item.state = 'failed'
       ) >= v_max_failed_accounts;
  END IF;

  PERFORM private.refresh_edlove_historical_assignment_operation(p_operation_id);
  RETURN COALESCE(v_updated, false);
END;
$$;

REVOKE ALL ON FUNCTION private.release_edlove_historical_assignment_operation_item(uuid, uuid, uuid, text)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.release_edlove_historical_assignment_operation_item(uuid, uuid, uuid, text)
  TO postgres;
