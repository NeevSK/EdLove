-- Migration: Add onboarding fields to users table
-- Date: 2026-02-08
-- Purpose: Track onboarding completion for new user flow

-- Add onboarding fields to users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_onboarding ON users(onboarding_completed);

-- Comment on columns
COMMENT ON COLUMN users.onboarding_completed IS 'Flag indicating if user has completed onboarding flow';
COMMENT ON COLUMN users.onboarding_completed_at IS 'Timestamp when onboarding was completed';
