-- Migration: Add missing phone and metadata fields to public.users table
-- Created at: 2026-05-22 12:00:00 UTC

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS metadata jsonb;
