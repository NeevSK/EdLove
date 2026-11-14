-- Per-school scope for the student attendance history endpoint
-- (attendance.getStudentHistory). '{}' means the strict defaults:
--   the student, their VERIFIED guardians, teachers only for grade classes they teach
--   (class teachers: the student's whole history in that school), and the principal of
--   the student's school. Everyone else is denied; pending guardians never see history.
-- Recognised keys (anything else is ignored; invalid values fall back to the default):
--   guardians:        'verified' (default) | 'none'
--   subjectTeachers:  'own_class' (default) | 'none'
--   classTeachers:    'school_history' (default) | 'own_class'
--   leaderCapacities: array of extra capacities beyond principal, from
--                     'section_head' | 'grade_head' (default [])
-- See apps/sanctuary-api/src/core/studentHistoryAccess.ts.
ALTER TABLE public.schools
  ADD COLUMN IF NOT EXISTS student_history_access jsonb NOT NULL DEFAULT '{}'::jsonb;
