-- Migration: Add thuthimal_gifts table for one-time Pro gift QR tokens
-- Thuthimal (තුතිමල් — Flower of Gratitude) gift economy feature
-- See: apps/gurudevi-mobile/docs/Support/THUTHIMAL_README.md

CREATE TABLE IF NOT EXISTS thuthimal_gifts (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- One-time token encoded in QR payload — UUID for unguessability
  gift_token     UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  gifter_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  gifter_name    TEXT NOT NULL,
  -- Intended recipient role: only teachers and principals can receive Pro gifts
  recipient_role TEXT NOT NULL CHECK (recipient_role IN ('teacher', 'principal')),
  -- Set when claimed
  recipient_id   UUID REFERENCES users(id),
  claimed        BOOLEAN NOT NULL DEFAULT false,
  claimed_at     TIMESTAMPTZ,
  -- Optional expiry (null = never expires)
  expires_at     TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS policies
ALTER TABLE thuthimal_gifts ENABLE ROW LEVEL SECURITY;

-- Gifter can see their own gift history
CREATE POLICY "gifter_reads_own_gifts"
  ON thuthimal_gifts FOR SELECT
  USING (gifter_id = auth.uid());

-- Anyone can read an unclaimed gift (needed to display gifter_name before claiming)
CREATE POLICY "anyone_reads_unclaimed"
  ON thuthimal_gifts FOR SELECT
  USING (claimed = false);

-- Gifters can create gifts (authenticated only)
CREATE POLICY "gifter_creates_gift"
  ON thuthimal_gifts FOR INSERT
  WITH CHECK (gifter_id = auth.uid());

-- ── Secure claim function ─────────────────────────────────────────────────────
-- Uses FOR UPDATE row lock to prevent double-claim race conditions.
-- Runs as SECURITY DEFINER to update the users table directly.
CREATE OR REPLACE FUNCTION claim_thuthimal_gift(
  p_token      UUID,
  p_recipient  UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_gift thuthimal_gifts;
BEGIN
  -- Lock the row to prevent concurrent claims of the same token
  SELECT * INTO v_gift
  FROM thuthimal_gifts
  WHERE gift_token = p_token
    AND claimed = false
    AND (expires_at IS NULL OR expires_at > now())
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'already_claimed_or_invalid'
    );
  END IF;

  -- Mark gift as claimed
  UPDATE thuthimal_gifts
  SET
    claimed      = true,
    claimed_at   = now(),
    recipient_id = p_recipient
  WHERE id = v_gift.id;

  -- Upgrade recipient to Pro with Thuthimal attribution
  UPDATE users
  SET
    is_pro             = true,
    is_thuthimal       = true,
    thuthimal_gifter   = v_gift.gifter_name,
    thuthimal_gifted_at = now()
  WHERE id = p_recipient;

  RETURN jsonb_build_object(
    'success',      true,
    'gifter_name',  v_gift.gifter_name
  );
END;
$$;

-- Index for fast token lookups (frequent in claim flow)
CREATE INDEX IF NOT EXISTS idx_thuthimal_gifts_token
  ON thuthimal_gifts(gift_token)
  WHERE claimed = false;
