-- Core schema parity batch: all rows were verified non-null before this
-- migration was prepared. These constraints make the live database match the
-- required ZModel contracts instead of allowing invalid partial records.

ALTER TABLE public.users
  ALTER COLUMN subjects_taught SET NOT NULL,
  ALTER COLUMN qualifications SET NOT NULL;

ALTER TABLE public.assignments
  ALTER COLUMN max_points SET NOT NULL;

ALTER TABLE public.student_grades
  ALTER COLUMN classroom_id SET NOT NULL,
  ALTER COLUMN student_id SET NOT NULL,
  ALTER COLUMN graded_by SET NOT NULL,
  ALTER COLUMN marks SET NOT NULL,
  ALTER COLUMN grade SET NOT NULL,
  ALTER COLUMN gpa SET NOT NULL,
  ALTER COLUMN updated_at SET NOT NULL;

ALTER TABLE public.classroom_join_requests
  ALTER COLUMN user_id SET NOT NULL,
  ALTER COLUMN classroom_id SET NOT NULL,
  ALTER COLUMN status SET NOT NULL,
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN updated_at SET NOT NULL;

ALTER TABLE public.classroom_legacy_records
  ALTER COLUMN classroom_id SET NOT NULL,
  ALTER COLUMN teacher_id SET NOT NULL,
  ALTER COLUMN student_count SET NOT NULL,
  ALTER COLUMN top_achievements SET NOT NULL,
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN updated_at SET NOT NULL;

ALTER TABLE public.notifications
  ALTER COLUMN user_id SET NOT NULL,
  ALTER COLUMN body SET NOT NULL,
  ALTER COLUMN created_at SET NOT NULL;

ALTER TABLE public.inventory_items
  ALTER COLUMN condition SET NOT NULL,
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN updated_at SET NOT NULL;
