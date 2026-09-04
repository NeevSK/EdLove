-- Guardian assessment-read contract (local design; do not apply remotely yet).
--
-- This migration deliberately does not alter the lifecycle foundation or add a
-- guardian policy to public.grade_marks. That table contains sensitive columns;
-- a base-table SELECT policy would expose them all. Reads are exposed only
-- through the authenticated Sanctuary API boundary.

BEGIN;

CREATE TABLE IF NOT EXISTS public.guardian_assessment_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  relationship_id UUID NOT NULL REFERENCES public.student_guardian_relationships(id) ON DELETE CASCADE,
  guardian_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  permission_key TEXT NOT NULL DEFAULT 'assessment_results'
    CHECK (permission_key = 'assessment_results'),
  access_level TEXT NOT NULL DEFAULT 'read'
    CHECK (access_level = 'read'),
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ,
  CONSTRAINT guardian_assessment_permissions_relationship_key
    FOREIGN KEY (student_id, guardian_id)
    REFERENCES public.student_guardian_relationships(student_id, guardian_id)
    ON DELETE CASCADE,
  CONSTRAINT guardian_assessment_permissions_dates_check
    CHECK (revoked_at IS NULL OR revoked_at >= granted_at),
  CONSTRAINT guardian_assessment_permissions_grant_identity_key
    UNIQUE (relationship_id, permission_key, access_level, granted_at)
);

CREATE TABLE IF NOT EXISTS public.guardian_assessment_read_audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guardian_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  outcome TEXT NOT NULL CHECK (outcome IN ('allowed', 'denied')),
  reason TEXT NOT NULL CHECK (
    reason IN (
      'allowed',
      'no_relationship',
      'permission_missing',
      'no_published_results'
    )
  ),
  result_count INTEGER NOT NULL DEFAULT 0 CHECK (result_count >= 0),
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.guardian_assessment_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guardian_assessment_read_audit_events ENABLE ROW LEVEL SECURITY;

-- A guardian may inspect only their own normalized permission rows. There are
-- intentionally no INSERT/UPDATE/DELETE policies; grants are service-managed.
DROP POLICY IF EXISTS guardian_assessment_permissions_self_read ON public.guardian_assessment_permissions;
CREATE POLICY guardian_assessment_permissions_self_read
  ON public.guardian_assessment_permissions
  FOR SELECT TO authenticated
  USING (
    guardian_id = auth.uid()
    AND revoked_at IS NULL
    AND permission_key = 'assessment_results'
    AND access_level = 'read'
    AND EXISTS (
      SELECT 1
      FROM public.student_guardian_relationships sgr
      WHERE sgr.id = guardian_assessment_permissions.relationship_id
        AND sgr.student_id = guardian_assessment_permissions.student_id
        AND sgr.guardian_id = auth.uid()
    )
  );

-- Audit events are server-managed. No authenticated or anonymous table policy
-- or database function is granted for direct client access.
REVOKE ALL ON TABLE public.guardian_assessment_read_audit_events FROM anon, authenticated;

CREATE INDEX IF NOT EXISTS guardian_assessment_permissions_lookup_idx
  ON public.guardian_assessment_permissions (guardian_id, student_id, permission_key, access_level)
  WHERE revoked_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS guardian_assessment_permissions_one_active_idx
  ON public.guardian_assessment_permissions (relationship_id, permission_key, access_level)
  WHERE revoked_at IS NULL;

COMMIT;
