-- Migration: Add roll_number and notes to classroom_students
-- Description: Supports manual student management and classroom context details.

-- 1. Add columns to classroom_students
ALTER TABLE public.classroom_students 
ADD COLUMN IF NOT EXISTS roll_number INTEGER,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- 2. Update RLS policies (if needed, but usually the existing ones cover it if they use ALL or specific columns)
-- Basic check: The previous Nuclear Fix uses SECURITY DEFINER functions, so we might need to check if those functions need updating.
-- However, standard SELECT * will work.

COMMENT ON COLUMN public.classroom_students.roll_number IS 'The student''s roll number or index within this specific classroom.';
COMMENT ON COLUMN public.classroom_students.notes IS 'Teacher''s private notes about the student in the context of this classroom.';
