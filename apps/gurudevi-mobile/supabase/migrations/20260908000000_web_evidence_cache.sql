-- 20260908000000_web_evidence_cache.sql
-- TinyFish sovereign proxy: query-hash cache with TTL by freshness window

CREATE TABLE IF NOT EXISTS public.web_evidence_cache (
  query_hash char(64) NOT NULL PRIMARY KEY,
  query_norm text NOT NULL,
  freshness_window text NOT NULL CHECK (freshness_window IN ('day', 'week', 'any')),
  response jsonb NOT NULL,
  fetched_md jsonb NOT NULL,
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  privacy_mode text NOT NULL CHECK (privacy_mode IN ('saved', 'temporary', 'incognito')),
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  last_accessed_at timestamptz NOT NULL DEFAULT now(),
  access_count int NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_web_evidence_cache_expires ON public.web_evidence_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_web_evidence_cache_school ON public.web_evidence_cache(school_id);
CREATE INDEX IF NOT EXISTS idx_web_evidence_cache_freshness ON public.web_evidence_cache(freshness_window);

ALTER TABLE public.web_evidence_cache ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'web_evidence_cache' AND policyname = 'service_role_all'
  ) THEN
    CREATE POLICY "service_role_all" ON public.web_evidence_cache
      FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.cleanup_web_evidence_cache()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  DELETE FROM public.web_evidence_cache
  WHERE expires_at < now();
END;
$$;

CREATE OR REPLACE FUNCTION public.evict_web_evidence_cache_lru(max_bytes bigint DEFAULT 104857600)
RETURNS int LANGUAGE plpgsql AS $$
DECLARE
  deleted_count int := 0;
BEGIN
  DELETE FROM public.web_evidence_cache
  WHERE query_hash IN (
    SELECT query_hash FROM public.web_evidence_cache
    ORDER BY last_accessed_at ASC
    LIMIT 10000
  )
  AND (SELECT pg_total_relation_size('public.web_evidence_cache')) > max_bytes;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;
