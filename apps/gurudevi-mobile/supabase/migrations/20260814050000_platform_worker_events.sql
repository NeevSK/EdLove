-- Server-owned event outcomes for non-durable-agent background handlers.
CREATE TABLE IF NOT EXISTS public.platform_worker_events (
  id UUID PRIMARY KEY,
  event_name TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
  correlation_id TEXT,
  causation_id TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  idempotency_key TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'failed')),
  error TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_worker_events
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'completed';
ALTER TABLE public.platform_worker_events
  ADD COLUMN IF NOT EXISTS error TEXT;
ALTER TABLE public.platform_worker_events
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'platform_worker_events_status_check'
      AND conrelid = 'public.platform_worker_events'::regclass
  ) THEN
    ALTER TABLE public.platform_worker_events
      ADD CONSTRAINT platform_worker_events_status_check
      CHECK (status IN ('completed', 'failed'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS platform_worker_events_school_created_idx
  ON public.platform_worker_events (school_id, created_at DESC);
CREATE INDEX IF NOT EXISTS platform_worker_events_status_updated_idx
  ON public.platform_worker_events (status, updated_at DESC);

ALTER TABLE public.platform_worker_events ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.platform_worker_events TO authenticated;
