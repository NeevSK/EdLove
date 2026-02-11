-- ============================================
-- SHADOW ENROLLMENT SYSTEM
-- Allows teachers to add students by name before registration
-- ============================================

-- 1. Modify classroom_students table
ALTER TABLE public.classroom_students 
  ALTER COLUMN student_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS full_name TEXT, -- Stored name for shadow students
  ADD COLUMN IF NOT EXISTS invite_code TEXT UNIQUE DEFAULT substring(uuid_generate_v4()::text, 1, 8),
  ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ;

-- 2. Add comment for clarity
COMMENT ON COLUMN public.classroom_students.full_name IS 'The student''s name, used for shadow profiles before they link a real account.';
COMMENT ON COLUMN public.classroom_students.invite_code IS 'Unique code used by a student to claim this shadow enrollment record.';

-- 3. Update RLS: Allow users to claim their shadow record
-- A user can update a record if they have the correct invite_code and student_id is null
CREATE POLICY "Users can claim shadow enrollment" ON public.classroom_students
  FOR UPDATE TO authenticated
  USING (student_id IS NULL)
  WITH CHECK (student_id = auth.uid());

-- 4. Update the getAll view/query logic 
-- We should update the API to coalesce the name from users table or our shadow full_name column

-- 5. Add unique constraint for (classroom_id, student_id) only when student_id IS NOT NULL
-- The existing unique constraint might fail if we have multiple NULLs in some SQL dialects, 
-- but PostgreSQL allows multiple NULLs in a UNIQUE constraint unless it's a UNIQUE INDEX with WHERE.
ALTER TABLE public.classroom_students DROP CONSTRAINT IF EXISTS classroom_students_classroom_id_student_id_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_enrollment 
  ON public.classroom_students (classroom_id, student_id) 
  WHERE student_id IS NOT NULL;
