-- Fix Account Deletion: RPC and FK adjustments
-- This migration implements delete_user_account and ensures common blockers don't prevent deletion.

-- 1. Adjust FKs to SET NULL where they shouldn't block user deletion
-- These are reference fields that should persist even if the user is gone.

ALTER TABLE IF EXISTS public.library_resources 
  DROP CONSTRAINT IF EXISTS library_resources_verified_by_fkey,
  ADD CONSTRAINT library_resources_verified_by_fkey 
  FOREIGN KEY (verified_by) REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE IF EXISTS public.gift_codes 
  DROP CONSTRAINT IF EXISTS gift_codes_redeemed_by_fkey,
  ADD CONSTRAINT gift_codes_redeemed_by_fkey 
  FOREIGN KEY (redeemed_by) REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE IF EXISTS public.thuthimal_gifts 
  DROP CONSTRAINT IF EXISTS thuthimal_gifts_recipient_id_fkey,
  ADD CONSTRAINT thuthimal_gifts_recipient_id_fkey 
  FOREIGN KEY (recipient_id) REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE IF EXISTS public.staff_leaves 
  DROP CONSTRAINT IF EXISTS staff_leaves_reviewed_by_fkey,
  ADD CONSTRAINT staff_leaves_reviewed_by_fkey 
  FOREIGN KEY (reviewed_by) REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE IF EXISTS public.institutional_calendar 
  DROP CONSTRAINT IF EXISTS institutional_calendar_created_by_fkey,
  ADD CONSTRAINT institutional_calendar_created_by_fkey 
  FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE IF EXISTS public.audit_log 
  DROP CONSTRAINT IF EXISTS audit_log_actor_id_fkey,
  ADD CONSTRAINT audit_log_actor_id_fkey 
  FOREIGN KEY (actor_id) REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE IF EXISTS public.audit_log 
  DROP CONSTRAINT IF EXISTS audit_log_target_user_id_fkey,
  ADD CONSTRAINT audit_log_target_user_id_fkey 
  FOREIGN KEY (target_user_id) REFERENCES public.users(id) ON DELETE SET NULL;

-- 2. Implement the delete_user_account RPC
-- This function deletes the user from auth.users, which cascades to public.users.
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Get the current user ID
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Deleting from auth.users will trigger ON DELETE CASCADE to public.users
  -- and other tables linked to public.users(id)
  DELETE FROM auth.users WHERE id = v_user_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;
