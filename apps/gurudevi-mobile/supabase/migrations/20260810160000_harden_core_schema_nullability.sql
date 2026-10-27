-- Core schema parity batch. The retained ledger supports multiple historical
-- shapes, so only harden a contract when its table and column are present.
DO $$
DECLARE
  entry record;
BEGIN
  FOR entry IN
    SELECT * FROM (VALUES
      ('public.users', 'subjects_taught'), ('public.users', 'qualifications'),
      ('public.assignments', 'max_points'),
      ('public.student_grades', 'classroom_id'), ('public.student_grades', 'student_id'),
      ('public.student_grades', 'graded_by'), ('public.student_grades', 'marks'),
      ('public.student_grades', 'grade'), ('public.student_grades', 'gpa'),
      ('public.student_grades', 'updated_at'),
      ('public.classroom_join_requests', 'user_id'), ('public.classroom_join_requests', 'classroom_id'),
      ('public.classroom_join_requests', 'status'), ('public.classroom_join_requests', 'created_at'),
      ('public.classroom_join_requests', 'updated_at'),
      ('public.classroom_legacy_records', 'classroom_id'), ('public.classroom_legacy_records', 'teacher_id'),
      ('public.classroom_legacy_records', 'student_count'), ('public.classroom_legacy_records', 'top_achievements'),
      ('public.classroom_legacy_records', 'created_at'), ('public.classroom_legacy_records', 'updated_at'),
      ('public.notifications', 'user_id'), ('public.notifications', 'body'), ('public.notifications', 'created_at'),
      ('public.inventory_items', 'condition'), ('public.inventory_items', 'created_at'), ('public.inventory_items', 'updated_at')
    ) AS entries(table_name, column_name)
  LOOP
    IF to_regclass(entry.table_name) IS NOT NULL
       AND EXISTS (
         SELECT 1 FROM information_schema.columns
         WHERE table_schema = split_part(entry.table_name, '.', 1)
           AND table_name = split_part(entry.table_name, '.', 2)
           AND column_name = entry.column_name
       ) THEN
      EXECUTE format('ALTER TABLE %s ALTER COLUMN %I SET NOT NULL', entry.table_name, entry.column_name);
    END IF;
  END LOOP;
END $$;
