-- 1. Sync existing users from auth.users to public.users
-- This fixes the immediate "ForeignKey Violation" and app hang
-- SECURITY: Role is set to 'teacher' by default, ignoring client-controlled metadata
INSERT INTO public.users (id, email, full_name, role, created_at, updated_at)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'full_name', 'Sanctuary User') as full_name, 
    'teacher' as role, -- Always default to 'teacher', ignore client metadata
    created_at, 
    NOW()
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users);

-- 2. Create a function to handle new user verification/creation
-- SECURITY: Always assigns 'teacher' role, ignoring raw_user_meta_data role claim
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', 'Sanctuary User'),
    'teacher' -- Always default to 'teacher', server-side role assignment required for elevation
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

-- 3. Create the trigger (if it doesn't exist)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Verify the sync
SELECT count(*) as total_public_users FROM public.users;
