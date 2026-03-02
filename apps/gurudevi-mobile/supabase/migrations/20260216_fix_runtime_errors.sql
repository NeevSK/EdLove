-- Create the missing function get_daily_content_for_today
CREATE OR REPLACE FUNCTION get_daily_content_for_today(content_type text)
RETURNS SETOF daily_content
LANGUAGE sql
SECURITY DEFINER SET search_path = public, pg_temp
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

-- Fix mood_logs RLS
-- First, ensure RLS is enabled
ALTER TABLE mood_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it's too restrictive (or we just recreate to be sure)
DROP POLICY IF EXISTS "Strictly private mood logs" ON mood_logs;

-- Create separated policies for better control

-- 1. Allow users to insert their own logs
CREATE POLICY "Users can insert their own mood logs"
ON mood_logs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 2. Allow users to view their own logs
CREATE POLICY "Users can view their own mood logs"
ON mood_logs
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 3. Allow users to update their own logs
CREATE POLICY "Users can update their own mood logs"
ON mood_logs
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Grant privileges to authenticated role
GRANT ALL ON TABLE mood_logs TO authenticated;
GRANT ALL ON TABLE daily_content TO authenticated;
-- SECURITY: Anon role should only have SELECT on daily_content, not ALL
GRANT SELECT ON TABLE daily_content TO anon;
