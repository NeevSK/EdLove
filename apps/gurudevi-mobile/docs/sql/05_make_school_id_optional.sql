-- ============================================================
-- 🛡️ CHANGE: Make school_id optional in Classrooms
-- Run this in your Supabase SQL Editor.
-- ============================================================

-- 1. Remove the NOT NULL constraint from school_id
ALTER TABLE public.classrooms ALTER COLUMN school_id DROP NOT NULL;

-- 2. Verify the change (Optional)
-- SELECT column_name, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'classrooms' AND column_name = 'school_id';

-- ✅ Change Applied!
-- You can now create classrooms without needing a school workspace.
