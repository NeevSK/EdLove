-- Migration: assignments table RLS policies
-- Purpose: Enable teachers to manage assignments for their classrooms
--          and students (or enrolled classroom members) to view active assignments.
-- Aligns with schema.zmodel Assignment @@allow rules.

ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- 1. Teachers can manage (SELECT, INSERT, UPDATE, DELETE) assignments in their classrooms
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'assignments'
      AND policyname = 'Teachers can manage assignments in their classrooms'
  ) THEN
    CREATE POLICY "Teachers can manage assignments in their classrooms"
      ON public.assignments
      FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.classrooms c
          WHERE c.id = assignments.classroom_id AND c.teacher_id = auth.uid()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.classrooms c
          WHERE c.id = assignments.classroom_id AND c.teacher_id = auth.uid()
        )
      );
  END IF;
END $$;

-- 2. Authenticated users / students can read assignments in unarchived classrooms or enrolled classes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'assignments'
      AND policyname = 'Students can read assignments in their classrooms'
  ) THEN
    CREATE POLICY "Students can read assignments in their classrooms"
      ON public.assignments
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.classroom_students cs
          WHERE cs.classroom_id = assignments.classroom_id AND cs.student_id = auth.uid()
        )
        OR EXISTS (
          SELECT 1 FROM public.classrooms c
          WHERE c.id = assignments.classroom_id AND (c.teacher_id = auth.uid() OR c.is_archived = false)
        )
      );
  END IF;
END $$;
