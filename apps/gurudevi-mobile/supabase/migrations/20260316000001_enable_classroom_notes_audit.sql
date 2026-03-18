-- Enable auditing for classroom_notes
DROP TRIGGER IF EXISTS audit_classroom_notes ON public.classroom_notes;
CREATE TRIGGER audit_classroom_notes
AFTER INSERT OR UPDATE OR DELETE ON public.classroom_notes
FOR EACH ROW EXECUTE FUNCTION audit.process_audit_log();
