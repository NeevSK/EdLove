-- ============================================================================
-- DECENTRALIZED TEMPORAL MIRRORS (DTM)
-- Implementation of per-table history tracking and offline-sync metadata
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS resonance;

-- Generic function to create a "Temporal Mirror" (History Table)
-- This creates a shadow table that stores the previous state of a row
-- before any UPDATE or DELETE operation.
CREATE OR REPLACE FUNCTION resonance.create_temporal_mirror(schema_name TEXT, table_name TEXT)
RETURNS VOID AS $$
BEGIN
    -- 1. Create the History Table in the resonance schema
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.%I_history (
            history_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            original_id UUID NOT NULL,
            row_data JSONB NOT NULL,
            valid_from TIMESTAMPTZ NOT NULL,
            valid_to TIMESTAMPTZ NOT NULL,
            recorded_at TIMESTAMPTZ DEFAULT now(),
            recorded_by UUID
        )', 
        'resonance', table_name);

    -- 2. Create the Archive Trigger Function
    EXECUTE format('
        CREATE OR REPLACE FUNCTION resonance.archive_%I()
        RETURNS TRIGGER AS $inner$
        BEGIN
            IF (TG_OP = ''UPDATE'') THEN
                -- Archive the OLD version
                INSERT INTO resonance.%I_history (original_id, row_data, valid_from, valid_to, recorded_by)
                VALUES (OLD.id, to_jsonb(OLD), OLD.valid_from, now(), auth.uid());
                -- Advance the valid_from of the CURRENT version
                NEW.valid_from = now();
            ELSIF (TG_OP = ''DELETE'') THEN
                -- Archive the final version
                INSERT INTO resonance.%I_history (original_id, row_data, valid_from, valid_to, recorded_by)
                VALUES (OLD.id, to_jsonb(OLD), OLD.valid_from, now(), auth.uid());
            END IF;
            RETURN NEW;
        END;
        $inner$ LANGUAGE plpgsql SECURITY DEFINER;',
        table_name, table_name, table_name);

    -- 3. Attach Trigger
    EXECUTE format('
        DROP TRIGGER IF EXISTS trg_resonance_mirror_%I ON %I.%I;
        CREATE TRIGGER trg_resonance_mirror_%I
        BEFORE UPDATE OR DELETE ON %I.%I
        FOR EACH ROW EXECUTE FUNCTION resonance.archive_%I()',
        table_name, schema_name, table_name, table_name, schema_name, table_name, table_name);
END;
$$ LANGUAGE plpgsql;

-- Helper to enable offline-ready bi-temporal support for a table
-- Implementation includes:
-- - local_sync_id: For reconciliation of offline-created notes/logs
-- - is_pending_sync: Flag for local-first UI feedback
-- - valid_from/to: Bi-temporal validity range
CREATE OR REPLACE FUNCTION resonance.enable_resonance(schema_name TEXT, table_name TEXT)
RETURNS VOID AS $$
BEGIN
    -- Add temporal/sync columns to base table
    EXECUTE format('
        ALTER TABLE %I.%I 
        ADD COLUMN IF NOT EXISTS local_sync_id UUID UNIQUE,
        ADD COLUMN IF NOT EXISTS is_pending_sync BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS valid_from TIMESTAMPTZ DEFAULT now(),
        ADD COLUMN IF NOT EXISTS valid_to TIMESTAMPTZ',
        schema_name, table_name);

    -- Create mirror
    PERFORM resonance.create_temporal_mirror(schema_name, table_name);
END;
$$ LANGUAGE plpgsql;
