BEGIN;

-- Invite codes are authority-bearing credentials. Keep their role vocabulary
-- aligned with bond capacities and make retries addressable.
ALTER TABLE public.invite_codes
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT;

ALTER TABLE public.invite_codes
  DROP CONSTRAINT IF EXISTS invite_codes_role_check;

ALTER TABLE public.invite_codes
  ADD CONSTRAINT invite_codes_role_check
  CHECK (role IN (
    'teacher',
    'student',
    'principal',
    'grade_head',
    'section_head',
    'assistant_principal'
  ));

CREATE UNIQUE INDEX IF NOT EXISTS invite_codes_school_creator_idempotency_key
  ON public.invite_codes (school_id, created_by, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE OR REPLACE FUNCTION public.create_school_invite_code(
  p_school_id UUID,
  p_role TEXT,
  p_created_by UUID,
  p_idempotency_key TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  normalized_role TEXT := lower(trim(p_role));
  existing_code public.invite_codes%ROWTYPE;
  created_code public.invite_codes%ROWTYPE;
  candidate TEXT;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_created_by THEN
    RAISE EXCEPTION 'Authenticated user does not match invite creator';
  END IF;

  IF normalized_role NOT IN (
    'teacher', 'student', 'principal', 'grade_head', 'section_head',
    'assistant_principal'
  ) THEN
    RAISE EXCEPTION 'Unsupported school invite role';
  END IF;

  IF NOT (
    public.has_capacity_in_school('principal', p_school_id)
    OR public.has_capacity_in_school('section_head', p_school_id)
    OR public.has_capacity('admin', 'GLOBAL')
  ) THEN
    RAISE EXCEPTION 'Only school leaders or platform administrators may create invites';
  END IF;

  IF p_idempotency_key IS NOT NULL THEN
    SELECT * INTO existing_code
    FROM public.invite_codes
    WHERE school_id = p_school_id
      AND created_by = p_created_by
      AND idempotency_key = p_idempotency_key
    FOR UPDATE;

    IF FOUND THEN
      RETURN to_jsonb(existing_code);
    END IF;
  END IF;

  LOOP
    candidate := 'GURU-' || upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 6)) ||
      CASE WHEN normalized_role = 'teacher' THEN '-TEACH' ELSE '-ADMIN' END;
    BEGIN
      INSERT INTO public.invite_codes (
        school_id, code, role, created_by, idempotency_key, is_active
      )
      VALUES (
        p_school_id, candidate, normalized_role, p_created_by,
        p_idempotency_key, true
      )
      RETURNING * INTO created_code;
      EXIT;
    EXCEPTION WHEN unique_violation THEN
      -- A code collision is extraordinarily unlikely; retry with fresh bytes.
      IF p_idempotency_key IS NOT NULL THEN
        SELECT * INTO existing_code
        FROM public.invite_codes
        WHERE school_id = p_school_id
          AND created_by = p_created_by
          AND idempotency_key = p_idempotency_key
        FOR UPDATE;
        IF FOUND THEN
          RETURN to_jsonb(existing_code);
        END IF;
      END IF;
    END;
  END LOOP;

  RETURN to_jsonb(created_code);
END;
$$;

REVOKE ALL ON FUNCTION public.create_school_invite_code(UUID, TEXT, UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_school_invite_code(UUID, TEXT, UUID, TEXT) TO authenticated;

COMMIT;
