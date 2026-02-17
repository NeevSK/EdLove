-- Add is_anonymous field to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT false NOT NULL;

-- Update the handle_new_user trigger to support anonymous users correctly
-- This function is called whenever a new user is created in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role, is_anonymous)
  VALUES (
    new.id, 
    COALESCE(new.email, 'anonymous@' || new.id::text), -- Use generated email for anon
    COALESCE(new.raw_user_meta_data->>'full_name', CASE WHEN (new.raw_user_meta_data->>'is_anonymous')::boolean THEN 'Guest User' ELSE 'Sanctuary User' END),
    COALESCE(new.raw_user_meta_data->>'role', 'teacher'),
    COALESCE((new.raw_user_meta_data->>'is_anonymous')::boolean, (new.email IS NULL))
  )
  ON CONFLICT (id) DO UPDATE SET
    is_anonymous = EXCLUDED.is_anonymous,
    full_name = CASE WHEN EXCLUDED.is_anonymous = false AND users.is_anonymous = true THEN EXCLUDED.full_name ELSE users.full_name END,
    email = CASE WHEN EXCLUDED.is_anonymous = false AND users.is_anonymous = true THEN EXCLUDED.email ELSE users.email END;
  RETURN new;
END;
$$;

-- Add comment
COMMENT ON COLUMN public.users.is_anonymous IS 'True if user is an anonymous/guest user who has not completed registration';

-- Add a notice about deletion policy (actual deletion will be handled by Edge Function/Cron)
COMMENT ON TABLE public.users IS 'Gurudevi users table. Anonymous users (is_anonymous=true) with no activity for 14 days are subject to deletion.';
