-- ============================================================
-- MIGRATION: Auto-Sync Auth Users to Public Users (v1.0)
-- Problem: Users exist in Supabase Auth but not in our 'public.users' table,
--          causing foreign key errors when trying to save data (Mood Logs).
-- Solution: Create a Trigger on 'auth.users' to automatically insert into 'public.users'.
-- ============================================================

-- 1. Create the Function that runs on Signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role, school_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'), -- Default match
    (NEW.raw_user_meta_data->>'school_id')::uuid -- Expecting school_id in metadata
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. (OPTIONAL) Backfill existing users
-- If you are already logged in but your row is missing, this fixes it:
INSERT INTO public.users (id, email, full_name, role, school_id)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'full_name', 'Existing User'),
  COALESCE(raw_user_meta_data->>'role', 'student'),
  (raw_user_meta_data->>'school_id')::uuid
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users)
AND raw_user_meta_data->>'school_id' IS NOT NULL; 
-- Note: Requires school_id to be in metadata. If checking failing, ensure metadata exists.
