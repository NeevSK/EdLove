-- Public marketing-site stats (curated, non-sensitive)
-- Purpose: allow gurudevi-marketingWeb to display live numbers while keeping edit access restricted.

BEGIN;

CREATE TABLE IF NOT EXISTS public.public_site_stats (
  id                      INTEGER PRIMARY KEY DEFAULT 1,
  teachers_count          BIGINT NOT NULL DEFAULT 0,
  students_count          BIGINT NOT NULL DEFAULT 0,
  schools_count           BIGINT NOT NULL DEFAULT 0,
  lessons_shared_count    BIGINT NOT NULL DEFAULT 0,

  -- Optional deltas (for later “increase/decrease” UI)
  teachers_delta_30d      INTEGER,
  students_delta_30d      INTEGER,
  schools_delta_30d       INTEGER,
  lessons_shared_delta_30d INTEGER,

  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT public_site_stats_singleton CHECK (id = 1)
);

-- Ensure the singleton row exists (editable in Supabase dashboard).
INSERT INTO public.public_site_stats (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- Keep updated_at fresh on update (helper exists in baseline).
DROP TRIGGER IF EXISTS update_public_site_stats_updated_at ON public.public_site_stats;
CREATE TRIGGER update_public_site_stats_updated_at
BEFORE UPDATE ON public.public_site_stats
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.public_site_stats ENABLE ROW LEVEL SECURITY;

-- Anonymous read-only access for the marketing site.
DROP POLICY IF EXISTS "Public can read marketing stats" ON public.public_site_stats;
CREATE POLICY "Public can read marketing stats"
ON public.public_site_stats
FOR SELECT
TO anon
USING (true);

COMMIT;

