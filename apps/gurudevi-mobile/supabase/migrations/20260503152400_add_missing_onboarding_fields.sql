-- Migration: Add missing onboarding fields to users table
-- Created at: 2026-05-03 15:24

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS school_id uuid REFERENCES public.schools(id),
ADD COLUMN IF NOT EXISTS profile_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS school_role text,
ADD COLUMN IF NOT EXISTS work_roles text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS tenant_kind text;

-- Backfill profile_completed for existing users who have onboarding_completed
UPDATE public.users SET profile_completed = true WHERE onboarding_completed = true AND profile_completed IS NULL;
