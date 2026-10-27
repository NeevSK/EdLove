BEGIN;
-- Profile facets describe a person; they do not issue a global account role.
DROP TRIGGER IF EXISTS tr_sync_role_teacher ON public.teacher_profiles;
DROP TRIGGER IF EXISTS tr_sync_role_student ON public.student_profiles;
DROP TRIGGER IF EXISTS tr_sync_role_principal ON public.principal_profiles;
DROP FUNCTION IF EXISTS public.fn_sync_user_role_from_facets();
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS capacity_label text;
ALTER TABLE public.user_preferences ADD COLUMN IF NOT EXISTS notification_settings jsonb;
COMMIT;
