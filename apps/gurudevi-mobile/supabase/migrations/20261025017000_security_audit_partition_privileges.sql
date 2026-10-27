BEGIN;
-- Reads/writes must enter through the RLS-protected parent or the bounded RPC.
DO $$ DECLARE partition_row record; BEGIN
 FOR partition_row IN SELECT relid FROM pg_catalog.pg_partition_tree('public.security_audit_logs') WHERE level>0 LOOP
  EXECUTE pg_catalog.format('REVOKE ALL ON TABLE %s FROM PUBLIC,anon,authenticated',partition_row.relid);
 END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.create_next_month_partitions()
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
 next_month_start date := date_trunc('month',now()+interval '1 month');
 next_month_end date := next_month_start+interval '1 month';
 partition_name text;
BEGIN
 partition_name := 'sentinel_audit_logs_'||to_char(next_month_start,'YYYY_"m"MM');
 EXECUTE format('CREATE TABLE %I PARTITION OF sentinel_audit_logs FOR VALUES FROM (%L) TO (%L)',
  partition_name,next_month_start,next_month_end);
 EXECUTE format('CREATE INDEX %I ON %I (actor_id,created_at)',partition_name||'_actor_created_idx',partition_name);
 EXECUTE format('CREATE INDEX %I ON %I (action,created_at)',partition_name||'_action_created_idx',partition_name);

 partition_name := 'security_audit_logs_'||to_char(next_month_start,'YYYY_"m"MM');
 EXECUTE format('CREATE TABLE %I PARTITION OF security_audit_logs FOR VALUES FROM (%L) TO (%L)',
  partition_name,next_month_start,next_month_end);
 EXECUTE format('REVOKE ALL ON TABLE %I FROM PUBLIC,anon,authenticated',partition_name);
 EXECUTE format('CREATE INDEX %I ON %I (account_id,created_at)',partition_name||'_account_created_idx',partition_name);
 EXECUTE format('CREATE INDEX %I ON %I (action,created_at)',partition_name||'_action_created_idx',partition_name);

 partition_name := 'privacy_ledger_entries_'||to_char(next_month_start,'YYYY_"m"MM');
 EXECUTE format('CREATE TABLE %I PARTITION OF privacy_ledger_entries FOR VALUES FROM (%L) TO (%L)',
  partition_name,next_month_start,next_month_end);
 EXECUTE format('CREATE INDEX %I ON %I (user_id,created_at)',partition_name||'_user_created_idx',partition_name);

 partition_name := 'student_longitudinal_events_'||to_char(next_month_start,'YYYY_"m"MM');
 EXECUTE format('CREATE TABLE %I PARTITION OF student_longitudinal_events FOR VALUES FROM (%L) TO (%L)',
  partition_name,next_month_start,next_month_end);
 EXECUTE format('CREATE INDEX %I ON %I (student_id,occurred_at DESC,recorded_at DESC)',partition_name||'_student_occurred_idx',partition_name);
END $$;
COMMIT;
