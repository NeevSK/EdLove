-- Create the audit schema
CREATE SCHEMA IF NOT EXISTS audit;

-- Create the audit logs table
CREATE TABLE IF NOT EXISTS audit.logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_data JSONB,
    new_data JSONB,
    changed_by UUID REFERENCES auth.users(id),
    changed_at TIMESTAMPTZ DEFAULT now()
);

-- Index for searching history of a specific record
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON audit.logs (table_name, record_id);
-- Index for chronological sorting
CREATE INDEX IF NOT EXISTS idx_audit_logs_changed_at ON audit.logs (changed_at DESC);

-- The Audit Trigger Function
CREATE OR REPLACE FUNCTION audit.process_audit_log()
RETURNS TRIGGER AS $$
DECLARE
    current_user_id UUID;
BEGIN
    -- Try to get the user ID from the Supabase auth context
    BEGIN
        current_user_id := auth.uid();
    EXCEPTION WHEN OTHERS THEN
        current_user_id := NULL;
    END;

    IF (TG_OP = 'INSERT') THEN
        INSERT INTO audit.logs (table_name, record_id, action, new_data, changed_by)
        VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', to_jsonb(NEW), current_user_id);
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO audit.logs (table_name, record_id, action, old_data, new_data, changed_by)
        VALUES (TG_TABLE_NAME, OLD.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), current_user_id);
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO audit.logs (table_name, record_id, action, old_data, changed_by)
        VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', to_jsonb(OLD), current_user_id);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Usage Example (Commented out):
-- CREATE TRIGGER audit_classroom_notes
-- AFTER INSERT OR UPDATE OR DELETE ON classroom_notes
-- FOR EACH ROW EXECUTE FUNCTION audit.process_audit_log();
