-- Migration: Add Thuthimal (Gratitude Economy) Fields
-- Purpose: Enable Pro subscription gifting system
-- Date: 2026-02-08

-- Add Pro and Thuthimal fields to users table
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS is_pro BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_thuthimal BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS thuthimal_gifter TEXT,
  ADD COLUMN IF NOT EXISTS thuthimal_gifted_at TIMESTAMPTZ;

-- Create index for querying Thuthimal users
CREATE INDEX IF NOT EXISTS idx_users_thuthimal ON users(is_thuthimal, is_pro) WHERE is_thuthimal = true;

-- Add comment explaining the fields
COMMENT ON COLUMN users.is_pro IS 'Whether user has Pro subscription (paid or gifted)';
COMMENT ON COLUMN users.is_thuthimal IS 'Whether Pro subscription is a Thuthimal (තුතිමල්) gift';
COMMENT ON COLUMN users.thuthimal_gifter IS 'Name of person/organization who gifted the subscription (can be "Anonymous")';
COMMENT ON COLUMN users.thuthimal_gifted_at IS 'When the Thuthimal gift was given';

-- Update existing Pro users (if any) to have the flag
UPDATE users SET is_pro = true WHERE is_pro IS NULL;

-- Example: Manually gift Thuthimal to a teacher (for Alpha testing)
-- UPDATE users 
-- SET 
--   is_pro = true,
--   is_thuthimal = true,
--   thuthimal_gifter = 'Past Students Association',
--   thuthimal_gifted_at = NOW()
-- WHERE email = 'teacher@example.com';
