-- ========================================================
-- CRITICAL SECURITY FIX: RLS Privilege Escalation
-- Issue: Users could modify role/school_id to gain unauthorized access
-- Severity: CRITICAL
-- Date: 2026-02-18
-- ========================================================

-- 1. Drop vulnerable policy
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

-- 2. Create secure policy (column-restricted)
-- This prevents users from modifying privileged fields like role and school_id
CREATE POLICY "Users can update safe profile fields" 
ON public.users FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (
  id = auth.uid() AND
  -- Ensure privileged fields remain unchanged
  role = (SELECT role FROM public.users WHERE id = auth.uid()) AND
  school_id IS NOT DISTINCT FROM (SELECT school_id FROM public.users WHERE id = auth.uid()) AND
  section_id IS NOT DISTINCT FROM (SELECT section_id FROM public.users WHERE id = auth.uid()) AND
  grade_id IS NOT DISTINCT FROM (SELECT grade_id FROM public.users WHERE id = auth.uid()) AND
  is_pro = (SELECT is_pro FROM public.users WHERE id = auth.uid()) AND
  is_thuthimal = (SELECT is_thuthimal FROM public.users WHERE id = auth.uid()) AND
  invitations_remaining = (SELECT invitations_remaining FROM public.users WHERE id = auth.uid()) AND
  invitations_sent = (SELECT invitations_sent FROM public.users WHERE id = auth.uid())
);

-- 3. Create audit log table for role assignments
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action TEXT NOT NULL,
  actor_id UUID REFERENCES public.users(id),
  target_user_id UUID REFERENCES public.users(id),
  old_role TEXT,
  new_role TEXT,
  old_school_id UUID,
  new_school_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on audit log
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Only founders/admins can view audit logs
CREATE POLICY "audit_log_admin_view" ON public.audit_log 
FOR SELECT TO authenticated 
USING (EXISTS (
  SELECT 1 FROM public.users 
  WHERE id = auth.uid() AND role IN ('founder', 'admin')
));

-- 4. Create secure admin function for role assignment
CREATE OR REPLACE FUNCTION assign_user_role(
  target_user_id UUID,
  new_role TEXT,
  new_school_id UUID DEFAULT NULL,
  new_section_id UUID DEFAULT NULL,
  new_grade_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  old_role_val TEXT;
  old_school_val UUID;
  actor_role TEXT;
BEGIN
  -- Get actor's role
  SELECT role INTO actor_role FROM public.users WHERE id = auth.uid();
  
  -- Only founders and admins can assign roles
  IF actor_role NOT IN ('founder', 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Only founders and admins can assign roles';
  END IF;

  -- Validate role
  IF new_role NOT IN ('founder', 'admin', 'principal', 'section_head', 'grade_head', 'teacher', 'student') THEN
    RAISE EXCEPTION 'Invalid role: %', new_role;
  END IF;

  -- Get old values for audit
  SELECT role, school_id INTO old_role_val, old_school_val 
  FROM public.users WHERE id = target_user_id;

  -- Update user (bypasses RLS with SECURITY DEFINER)
  UPDATE public.users
  SET 
    role = new_role,
    school_id = COALESCE(new_school_id, school_id),
    section_id = new_section_id,
    grade_id = new_grade_id,
    updated_at = now()
  WHERE id = target_user_id;
  
  -- Log the assignment for audit trail
  INSERT INTO audit_log (
    action, actor_id, target_user_id, 
    old_role, new_role,
    old_school_id, new_school_id,
    created_at
  )
  VALUES (
    'role_assignment', 
    auth.uid(), 
    target_user_id, 
    old_role_val, 
    new_role,
    old_school_val,
    new_school_id,
    now()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Grant execute permission to authenticated users (authorization checked inside function)
GRANT EXECUTE ON FUNCTION assign_user_role TO authenticated;

-- ========================================================
-- VERIFICATION QUERIES
-- ========================================================

-- Test 1: Verify policy exists
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'users' AND policyname = 'Users can update safe profile fields';

-- Test 2: Verify audit log table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_name = 'audit_log'
);

-- Test 3: Verify function exists
SELECT EXISTS (
  SELECT FROM pg_proc 
  WHERE proname = 'assign_user_role'
);
