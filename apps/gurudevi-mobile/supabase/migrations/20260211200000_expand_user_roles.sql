-- ========================================================
-- EXPAND USER ROLES CONSTRAINT (v5)
-- Adds 'founder' and 'admin' to the allowed roles
-- ========================================================

-- 1. Drop the old constraint (it might have different names depending on when it was created)
-- In master_baseline it was an inline CHECK. We'll try to drop by finding it or just re-defining the table check.
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;

-- 2. Add the expanded constraint
ALTER TABLE public.users ADD CONSTRAINT users_role_check 
CHECK (role IN ('founder', 'admin', 'principal', 'section_head', 'grade_head', 'teacher', 'student'));

-- 3. Update the handle_complete logic in the app might also need to ensure we don't send nulls
-- (Applied in the next step)
