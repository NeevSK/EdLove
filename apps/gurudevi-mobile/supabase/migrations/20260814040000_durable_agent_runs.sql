-- Canonical durable-agent state for Sanctuary-owned review workflows.
-- This deliberately does not overload public.audit_logs: that object is a
-- read-only compatibility view over audit.logs with a different schema.

CREATE TABLE IF NOT EXISTS public.durable_agent_runs (
  id UUID PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  run_type TEXT NOT NULL CHECK (run_type IN ('student_support_snapshot', 'teacher_summary_draft')),
  mode TEXT NOT NULL CHECK (mode IN ('demo', 'live')),
  classroom_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  teacher_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  requested_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  scenario TEXT,
  request_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'completed', 'failed')),
  summary_draft TEXT,
  evidence JSONB,
  governor JSONB,
  error TEXT,
  promoted_teacher_note_id UUID,
  promotion_mode TEXT,
  promoted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  idempotency_key TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS public.durable_agent_run_events (
  id UUID PRIMARY KEY,
  run_id UUID NOT NULL REFERENCES public.durable_agent_runs(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  idempotency_key TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS durable_agent_runs_school_updated_idx
  ON public.durable_agent_runs (school_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS durable_agent_run_events_run_created_idx
  ON public.durable_agent_run_events (run_id, created_at ASC);

ALTER TABLE public.durable_agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.durable_agent_run_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS durable_agent_runs_school_read ON public.durable_agent_runs;
CREATE POLICY durable_agent_runs_school_read
  ON public.durable_agent_runs FOR SELECT TO authenticated
  USING (
    school_id = (SELECT school_id FROM public.users WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS durable_agent_run_events_school_read ON public.durable_agent_run_events;
CREATE POLICY durable_agent_run_events_school_read
  ON public.durable_agent_run_events FOR SELECT TO authenticated
  USING (
    school_id = (SELECT school_id FROM public.users WHERE id = auth.uid())
  );

GRANT SELECT ON public.durable_agent_runs, public.durable_agent_run_events TO authenticated;
