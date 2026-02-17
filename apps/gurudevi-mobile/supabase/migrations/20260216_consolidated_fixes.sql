-- Consolidated fixes for Runtime Errors & User Sync (2026-02-16)

-- 1. Create the missing function get_daily_content_for_today
CREATE OR REPLACE FUNCTION get_daily_content_for_today(content_type text)
RETURNS SETOF daily_content
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT *
  FROM daily_content
  WHERE type = content_type
    AND active = true
    AND date <= CURRENT_DATE
  ORDER BY date DESC
  LIMIT 1;
$$;

-- Ensure authenticated users have permission to use the function
GRANT EXECUTE ON FUNCTION get_daily_content_for_today(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_daily_content_for_today(text) TO anon;

-- 2. Fix mood_logs RLS
ALTER TABLE mood_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Strictly private mood logs" ON mood_logs;

CREATE POLICY "Users can insert their own mood logs"
ON mood_logs FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own mood logs"
ON mood_logs FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own mood logs"
ON mood_logs FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

-- Grant privileges to authenticated role
-- SECURITY: Anon role should only have SELECT on daily_content, not ALL
GRANT ALL ON TABLE mood_logs TO authenticated;
GRANT ALL ON TABLE daily_content TO authenticated;
GRANT SELECT ON TABLE daily_content TO anon;

-- 3. Fix User Sync (Foreign Key Issues)
-- Create a function to handle new user verification/creation
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

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Sync existing users (Safe to run multiple times due to WHERE clause)
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
