-- Query-backed indexes for Gurudevi's classroom, community, wellbeing, and
-- longitudinal-history access patterns. Keep this migration additive.

DO $$
DECLARE
  entry record;
BEGIN
  FOR entry IN
    SELECT * FROM (VALUES
      ('public.classroom_students', 'idx_classroom_students_student_status', '(student_id, status)'),
      ('public.assignments', 'idx_assignments_classroom_due_date', '(classroom_id, due_date)'),
      ('public.student_grades', 'idx_student_grades_student_created', '(student_id, created_at DESC)'),
      ('public.student_grades', 'idx_student_grades_classroom_student', '(classroom_id, student_id)'),
      ('public.student_grades', 'idx_student_grades_assignment', '(assignment_id)'),
      ('public.lessons', 'idx_lessons_classroom_order', '(classroom_id, order_index)'),
      ('public.lesson_materials', 'idx_lesson_materials_lesson', '(lesson_id)'),
      ('public.lesson_materials', 'idx_lesson_materials_classroom_created', '(classroom_id, created_at DESC)'),
      ('public.attendance', 'idx_attendance_classroom_date', '(classroom_id, date)'),
      ('public.attendance', 'idx_attendance_student_date', '(student_id, date)'),
      ('public.community_groups', 'idx_community_groups_school_created', '(school_id, created_at DESC)'),
      ('public.community_group_members', 'idx_community_group_members_group_status', '(group_id, status)'),
      ('public.community_posts', 'idx_community_posts_group_created', '(group_id, created_at DESC)'),
      ('public.community_posts', 'idx_community_posts_author_created', '(author_id, created_at DESC)'),
      ('public.group_messages', 'idx_group_messages_group_created', '(group_id, created_at DESC)'),
      ('public.community_reactions', 'idx_community_reactions_user_created', '(user_id, created_at DESC)'),
      ('public.mood_logs', 'idx_mood_logs_user_created', '(user_id, created_at DESC)'),
      ('public.fire_journal', 'idx_fire_journal_user_created', '(user_id, created_at DESC)'),
      ('public.growth_events', 'idx_growth_events_user_created', '(user_id, created_at DESC)'),
      ('public.growth_events', 'idx_growth_events_user_dimension_created', '(user_id, dimension, created_at DESC)'),
      ('public.student_longitudinal_events', 'idx_student_longitudinal_student_occurred', '(student_id, occurred_at DESC)'),
      ('public.student_longitudinal_events', 'idx_student_longitudinal_classroom_occurred', '(classroom_id, occurred_at DESC)')
    ) AS entries(table_name, index_name, column_expression)
  LOOP
    IF to_regclass(entry.table_name) IS NOT NULL THEN
      EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON %s %s', entry.index_name, entry.table_name, entry.column_expression);
    END IF;
  END LOOP;
END $$;
