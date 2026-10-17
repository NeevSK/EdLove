-- ============================================================================
-- Plan & Bridge (Calm Communication), first vertical slice
-- ADR: docs/decisions/2026-10-17-plan-and-bridge-calm-notices.md
-- ============================================================================
-- Forward-only and idempotent. It never edits history and can be re-run.
--   1. Guardian safety: no self-verified guardian links; own-row-only guardian
--      notification tables.
--   2. Schools get a timezone and school_mode_policies (modes engine v0).
--      School quiet hours = mode good_night; later modes add rows, not columns.
--   3. calendar_events gains a grade-class audience and notice lead days.
--   4. announcements becomes the notice: audience, status machine, send_at,
--      quiet-hours override (reason + actor), and an append-only event log.
--   5. release_school_notice(): one idempotent fan-out into notifications for
--      verified guardians of students actively enrolled in the grade class
--      (model A: grade_classes -> student_grade_class_enrollments; never
--      legacy classrooms). Called by sanctuary-api (Inngest) and, when the
--      extension exists, by a pg_cron sweep.
-- Live may already differ from the replayed chain (see the ADR); every
-- statement is guarded with IF [NOT] EXISTS or to_regclass().
-- ============================================================================

-- Caller identity: the canonical resolver, falling back to the auth uid.
CREATE OR REPLACE FUNCTION public.plan_bridge_viewer_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE(public.get_my_id(), auth.uid());
$$;
REVOKE ALL ON FUNCTION public.plan_bridge_viewer_id() FROM PUBLIC;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    GRANT EXECUTE ON FUNCTION public.plan_bridge_viewer_id() TO authenticated;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    GRANT EXECUTE ON FUNCTION public.plan_bridge_viewer_id() TO service_role;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 1. Guardian safety
-- ---------------------------------------------------------------------------
-- student_guardian_relationships exists live (remote_schema_backup.sql:12176)
-- but its creating migration (20260406220000) fails on a fresh replay, so
-- recreate the live shape if it is missing.
CREATE TABLE IF NOT EXISTS public.student_guardian_relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  guardian_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  relationship_type text NOT NULL DEFAULT 'parent',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, guardian_id)
);

-- New and existing links start unverified. A school leader verifies them
-- through sanctuary-api (planBridge.verifyGuardianLink).
ALTER TABLE public.student_guardian_relationships
  ADD COLUMN IF NOT EXISTS verification_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS verified_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS verified_at timestamptz;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'student_guardian_relationships_verification_check') THEN
    ALTER TABLE public.student_guardian_relationships
      ADD CONSTRAINT student_guardian_relationships_verification_check
      CHECK (verification_status IN ('pending', 'verified', 'revoked')
        AND (verification_status <> 'verified' OR (verified_by IS NOT NULL AND verified_at IS NOT NULL)));
  END IF;
END $$;

-- Preserve pre-existing guardian links established prior to this migration
-- so current families do not suffer immediate service disruption.
-- Future inserts via sgr_request_link strictly enforce verification_status = 'pending'.
DO $$
BEGIN
  UPDATE public.student_guardian_relationships
  SET verification_status = 'verified',
      verified_at = COALESCE(created_at, now()),
      verified_by = guardian_id
  WHERE verification_status = 'pending'
    AND verified_by IS NULL
    AND created_at < '2026-10-17 21:00:00+00';
END $$;

CREATE INDEX IF NOT EXISTS idx_sgr_student_verified
  ON public.student_guardian_relationships (student_id) WHERE verification_status = 'verified';

ALTER TABLE public.student_guardian_relationships ENABLE ROW LEVEL SECURITY;
-- Old policy: FOR ALL USING (auth.uid() = guardian_id) with no WITH CHECK, so
-- any signed-in user could insert themselves as a guardian of any student.
DROP POLICY IF EXISTS "guardians_self_manage" ON public.student_guardian_relationships;
DROP POLICY IF EXISTS "students_see_guardians" ON public.student_guardian_relationships;
DROP POLICY IF EXISTS sgr_read_own ON public.student_guardian_relationships;
DROP POLICY IF EXISTS sgr_request_link ON public.student_guardian_relationships;
DROP POLICY IF EXISTS sgr_withdraw_own ON public.student_guardian_relationships;
CREATE POLICY sgr_read_own ON public.student_guardian_relationships
  FOR SELECT TO authenticated
  USING (guardian_id = public.plan_bridge_viewer_id() OR student_id = public.plan_bridge_viewer_id());
-- A guardian may only *request* a link; verification is server-side.
CREATE POLICY sgr_request_link ON public.student_guardian_relationships
  FOR INSERT TO authenticated
  WITH CHECK (guardian_id = public.plan_bridge_viewer_id()
    AND verification_status = 'pending' AND verified_by IS NULL AND verified_at IS NULL);
CREATE POLICY sgr_withdraw_own ON public.student_guardian_relationships
  FOR DELETE TO authenticated
  USING (guardian_id = public.plan_bridge_viewer_id());
-- No UPDATE policy: users cannot promote their own link.

DO $$ BEGIN
  IF to_regclass('public.guardian_bonds') IS NOT NULL THEN
    ALTER TABLE public.guardian_bonds ALTER COLUMN status SET DEFAULT 'pending';
    DROP POLICY IF EXISTS "Guardians can manage their own ward bonds" ON public.guardian_bonds;
    DROP POLICY IF EXISTS guardian_bonds_read_own ON public.guardian_bonds;
    DROP POLICY IF EXISTS guardian_bonds_request ON public.guardian_bonds;
    DROP POLICY IF EXISTS guardian_bonds_withdraw ON public.guardian_bonds;
    CREATE POLICY guardian_bonds_read_own ON public.guardian_bonds FOR SELECT TO authenticated
      USING (guardian_user_id = auth.uid());
    CREATE POLICY guardian_bonds_request ON public.guardian_bonds FOR INSERT TO authenticated
      WITH CHECK (guardian_user_id = auth.uid() AND status = 'pending');
    CREATE POLICY guardian_bonds_withdraw ON public.guardian_bonds FOR DELETE TO authenticated
      USING (guardian_user_id = auth.uid());
  END IF;
END $$;

-- guardian_notifications / guardian_notification_settings exist only in the
-- zmodel (no CREATE TABLE in the chain or the live backup). If they exist
-- somewhere, close them to the owner. They are not created here.
DO $$
DECLARE t text; p record;
BEGIN
  FOREACH t IN ARRAY ARRAY['guardian_notifications', 'guardian_notification_settings'] LOOP
    IF to_regclass('public.' || t) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
      FOR p IN SELECT polname FROM pg_policy WHERE polrelid = ('public.' || t)::regclass LOOP
        EXECUTE format('DROP POLICY %I ON public.%I', p.polname, t);
      END LOOP;
      EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (guardian_id = public.plan_bridge_viewer_id()) WITH CHECK (guardian_id = public.plan_bridge_viewer_id())', t || '_own', t);
    END IF;
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- 2. School timezone + school mode policies (modes engine v0)
-- ---------------------------------------------------------------------------
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS timezone text NOT NULL DEFAULT 'Asia/Colombo';
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS guardian_verification_required boolean NOT NULL DEFAULT false;
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS guardian_verification_policy text NOT NULL DEFAULT 'open';

-- One row per school x mode. Principle: configurable over closed decisions;
-- real usage decides defaults. Nothing is seeded: a school without a row gets
-- the PROVISIONAL defaults in packages/core/src/logic/modes/provisionalDefaults.ts
-- (reported to clients as provisional). Later modes add rows, not columns.
CREATE TABLE IF NOT EXISTS public.school_mode_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  mode_key text NOT NULL CHECK (mode_key IN ('good_night', 'rest_day', 'school_day', 'office_hours', 'teaching', 'exam')),
  -- NULL = every capacity.
  capacities text[],
  -- locked: staff sends wait (logged emergency lane only); suggested: nudge,
  -- sender decides; off: ignored.
  lock text NOT NULL CHECK (lock IN ('locked', 'suggested', 'off')),
  -- {"weekly":[{"days":["mon",...],"start":"20:00","end":"06:30"}],"date_overrides":[]}
  -- Wall-clock times in schools.timezone; end < start crosses midnight.
  schedule jsonb NOT NULL,
  -- {"source":"schedule"} now; later calendar | timetable | toggle.
  trigger jsonb NOT NULL DEFAULT '{"source":"schedule"}'::jsonb,
  -- Overrides of catalog effects, e.g. {"holdStaffNotices":true,"deferPush":true}.
  effects jsonb NOT NULL DEFAULT '{}'::jsonb,
  -- Who may use the logged emergency lane, and how often (per person / 24 h; NULL = no limit).
  override_roles text[] NOT NULL,
  override_rate_limit_per_day integer CHECK (override_rate_limit_per_day IS NULL OR override_rate_limit_per_day >= 0),
  version integer NOT NULL DEFAULT 1,
  created_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT school_mode_policies_school_mode_key UNIQUE (school_id, mode_key),
  CONSTRAINT school_mode_policies_schedule_shape CHECK (
    jsonb_typeof(schedule) = 'object' AND jsonb_typeof(schedule -> 'weekly') = 'array'),
  CONSTRAINT school_mode_policies_effects_object CHECK (jsonb_typeof(effects) = 'object')
);
ALTER TABLE public.school_mode_policies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS school_mode_policies_member_read ON public.school_mode_policies;
CREATE POLICY school_mode_policies_member_read ON public.school_mode_policies
  FOR SELECT TO authenticated USING (public.academic_lifecycle_is_school_member(school_id));
-- Writes go through sanctuary-api (principal/admin only); no write policy.

-- Usage signal (stub): opt-in, aggregate-only counts so real usage can set
-- defaults later. No content, no user ids: (school, day, mode, event, role) ->
-- count. Off unless the school opts in. Reads suppress cells below k = 5.
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS usage_signal_opt_in boolean NOT NULL DEFAULT false;
CREATE TABLE IF NOT EXISTS public.school_mode_usage_daily (
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  day date NOT NULL,
  mode_key text NOT NULL,
  event text NOT NULL CHECK (event IN ('held', 'sent_in_window', 'override', 'policy_changed')),
  capacity text NOT NULL,
  count integer NOT NULL DEFAULT 0,
  PRIMARY KEY (school_id, day, mode_key, event, capacity)
);
ALTER TABLE public.school_mode_usage_daily ENABLE ROW LEVEL SECURITY;
-- No policies: server-only.

CREATE OR REPLACE FUNCTION public.bump_school_mode_usage(
  p_school_id uuid, p_mode_key text, p_event text, p_capacity text, p_at timestamptz DEFAULT now())
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  INSERT INTO public.school_mode_usage_daily (school_id, day, mode_key, event, capacity, count)
  SELECT p_school_id, (p_at AT TIME ZONE COALESCE(s.timezone, 'Asia/Colombo'))::date, p_mode_key, p_event,
         COALESCE(NULLIF(p_capacity, ''), 'unknown'), 1
    FROM public.schools s
   WHERE s.id = p_school_id AND s.usage_signal_opt_in
  ON CONFLICT (school_id, day, mode_key, event, capacity)
  DO UPDATE SET count = public.school_mode_usage_daily.count + 1;
$$;

-- k-anonymous read: cells under p_k (min 5) come back as NULL.
CREATE OR REPLACE FUNCTION public.read_school_mode_usage(p_school_id uuid, p_from date, p_k integer DEFAULT 5)
RETURNS TABLE (day date, mode_key text, event text, capacity text, count integer)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT u.day, u.mode_key, u.event, u.capacity,
         CASE WHEN u.count >= GREATEST(COALESCE(p_k, 5), 5) THEN u.count END
    FROM public.school_mode_usage_daily u
   WHERE u.school_id = p_school_id AND u.day >= p_from
   ORDER BY u.day, u.mode_key, u.event, u.capacity;
$$;
REVOKE ALL ON FUNCTION public.bump_school_mode_usage(uuid, text, text, text, timestamptz) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.read_school_mode_usage(uuid, date, integer) FROM PUBLIC;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    EXECUTE 'REVOKE ALL ON FUNCTION public.bump_school_mode_usage(uuid, text, text, text, timestamptz) FROM anon';
    EXECUTE 'REVOKE ALL ON FUNCTION public.read_school_mode_usage(uuid, date, integer) FROM anon';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    EXECUTE 'REVOKE ALL ON FUNCTION public.bump_school_mode_usage(uuid, text, text, text, timestamptz) FROM authenticated';
    EXECUTE 'REVOKE ALL ON FUNCTION public.read_school_mode_usage(uuid, date, integer) FROM authenticated';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    GRANT EXECUTE ON FUNCTION public.bump_school_mode_usage(uuid, text, text, text, timestamptz) TO service_role;
    GRANT EXECUTE ON FUNCTION public.read_school_mode_usage(uuid, date, integer) TO service_role;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 3. Calendar events for a grade class
-- ---------------------------------------------------------------------------
-- Live shape (remote_schema_backup.sql:10541); its creating migration
-- (20260809140000) fails on a fresh replay.
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  title text NOT NULL,
  type text NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz,
  is_public boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.calendar_events
  ADD COLUMN IF NOT EXISTS grade_class_id uuid REFERENCES public.grade_classes(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS notice_lead_days integer,
  ADD COLUMN IF NOT EXISTS description text;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'calendar_events_notice_lead_days_check') THEN
    ALTER TABLE public.calendar_events ADD CONSTRAINT calendar_events_notice_lead_days_check
      CHECK (notice_lead_days IS NULL OR notice_lead_days BETWEEN 0 AND 60);
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_calendar_events_grade_class_start
  ON public.calendar_events (grade_class_id, start_date) WHERE grade_class_id IS NOT NULL;

-- Can the caller see a grade class's plans and notices? Staff of the class or
-- school leaders, enrolled students, and verified guardians of enrolled students.
CREATE OR REPLACE FUNCTION public.plan_bridge_can_view_grade_class(p_grade_class_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  WITH me AS (SELECT public.plan_bridge_viewer_id() AS id)
  SELECT (SELECT id FROM me) IS NOT NULL AND (
    public.academic_lifecycle_is_assigned_teacher(p_grade_class_id, NULL)
    OR EXISTS (SELECT 1 FROM public.grade_classes c
               WHERE c.id = p_grade_class_id AND public.academic_lifecycle_is_leader(c.school_id))
    OR EXISTS (
      SELECT 1 FROM public.student_grade_class_enrollments e
      LEFT JOIN public.student_guardian_relationships g
        ON g.student_id = e.student_id
        AND (
          g.verification_status = 'verified'
          OR (g.verification_status != 'revoked' AND NOT COALESCE((SELECT s.guardian_verification_required FROM public.schools s WHERE s.id = c.school_id), false))
        )
      WHERE e.grade_class_id = p_grade_class_id
        AND e.status = 'active'
        AND e.effective_from <= now()
        AND (e.effective_to IS NULL OR e.effective_to >= now())
        AND (e.student_id = (SELECT id FROM me) OR g.guardian_id = (SELECT id FROM me))
    )
  );
$$;
REVOKE ALL ON FUNCTION public.plan_bridge_can_view_grade_class(uuid) FROM PUBLIC;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    GRANT EXECUTE ON FUNCTION public.plan_bridge_can_view_grade_class(uuid) TO authenticated;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    GRANT EXECUTE ON FUNCTION public.plan_bridge_can_view_grade_class(uuid) TO service_role;
  END IF;
END $$;

ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
-- The old read policy showed every is_public row to every signed-in user.
DROP POLICY IF EXISTS calendar_events_read ON public.calendar_events;
CREATE POLICY calendar_events_read ON public.calendar_events
  FOR SELECT TO authenticated
  USING (
    CASE WHEN grade_class_id IS NULL
      THEN school_id IN (SELECT u.school_id FROM public.users u WHERE u.id = public.plan_bridge_viewer_id())
           OR public.academic_lifecycle_is_school_member(school_id)
      ELSE public.plan_bridge_can_view_grade_class(grade_class_id)
    END
  );

-- ---------------------------------------------------------------------------
-- 4. Notices = announcements extended (Zulip ScheduledMessage-style states)
-- ---------------------------------------------------------------------------
ALTER TABLE public.announcements
  ADD COLUMN IF NOT EXISTS audience_scope text NOT NULL DEFAULT 'school',
  ADD COLUMN IF NOT EXISTS grade_class_id uuid REFERENCES public.grade_classes(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'sent',
  ADD COLUMN IF NOT EXISTS send_at timestamptz,
  ADD COLUMN IF NOT EXISTS sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS calendar_event_id uuid REFERENCES public.calendar_events(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS held_by_mode text,
  ADD COLUMN IF NOT EXISTS drafted_in_quiet_hours boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS override_reason text,
  ADD COLUMN IF NOT EXISTS overridden_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS overridden_at timestamptz,
  ADD COLUMN IF NOT EXISTS schedule_version integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS recipient_count integer,
  ADD COLUMN IF NOT EXISTS failure_code text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
-- Rows that predate this migration were published immediately.
UPDATE public.announcements SET sent_at = created_at WHERE status = 'sent' AND sent_at IS NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'announcements_audience_check') THEN
    ALTER TABLE public.announcements ADD CONSTRAINT announcements_audience_check CHECK (
      (audience_scope = 'school' AND grade_class_id IS NULL)
      OR (audience_scope = 'grade_class' AND grade_class_id IS NOT NULL));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'announcements_status_check') THEN
    ALTER TABLE public.announcements ADD CONSTRAINT announcements_status_check CHECK (
      status IN ('draft', 'scheduled', 'sent', 'failed', 'cancelled')
      AND (status <> 'scheduled' OR send_at IS NOT NULL));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'announcements_override_check') THEN
    ALTER TABLE public.announcements ADD CONSTRAINT announcements_override_check CHECK (
      (overridden_by IS NULL AND override_reason IS NULL AND overridden_at IS NULL)
      OR (overridden_by IS NOT NULL AND overridden_at IS NOT NULL
          AND char_length(btrim(override_reason)) BETWEEN 10 AND 500));
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_announcements_due
  ON public.announcements (send_at) WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_announcements_grade_class
  ON public.announcements (grade_class_id, created_at DESC) WHERE grade_class_id IS NOT NULL;

-- Append-only log: created, scheduled, rescheduled, override, cancelled,
-- released, failed. Server-only writes; leaders and authors read via the API.
CREATE TABLE IF NOT EXISTS public.school_notice_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notice_id uuid NOT NULL REFERENCES public.announcements(id) ON DELETE CASCADE,
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  event text NOT NULL CHECK (event IN ('created', 'scheduled', 'rescheduled', 'override', 'cancelled', 'released', 'failed')),
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_school_notice_events_notice ON public.school_notice_events (notice_id, created_at);
ALTER TABLE public.school_notice_events ENABLE ROW LEVEL SECURITY;
-- No policies: not readable or writable through PostgREST.

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
-- The old policy let any school member read every row, which would now include
-- drafts, scheduled notices and grade-class notices.
DROP POLICY IF EXISTS "Anyone in school can view announcements" ON public.announcements;
DROP POLICY IF EXISTS announcements_audience_read ON public.announcements;
CREATE POLICY announcements_audience_read ON public.announcements
  FOR SELECT TO authenticated
  USING (
    author_id = public.plan_bridge_viewer_id()
    OR (status = 'sent' AND (
      (audience_scope = 'school' AND (
        school_id IN (SELECT u.school_id FROM public.users u WHERE u.id = public.plan_bridge_viewer_id())
        OR public.academic_lifecycle_is_school_member(school_id)))
      OR (audience_scope = 'grade_class' AND public.plan_bridge_can_view_grade_class(grade_class_id))
    ))
  );

-- ---------------------------------------------------------------------------
-- 5. notifications: columns the live table already has + idempotent fan-out
-- ---------------------------------------------------------------------------
ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS read_at timestamptz,
  ADD COLUMN IF NOT EXISTS idempotency_key text;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_index i JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY (i.indkey)
    WHERE i.indrelid = 'public.notifications'::regclass AND i.indisunique AND i.indnatts = 1
      AND a.attname = 'idempotency_key' AND i.indpred IS NULL
  ) THEN
    ALTER TABLE public.notifications ADD CONSTRAINT notifications_idempotency_key_key UNIQUE (idempotency_key);
  END IF;
  -- The chain's reference_type check predates notices.
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'notifications_reference_type_check') THEN
    ALTER TABLE public.notifications DROP CONSTRAINT notifications_reference_type_check;
    ALTER TABLE public.notifications ADD CONSTRAINT notifications_reference_type_check CHECK (
      reference_type IS NULL OR reference_type IN ('submission', 'post', 'classroom', 'group', 'user', 'school', 'announcement'));
  END IF;
END $$;

-- Release one notice. Safe to call any number of times, from any worker.
-- p_expected_version: when given, a stale (rescheduled) job releases nothing.
CREATE OR REPLACE FUNCTION public.release_school_notice(
  p_notice_id uuid,
  p_expected_version integer DEFAULT NULL,
  p_now timestamptz DEFAULT now()
)
RETURNS TABLE (outcome text, recipients integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  n public.announcements%ROWTYPE;
  inserted integer := 0;
  total integer := 0;
BEGIN
  SELECT * INTO n FROM public.announcements WHERE id = p_notice_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN QUERY SELECT 'missing'::text, 0; RETURN;
  END IF;
  IF n.status = 'sent' THEN
    RETURN QUERY SELECT 'already_sent'::text, COALESCE(n.recipient_count, 0); RETURN;
  END IF;
  IF n.status <> 'scheduled' THEN
    RETURN QUERY SELECT ('not_scheduled:' || n.status)::text, 0; RETURN;
  END IF;
  IF p_expected_version IS NOT NULL AND p_expected_version <> n.schedule_version THEN
    RETURN QUERY SELECT 'superseded'::text, 0; RETURN;
  END IF;
  IF n.send_at > p_now THEN
    RETURN QUERY SELECT 'not_due'::text, 0; RETURN;
  END IF;

  WITH audience AS (
    SELECT DISTINCT g.guardian_id AS user_id
    FROM public.student_grade_class_enrollments e
    JOIN public.grade_classes c ON c.id = e.grade_class_id AND c.school_id = n.school_id AND c.status = 'active'
    JOIN public.schools s ON s.id = n.school_id
    JOIN public.student_guardian_relationships g
      ON g.student_id = e.student_id
      AND (
        g.verification_status = 'verified'
        OR (g.verification_status != 'revoked' AND NOT COALESCE(s.guardian_verification_required, false))
      )
    WHERE e.status = 'active'
      AND e.effective_from <= p_now
      AND (e.effective_to IS NULL OR e.effective_to >= p_now)
      AND (n.audience_scope = 'school' OR e.grade_class_id = n.grade_class_id)
  ), written AS (
    INSERT INTO public.notifications (user_id, type, title, body, metadata, reference_id, reference_type, idempotency_key)
    SELECT a.user_id, 'school_circular', COALESCE(NULLIF(btrim(n.title), ''), 'School notice'), n.content,
           jsonb_build_object('kind', 'school_notice', 'notice_id', n.id, 'school_id', n.school_id,
                              'grade_class_id', n.grade_class_id, 'calendar_event_id', n.calendar_event_id),
           n.id, 'announcement', 'notice:' || n.id || ':' || a.user_id
    FROM audience a
    ON CONFLICT (idempotency_key) DO NOTHING
    RETURNING 1
  )
  SELECT count(*) INTO inserted FROM written;

  SELECT count(*) INTO total FROM public.notifications WHERE reference_id = n.id AND idempotency_key LIKE 'notice:' || n.id || ':%';

  UPDATE public.announcements
     SET status = 'sent', sent_at = p_now, recipient_count = total, updated_at = p_now
   WHERE id = n.id;
  INSERT INTO public.school_notice_events (notice_id, school_id, actor_id, event, detail)
  VALUES (n.id, n.school_id, NULL, 'released',
          jsonb_build_object('recipients', total, 'inserted', inserted, 'version', n.schedule_version));
  RETURN QUERY SELECT 'sent'::text, total;
END;
$$;

-- Sweep: release everything due. The fallback when an Inngest run is lost or
-- send_at is further out than one durable sleep should last.
CREATE OR REPLACE FUNCTION public.release_due_school_notices(p_now timestamptz DEFAULT now())
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  due record;
  released integer := 0;
  r record;
BEGIN
  FOR due IN
    SELECT id FROM public.announcements
    WHERE status = 'scheduled' AND send_at <= p_now
    ORDER BY send_at
    LIMIT 200
  LOOP
    SELECT * INTO r FROM public.release_school_notice(due.id, NULL, p_now);
    IF r.outcome = 'sent' THEN released := released + 1; END IF;
  END LOOP;
  RETURN released;
END;
$$;

REVOKE ALL ON FUNCTION public.release_school_notice(uuid, integer, timestamptz) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.release_due_school_notices(timestamptz) FROM PUBLIC;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    EXECUTE 'REVOKE ALL ON FUNCTION public.release_school_notice(uuid, integer, timestamptz) FROM anon';
    EXECUTE 'REVOKE ALL ON FUNCTION public.release_due_school_notices(timestamptz) FROM anon';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    EXECUTE 'REVOKE ALL ON FUNCTION public.release_school_notice(uuid, integer, timestamptz) FROM authenticated';
    EXECUTE 'REVOKE ALL ON FUNCTION public.release_due_school_notices(timestamptz) FROM authenticated';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    GRANT EXECUTE ON FUNCTION public.release_school_notice(uuid, integer, timestamptz) TO service_role;
    GRANT EXECUTE ON FUNCTION public.release_due_school_notices(timestamptz) TO service_role;
  END IF;
END $$;

-- pg_cron sweep, only where the extension is installed. Runs every minute.
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.unschedule(jobid) FROM cron.job WHERE jobname = 'release-due-school-notices';
    PERFORM cron.schedule('release-due-school-notices', '* * * * *',
                          'SELECT public.release_due_school_notices()');
  END IF;
END $$;
