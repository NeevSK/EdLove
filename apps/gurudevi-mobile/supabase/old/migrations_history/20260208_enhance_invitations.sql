-- Migration: Enhance invitations table
-- Date: 2026-02-08
-- Purpose: Add invitation text, limits, and tracking

-- Add invitation enhancement fields
ALTER TABLE invitations
  ADD COLUMN IF NOT EXISTS invitation_text TEXT,
  ADD COLUMN IF NOT EXISTS max_uses INTEGER DEFAULT 5,
  ADD COLUMN IF NOT EXISTS uses_count INTEGER DEFAULT 0;

-- Add invitation tracking to users
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS invitations_remaining INTEGER DEFAULT 5,
  ADD COLUMN IF NOT EXISTS invitations_sent INTEGER DEFAULT 0;

-- Add indices
CREATE INDEX IF NOT EXISTS idx_invitations_uses ON invitations(uses_count, max_uses);
CREATE INDEX IF NOT EXISTS idx_users_invitations ON users(invitations_remaining);

-- Comments
COMMENT ON COLUMN invitations.invitation_text IS 'Auto-generated contextual text (e.g., "Join Royal College")';
COMMENT ON COLUMN invitations.max_uses IS 'Maximum number of times invitation can be used';
COMMENT ON COLUMN invitations.uses_count IS 'Current number of times invitation has been used';
COMMENT ON COLUMN users.invitations_remaining IS 'Number of invitations user can still send';
COMMENT ON COLUMN users.invitations_sent IS 'Total invitations sent by user';
