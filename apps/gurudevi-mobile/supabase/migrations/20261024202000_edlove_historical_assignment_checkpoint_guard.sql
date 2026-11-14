-- A worker may only receipt an assignment after the dedicated writer has
-- durably populated the additive handle. This prevents a stale or faulty
-- caller from turning an unassigned account into an apparently-complete item.
CREATE OR REPLACE FUNCTION private.complete_edlove_historical_assignment_operation_item(
  p_operation_id uuid,
  p_account_id uuid,
  p_claim_token uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_updated boolean;
BEGIN
  UPDATE private.edlove_historical_assignment_operation_items AS item
     SET state = 'assigned', completed_at = pg_catalog.clock_timestamp(),
         claim_token = NULL, claim_expires_at = NULL, last_error_code = NULL
   WHERE item.operation_id = p_operation_id AND item.account_id = p_account_id
     AND item.state = 'claimed' AND item.claim_token = p_claim_token
     AND EXISTS (
       SELECT 1
         FROM public.users AS account
        WHERE account.id = item.account_id AND account.edlove_id IS NOT NULL
     )
  RETURNING true INTO v_updated;
  PERFORM private.refresh_edlove_historical_assignment_operation(p_operation_id);
  RETURN COALESCE(v_updated, false);
END;
$$;

REVOKE ALL ON FUNCTION private.complete_edlove_historical_assignment_operation_item(uuid, uuid, uuid)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.complete_edlove_historical_assignment_operation_item(uuid, uuid, uuid)
  TO postgres;
