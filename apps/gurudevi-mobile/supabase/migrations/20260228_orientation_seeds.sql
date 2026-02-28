-- ============================================================
-- Orientation Seeds — Individual Difference Layer
--
-- Stores a silent, private fingerprint of how the user
-- orients towards learning, energy, and engagement.
--
-- PHILOSOPHY:
-- This is NOT a personality test result.  It is a lightweight
-- vector of tendencies seeded at onboarding (via situational
-- picture-cards) and updated continuously from behavioral
-- signals (mood timing, content engagement, energy patterns).
--
-- We deliberately avoid MBTI/Enneagram labels in the data
-- model.  The four dimensions are descriptive and
-- education-grounded:
--
--   depth_breadth      0–100  (deep focus ↔ wide exploration)
--   reflect_act        0–100  (reflect first ↔ act first)
--   solo_social        0–100  (solo processing ↔ social energy)
--   steady_surge       0–100  (steady rhythm ↔ burst energy)
--
-- All values are nullable — seeds only exist after the user
-- has completed the optional orientation step.
-- ============================================================

ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS orientation_seeds JSONB DEFAULT NULL;

COMMENT ON COLUMN public.users.orientation_seeds IS
    'Private learning-orientation fingerprint. '
    'Keys: depth_breadth (0-100), reflect_act (0-100), '
    'solo_social (0-100), steady_surge (0-100). '
    'Updated by onboarding and behavioral inference. '
    'Never surfaced as a type label to the user.';
