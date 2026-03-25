ALTER TABLE IF EXISTS public.schools
ADD COLUMN IF NOT EXISTS tenant_kind TEXT NOT NULL DEFAULT 'customer'
CHECK (tenant_kind IN ('internal', 'customer', 'demo', 'sandbox'));

ALTER TABLE IF EXISTS public.users
ADD COLUMN IF NOT EXISTS platform_roles TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

ALTER TABLE IF EXISTS public.users
ADD COLUMN IF NOT EXISTS school_role TEXT;

ALTER TABLE IF EXISTS public.users
ADD COLUMN IF NOT EXISTS work_roles TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

UPDATE public.users
SET platform_roles = ARRAY[
  CASE role
    WHEN 'founder' THEN 'founder'
    WHEN 'admin' THEN 'platform_admin'
    WHEN 'developer' THEN 'developer'
    ELSE NULL
  END
]::TEXT[]
WHERE role IN ('founder', 'admin', 'developer')
  AND COALESCE(array_length(platform_roles, 1), 0) = 0;

UPDATE public.users
SET school_role = role
WHERE role IN ('principal', 'section_head', 'grade_head', 'teacher', 'student')
  AND school_role IS NULL;

UPDATE public.users
SET work_roles = ARRAY['teacher']::TEXT[]
WHERE role = 'teacher'
  AND COALESCE(array_length(work_roles, 1), 0) = 0;
