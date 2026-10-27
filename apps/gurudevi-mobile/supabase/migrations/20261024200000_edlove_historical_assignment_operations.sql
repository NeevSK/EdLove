-- Phase 1B is a private, operator-controlled reconciliation mechanism for
-- accounts that existed before the new-durable-account handoff. It neither
-- changes canonical account IDs nor automatically starts a backfill.
CREATE TABLE IF NOT EXISTS private.edlove_historical_assignment_controls (
  singleton boolean PRIMARY KEY DEFAULT true CHECK (singleton),
  execution_enabled boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp()
);

INSERT INTO private.edlove_historical_assignment_controls (singleton)
VALUES (true)
ON CONFLICT (singleton) DO NOTHING;

CREATE TABLE IF NOT EXISTS private.edlove_historical_assignment_operations (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  operation_key uuid NOT NULL UNIQUE,
  state text NOT NULL DEFAULT 'planned'
    CHECK (state IN ('planned', 'approved', 'running', 'paused', 'completed', 'failed')),
  max_batch_size integer NOT NULL CHECK (max_batch_size BETWEEN 1 AND 100),
  max_attempts_per_account integer NOT NULL DEFAULT 3
    CHECK (max_attempts_per_account BETWEEN 1 AND 3),
  max_failed_accounts integer NOT NULL CHECK (max_failed_accounts BETWEEN 1 AND 100),
  candidate_count integer NOT NULL DEFAULT 0 CHECK (candidate_count >= 0),
  assigned_count integer NOT NULL DEFAULT 0 CHECK (assigned_count >= 0),
  skipped_count integer NOT NULL DEFAULT 0 CHECK (skipped_count >= 0),
  failed_count integer NOT NULL DEFAULT 0 CHECK (failed_count >= 0),
  created_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp(),
  approved_at timestamptz,
  started_at timestamptz,
  paused_at timestamptz,
  completed_at timestamptz
);

CREATE TABLE IF NOT EXISTS private.edlove_historical_assignment_operation_items (
  operation_id uuid NOT NULL REFERENCES private.edlove_historical_assignment_operations(id)
    ON DELETE CASCADE,
  account_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  state text NOT NULL DEFAULT 'pending'
    CHECK (state IN ('pending', 'claimed', 'assigned', 'skipped', 'failed')),
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  last_error_code text,
  claim_token uuid,
  claim_expires_at timestamptz,
  completed_at timestamptz,
  PRIMARY KEY (operation_id, account_id)
);

CREATE INDEX IF NOT EXISTS edlove_historical_assignment_operation_items_claim_idx
  ON private.edlove_historical_assignment_operation_items (operation_id, state, claim_expires_at, account_id);

ALTER TABLE private.edlove_historical_assignment_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.edlove_historical_assignment_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.edlove_historical_assignment_operation_items ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE private.edlove_historical_assignment_controls,
  private.edlove_historical_assignment_operations,
  private.edlove_historical_assignment_operation_items
  FROM PUBLIC, anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION private.refresh_edlove_historical_assignment_operation(p_operation_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_remaining_count integer;
BEGIN
  UPDATE private.edlove_historical_assignment_operations AS operation
     SET candidate_count = (
           SELECT count(*)::integer
             FROM private.edlove_historical_assignment_operation_items AS item
            WHERE item.operation_id = operation.id
         ),
         assigned_count = (
           SELECT count(*)::integer
             FROM private.edlove_historical_assignment_operation_items AS item
            WHERE item.operation_id = operation.id AND item.state = 'assigned'
         ),
         skipped_count = (
           SELECT count(*)::integer
             FROM private.edlove_historical_assignment_operation_items AS item
            WHERE item.operation_id = operation.id AND item.state = 'skipped'
         ),
         failed_count = (
           SELECT count(*)::integer
             FROM private.edlove_historical_assignment_operation_items AS item
            WHERE item.operation_id = operation.id AND item.state = 'failed'
         )
   WHERE operation.id = p_operation_id;

  SELECT count(*)::integer INTO v_remaining_count
    FROM private.edlove_historical_assignment_operation_items
   WHERE operation_id = p_operation_id
     AND state IN ('pending', 'claimed');

  IF v_remaining_count = 0 THEN
    UPDATE private.edlove_historical_assignment_operations
       SET state = 'completed', completed_at = COALESCE(completed_at, pg_catalog.clock_timestamp())
     WHERE id = p_operation_id AND state = 'running';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION private.create_edlove_historical_assignment_operation(
  p_operation_key uuid,
  p_max_batch_size integer,
  p_max_failed_accounts integer
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_operation_id uuid;
BEGIN
  IF p_operation_key IS NULL OR p_operation_key = '00000000-0000-0000-0000-000000000000'::uuid THEN
    RAISE EXCEPTION 'operation key must be a non-nil UUID' USING ERRCODE = '22023';
  END IF;
  IF p_max_batch_size IS NULL OR p_max_batch_size NOT BETWEEN 1 AND 100
     OR p_max_failed_accounts IS NULL OR p_max_failed_accounts NOT BETWEEN 1 AND 100 THEN
    RAISE EXCEPTION 'operation limits must be between 1 and 100' USING ERRCODE = '22023';
  END IF;

  INSERT INTO private.edlove_historical_assignment_operations (
    operation_key, max_batch_size, max_failed_accounts
  ) VALUES (p_operation_key, p_max_batch_size, p_max_failed_accounts)
  ON CONFLICT (operation_key) DO NOTHING
  RETURNING id INTO v_operation_id;

  IF v_operation_id IS NULL THEN
    SELECT id INTO v_operation_id
      FROM private.edlove_historical_assignment_operations
     WHERE operation_key = p_operation_key;
    RETURN v_operation_id;
  END IF;

  INSERT INTO private.edlove_historical_assignment_operation_items (operation_id, account_id)
  SELECT v_operation_id, account.id
    FROM public.users AS account
   WHERE account.edlove_id IS NULL
     AND account.deleted_at IS NULL
     AND COALESCE(account.is_anonymous, false) = false
   ORDER BY account.id;

  PERFORM private.refresh_edlove_historical_assignment_operation(v_operation_id);
  RETURN v_operation_id;
END;
$$;

CREATE OR REPLACE FUNCTION private.approve_edlove_historical_assignment_operation(p_operation_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE private.edlove_historical_assignment_operations
     SET state = 'approved', approved_at = pg_catalog.clock_timestamp()
   WHERE id = p_operation_id AND state = 'planned';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'only a planned operation can be approved' USING ERRCODE = 'P0001';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION private.set_edlove_historical_assignment_execution_enabled(p_enabled boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE private.edlove_historical_assignment_controls
     SET execution_enabled = COALESCE(p_enabled, false), updated_at = pg_catalog.clock_timestamp()
   WHERE singleton = true;
  IF NOT COALESCE(p_enabled, false) THEN
    UPDATE private.edlove_historical_assignment_operations
       SET state = 'paused', paused_at = pg_catalog.clock_timestamp()
     WHERE state = 'running';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION private.start_edlove_historical_assignment_operation(p_operation_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM private.edlove_historical_assignment_controls WHERE singleton AND execution_enabled
  ) THEN
    RAISE EXCEPTION 'historical EdLove assignment execution is disabled' USING ERRCODE = 'P0001';
  END IF;

  UPDATE private.edlove_historical_assignment_operations
     SET state = 'running', started_at = COALESCE(started_at, pg_catalog.clock_timestamp()), paused_at = NULL
   WHERE id = p_operation_id AND state IN ('approved', 'paused');
  IF NOT FOUND THEN
    RAISE EXCEPTION 'only an approved or paused operation can be started' USING ERRCODE = 'P0001';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION private.pause_edlove_historical_assignment_operation(p_operation_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE private.edlove_historical_assignment_operations
     SET state = 'paused', paused_at = pg_catalog.clock_timestamp()
   WHERE id = p_operation_id AND state IN ('approved', 'running');
  IF NOT FOUND THEN
    RAISE EXCEPTION 'only an approved or running operation can be paused' USING ERRCODE = 'P0001';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION private.claim_edlove_historical_assignment_operation_items(
  p_operation_id uuid,
  p_max_items integer
)
RETURNS TABLE (account_id uuid, claim_token uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_max_batch_size integer;
BEGIN
  SELECT max_batch_size INTO v_max_batch_size
    FROM private.edlove_historical_assignment_operations
   WHERE id = p_operation_id AND state = 'running'
   FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'operation is not running' USING ERRCODE = 'P0001';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM private.edlove_historical_assignment_controls WHERE singleton AND execution_enabled
  ) THEN
    RAISE EXCEPTION 'historical EdLove assignment execution is disabled' USING ERRCODE = 'P0001';
  END IF;
  IF p_max_items IS NULL OR p_max_items NOT BETWEEN 1 AND v_max_batch_size THEN
    RAISE EXCEPTION 'claim limit is outside the approved operation batch size' USING ERRCODE = '22023';
  END IF;

  UPDATE private.edlove_historical_assignment_operation_items AS item
     SET state = 'skipped', completed_at = pg_catalog.clock_timestamp(),
         claim_token = NULL, claim_expires_at = NULL, last_error_code = 'ALREADY_ASSIGNED'
    FROM public.users AS account
   WHERE item.operation_id = p_operation_id
     AND item.account_id = account.id
     AND item.state IN ('pending', 'claimed')
     AND account.edlove_id IS NOT NULL;

  RETURN QUERY
  WITH candidates AS (
    SELECT item.account_id
      FROM private.edlove_historical_assignment_operation_items AS item
      JOIN public.users AS account ON account.id = item.account_id
     WHERE item.operation_id = p_operation_id
       AND item.state IN ('pending', 'claimed')
       AND (item.claim_expires_at IS NULL OR item.claim_expires_at <= pg_catalog.clock_timestamp())
       AND account.edlove_id IS NULL
       AND account.deleted_at IS NULL
       AND COALESCE(account.is_anonymous, false) = false
     ORDER BY item.account_id
     LIMIT p_max_items
     FOR UPDATE OF item SKIP LOCKED
  )
  UPDATE private.edlove_historical_assignment_operation_items AS item
     SET state = 'claimed', claim_token = pg_catalog.gen_random_uuid(),
         claim_expires_at = pg_catalog.clock_timestamp() + interval '5 minutes'
    FROM candidates
   WHERE item.operation_id = p_operation_id AND item.account_id = candidates.account_id
  RETURNING item.account_id, item.claim_token;

  PERFORM private.refresh_edlove_historical_assignment_operation(p_operation_id);
END;
$$;

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
  UPDATE private.edlove_historical_assignment_operation_items
     SET state = 'assigned', completed_at = pg_catalog.clock_timestamp(),
         claim_token = NULL, claim_expires_at = NULL, last_error_code = NULL
   WHERE operation_id = p_operation_id AND account_id = p_account_id
     AND state = 'claimed' AND claim_token = p_claim_token
  RETURNING true INTO v_updated;
  PERFORM private.refresh_edlove_historical_assignment_operation(p_operation_id);
  RETURN COALESCE(v_updated, false);
END;
$$;

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

  PERFORM private.refresh_edlove_historical_assignment_operation(p_operation_id);
  UPDATE private.edlove_historical_assignment_operations
     SET state = 'paused', paused_at = pg_catalog.clock_timestamp()
   WHERE id = p_operation_id AND state = 'running'
     AND failed_count >= v_max_failed_accounts;
  RETURN COALESCE(v_updated, false);
END;
$$;

REVOKE ALL ON FUNCTION private.refresh_edlove_historical_assignment_operation(uuid),
  private.create_edlove_historical_assignment_operation(uuid, integer, integer),
  private.approve_edlove_historical_assignment_operation(uuid),
  private.set_edlove_historical_assignment_execution_enabled(boolean),
  private.start_edlove_historical_assignment_operation(uuid),
  private.pause_edlove_historical_assignment_operation(uuid),
  private.claim_edlove_historical_assignment_operation_items(uuid, integer),
  private.complete_edlove_historical_assignment_operation_item(uuid, uuid, uuid),
  private.release_edlove_historical_assignment_operation_item(uuid, uuid, uuid, text)
  FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION private.create_edlove_historical_assignment_operation(uuid, integer, integer),
  private.approve_edlove_historical_assignment_operation(uuid),
  private.set_edlove_historical_assignment_execution_enabled(boolean),
  private.start_edlove_historical_assignment_operation(uuid),
  private.pause_edlove_historical_assignment_operation(uuid),
  private.claim_edlove_historical_assignment_operation_items(uuid, integer),
  private.complete_edlove_historical_assignment_operation_item(uuid, uuid, uuid),
  private.release_edlove_historical_assignment_operation_item(uuid, uuid, uuid, text)
  TO postgres;

COMMENT ON TABLE private.edlove_historical_assignment_operations IS
  'Private, default-off Phase 1B operation ledger. It snapshots historical eligible accounts but never starts an assignment automatically.';
