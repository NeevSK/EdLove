-- Query-backed indexes for Gurudevi's classroom, community, wellbeing, and
-- longitudinal-history access patterns. Keep this migration additive.

CREATE INDEX IF NOT EXISTS idx_classroom_students_student_status
  ON public.classroom_students (student_id, status);
CREATE INDEX IF NOT EXISTS idx_assignments_classroom_due_date
  ON public.assignments (classroom_id, due_date);
CREATE INDEX IF NOT EXISTS idx_student_grades_student_created
  ON public.student_grades (student_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_student_grades_classroom_student
  ON public.student_grades (classroom_id, student_id);
CREATE INDEX IF NOT EXISTS idx_student_grades_assignment
  ON public.student_grades (assignment_id);
CREATE INDEX IF NOT EXISTS idx_lessons_classroom_order
  ON public.lessons (classroom_id, order_index);
CREATE INDEX IF NOT EXISTS idx_lesson_materials_lesson
  ON public.lesson_materials (lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_materials_classroom_created
  ON public.lesson_materials (classroom_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_attendance_classroom_date
  ON public.attendance (classroom_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_student_date
  ON public.attendance (student_id, date);
CREATE INDEX IF NOT EXISTS idx_community_groups_school_created
  ON public.community_groups (school_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_group_members_group_status
  ON public.community_group_members (group_id, status);
CREATE INDEX IF NOT EXISTS idx_community_posts_group_created
  ON public.community_posts (group_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_author_created
  ON public.community_posts (author_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_group_messages_group_created
  ON public.group_messages (group_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_reactions_user_created
  ON public.community_reactions (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mood_logs_user_created
  ON public.mood_logs (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fire_journal_user_created
  ON public.fire_journal (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_growth_events_user_created
  ON public.growth_events (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_growth_events_user_dimension_created
  ON public.growth_events (user_id, dimension, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_student_longitudinal_student_occurred
  ON public.student_longitudinal_events (student_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_student_longitudinal_classroom_occurred
  ON public.student_longitudinal_events (classroom_id, occurred_at DESC);
