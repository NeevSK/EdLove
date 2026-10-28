-- ============================================================================
-- MIGRATION: 20261028030000_cybernetic_resonance_mesh.sql
-- Cybernetic Resonance Mesh: Multi-dimensional soul potential, 360° pulse
-- stream, temporal harmonic rollups, annual living portfolios, and desk passes.
-- ============================================================================

-- 1. Canonical Dimension Taxonomies (Code-Governed Templates)
CREATE TABLE IF NOT EXISTS public.dimension_taxonomies (
  taxonomy_key VARCHAR(64) PRIMARY KEY,
  title VARCHAR(128) NOT NULL,
  target_persona VARCHAR(32) NOT NULL CHECK (target_persona IN ('STUDENT', 'TEACHER', 'PRINCIPAL', 'GUARDIAN')),
  version INT2 NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Registered Canonical Dimensions
CREATE TABLE IF NOT EXISTS public.taxonomy_dimensions (
  dimension_key VARCHAR(64) PRIMARY KEY,
  taxonomy_key VARCHAR(64) NOT NULL REFERENCES public.dimension_taxonomies(taxonomy_key) ON DELETE CASCADE,
  label VARCHAR(128) NOT NULL,
  description TEXT NOT NULL,
  color_hex VARCHAR(16) NOT NULL DEFAULT '#D4843A',
  display_order INT2 NOT NULL DEFAULT 0
);

-- 3. Institution Rubric Activation & Overrides (Sovereign Configuration)
CREATE TABLE IF NOT EXISTS public.institution_rubric_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  dimension_key VARCHAR(64) NOT NULL REFERENCES public.taxonomy_dimensions(dimension_key) ON DELETE CASCADE,
  custom_label VARCHAR(128),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  display_order INT2,
  CONSTRAINT uq_school_dimension UNIQUE (school_id, dimension_key)
);

-- 4. High-Frequency Symmetrical Resonance Pulses (The 360° Interaction Stream)
CREATE TABLE IF NOT EXISTS public.resonance_pulses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  context_id UUID REFERENCES public.classrooms(id) ON DELETE SET NULL,
  perspective_pair VARCHAR(32) NOT NULL 
    CHECK (perspective_pair IN ('TEACHER_TO_STUDENT', 'STUDENT_TO_TEACHER', 'PEER_TO_PEER', 'PRINCIPAL_TO_TEACHER', 'SELF')),
  pulse_date DATE NOT NULL DEFAULT CURRENT_DATE,
  pulse_time TIME NOT NULL DEFAULT CURRENT_TIME,
  silver_lining TEXT,
  disclosure_tier VARCHAR(32) NOT NULL DEFAULT 'TIER_0_PRIVATE'
    CHECK (disclosure_tier IN ('TIER_0_PRIVATE', 'TIER_1_BOND', 'TIER_2_FAMILY', 'TIER_3_ANONYMOUS')),
  is_anonymized BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pulses_subject_date ON public.resonance_pulses(subject_id, pulse_date DESC);
CREATE INDEX IF NOT EXISTS idx_pulses_author ON public.resonance_pulses(author_id);
CREATE INDEX IF NOT EXISTS idx_pulses_context ON public.resonance_pulses(context_id);

-- 5. Sparse Pulse Dimension Scores (Ultra-Compact INT2 Key-Value Store)
CREATE TABLE IF NOT EXISTS public.pulse_dimension_scores (
  pulse_id UUID NOT NULL REFERENCES public.resonance_pulses(id) ON DELETE CASCADE,
  dimension_key VARCHAR(64) NOT NULL REFERENCES public.taxonomy_dimensions(dimension_key) ON DELETE CASCADE,
  score INT2 NOT NULL CHECK (score BETWEEN 0 AND 100),
  PRIMARY KEY (pulse_id, dimension_key)
);

CREATE INDEX IF NOT EXISTS idx_pulse_scores_pulse_id ON public.pulse_dimension_scores(pulse_id);
CREATE INDEX IF NOT EXISTS idx_pulse_scores_dimension ON public.pulse_dimension_scores(dimension_key);

-- 6. Content-Addressed Media Attachments (Zero Duplicate Storage)
CREATE TABLE IF NOT EXISTS public.storage_blobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sha256_hash VARCHAR(64) NOT NULL UNIQUE,
  storage_path TEXT NOT NULL,
  mime_type VARCHAR(64) NOT NULL,
  file_size_bytes INT4 NOT NULL,
  thumbnail_url TEXT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.pulse_evidence_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pulse_id UUID NOT NULL REFERENCES public.resonance_pulses(id) ON DELETE CASCADE,
  blob_id UUID NOT NULL REFERENCES public.storage_blobs(id) ON DELETE RESTRICT,
  caption VARCHAR(256),
  attached_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pulse_attachments_pulse ON public.pulse_evidence_attachments(pulse_id);

-- 7. Continuous Harmonic Rollups (Weekly / Monthly Time-Series Cache)
CREATE TABLE IF NOT EXISTS public.longitudinal_harmonic_rollups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  taxonomy_key VARCHAR(64) NOT NULL REFERENCES public.dimension_taxonomies(taxonomy_key),
  rollup_period VARCHAR(16) NOT NULL CHECK (rollup_period IN ('WEEK', 'MONTH', 'TERM')),
  period_start_date DATE NOT NULL,
  dimension_averages JSONB NOT NULL,
  sample_count INT4 NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_user_rollup_period UNIQUE (user_id, taxonomy_key, rollup_period, period_start_date)
);

CREATE INDEX IF NOT EXISTS idx_harmonic_rollups_user ON public.longitudinal_harmonic_rollups(user_id, period_start_date DESC);

-- 8. Sovereign Annual Living Portfolios (Replaces Performance Appraisals)
CREATE TABLE IF NOT EXISTS public.annual_living_portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  academic_year VARCHAR(16) NOT NULL,
  persona_type VARCHAR(32) NOT NULL CHECK (persona_type IN ('STUDENT', 'TEACHER', 'PRINCIPAL')),
  annual_radar_polygon JSONB NOT NULL,
  high_water_marks JSONB NOT NULL DEFAULT '[]'::jsonb,
  compounded_silver_linings JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_user_annual_portfolio UNIQUE (user_id, academic_year)
);

CREATE INDEX IF NOT EXISTS idx_annual_portfolios_user ON public.annual_living_portfolios(user_id, academic_year);

-- 9. Classroom Desk Passes (Physical Token Roster Provisioning)
CREATE TABLE IF NOT EXISTS public.classroom_desk_passes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  classroom_student_id UUID REFERENCES public.classroom_students(id) ON DELETE SET NULL,
  pass_code VARCHAR(32) NOT NULL UNIQUE,
  label VARCHAR(128),
  roll_number INTEGER,
  status VARCHAR(32) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'claimed', 'revoked', 'expired')),
  claimed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  claimed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_desk_passes_code ON public.classroom_desk_passes(pass_code);
CREATE INDEX IF NOT EXISTS idx_desk_passes_class ON public.classroom_desk_passes(classroom_id, status);

-- ============================================================================
-- SEED DATA: CANONICAL TAXONOMIES & DIMENSIONS
-- ============================================================================

INSERT INTO public.dimension_taxonomies (taxonomy_key, title, target_persona, version)
VALUES
  ('STUDENT_GROWTH', 'Student Soul & Potential Matrix', 'STUDENT', 1),
  ('TEACHER_VITALITY', 'Teacher Vitality & Pedagogical Resonance', 'TEACHER', 1),
  ('LEADERSHIP', 'Sanctuary Leadership & Stewardship', 'PRINCIPAL', 1)
ON CONFLICT (taxonomy_key) DO NOTHING;

INSERT INTO public.taxonomy_dimensions (dimension_key, taxonomy_key, label, description, color_hex, display_order)
VALUES
  -- Student Growth Dimensions
  ('cognitive_flow', 'STUDENT_GROWTH', 'Cognitive Flow', 'Deep immersion and problem-solving tenacity in learning tasks', '#D4843A', 1),
  ('emotional_resonance', 'STUDENT_GROWTH', 'Emotional Resonance', 'Self-awareness, emotional grounding, and empathetic listening', '#E5A967', 2),
  ('social_weaving', 'STUDENT_GROWTH', 'Social Weaving', 'Collaborative generosity and uplifting peer connection', '#4A7C59', 3),
  ('creative_spark', 'STUDENT_GROWTH', 'Creative Spark', 'Divergent imagination, curiosity, and artistic originality', '#8F5C38', 4),
  ('practical_mastery', 'STUDENT_GROWTH', 'Practical Mastery', 'Hands-on dexterity, craft execution, and iterative refinement', '#2B4C3F', 5),

  -- Teacher Vitality Dimensions
  ('pedagogical_tact', 'TEACHER_VITALITY', 'Pedagogical Tact', 'Intuitive sensing of student readiness and gentle guidance', '#D4843A', 1),
  ('relational_warmth', 'TEACHER_VITALITY', 'Relational Warmth', 'Creating an unconditional sanctuary of belonging and safety', '#E5A967', 2),
  ('intellectual_vitality', 'TEACHER_VITALITY', 'Intellectual Vitality', 'Living enthusiasm for the domain and inquiry craft', '#4A7C59', 3),
  ('allostatic_balance', 'TEACHER_VITALITY', 'Allostatic Balance', 'Nervous system grounding and sustainable energetic reserve', '#8F5C38', 4),
  ('craft_reflection', 'TEACHER_VITALITY', 'Craft Reflection', 'Metacognitive honesty and continual refinement of practice', '#2B4C3F', 5),

  -- Leadership Dimensions
  ('institutional_stewardship', 'LEADERSHIP', 'Institutional Stewardship', 'Protection of communal values, resource equity, and vision', '#D4843A', 1),
  ('faculty_enablement', 'LEADERSHIP', 'Faculty Enablement', 'Shielding educators from bureaucratic burden and fostering agency', '#E5A967', 2),
  ('community_trust', 'LEADERSHIP', 'Community Trust', 'Transparent bridges with families and neighborhood elders', '#4A7C59', 3),
  ('systemic_coherence', 'LEADERSHIP', 'Systemic Coherence', 'Harmonious alignment across curricula, environments, and schedules', '#8F5C38', 4),
  ('compassionate_justice', 'LEADERSHIP', 'Compassionate Justice', 'Equitable dispute mediation and restorative culture', '#2B4C3F', 5)
ON CONFLICT (dimension_key) DO NOTHING;

-- ============================================================================
-- STORED PROCEDURE: ATOMIC STUDENT PROFILE CLAIMING
-- ============================================================================

CREATE OR REPLACE FUNCTION public.claim_student_profile(
  p_claim_code TEXT,
  p_claiming_user_id UUID DEFAULT public.get_my_id()
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_pass RECORD;
  v_student RECORD;
  v_caller UUID := COALESCE(p_claiming_user_id, public.get_my_id());
  v_code TEXT := UPPER(TRIM(p_claim_code));
BEGIN
  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 1. Check classroom_desk_passes first
  SELECT * INTO v_pass
  FROM public.classroom_desk_passes
  WHERE UPPER(pass_code) = v_code
    AND status = 'active'
    AND (expires_at IS NULL OR expires_at > NOW())
  FOR UPDATE;

  IF FOUND THEN
    IF v_pass.classroom_student_id IS NOT NULL THEN
      UPDATE public.classroom_students
      SET student_id = v_caller,
          claimed_at = NOW(),
          status = 'active'
      WHERE id = v_pass.classroom_student_id;
    ELSE
      INSERT INTO public.classroom_students (
        classroom_id,
        student_id,
        roll_number,
        claimed_at,
        status
      ) VALUES (
        v_pass.classroom_id,
        v_caller,
        v_pass.roll_number,
        NOW(),
        'active'
      );
    END IF;

    UPDATE public.classroom_desk_passes
    SET status = 'claimed',
        claimed_by = v_caller,
        claimed_at = NOW()
    WHERE id = v_pass.id;

    RETURN jsonb_build_object(
      'success', true,
      'claim_type', 'DESK_PASS',
      'classroom_id', v_pass.classroom_id,
      'claimed_at', NOW()
    );
  END IF;

  -- 2. Fallback: Check existing classroom_students invite_code
  SELECT * INTO v_student
  FROM public.classroom_students
  WHERE UPPER(invite_code) = v_code
    AND student_id IS NULL
  FOR UPDATE;

  IF FOUND THEN
    UPDATE public.classroom_students
    SET student_id = v_caller,
        claimed_at = NOW(),
        status = 'active'
    WHERE id = v_student.id;

    RETURN jsonb_build_object(
      'success', true,
      'claim_type', 'STUDENT_INVITE',
      'classroom_id', v_student.classroom_id,
      'claimed_at', NOW()
    );
  END IF;

  RAISE EXCEPTION 'Invalid or already claimed code: %', p_claim_code;
END;
$$;

-- ============================================================================
-- ROW LEVEL SECURITY: THE SOVEREIGN PRIVACY AIRGAP
-- ============================================================================

ALTER TABLE public.dimension_taxonomies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taxonomy_dimensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_rubric_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resonance_pulses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pulse_dimension_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_blobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pulse_evidence_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.longitudinal_harmonic_rollups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.annual_living_portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_desk_passes ENABLE ROW LEVEL SECURITY;

-- 1. Dimension Taxonomies: Publicly readable catalog
CREATE POLICY "Public taxonomies read"
  ON public.dimension_taxonomies FOR SELECT
  USING (true);

CREATE POLICY "Public dimensions read"
  ON public.taxonomy_dimensions FOR SELECT
  USING (true);

-- 2. Rubric overrides: Readable by members of the school
CREATE POLICY "School members read rubric overrides"
  ON public.institution_rubric_overrides FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.school_members sm
      WHERE sm.school_id = institution_rubric_overrides.school_id
        AND sm.user_id = public.get_my_id()
    )
  );

-- 3. Resonance Pulses:
-- Authors always read their authored pulses
CREATE POLICY "Authors read own pulses"
  ON public.resonance_pulses FOR SELECT
  USING (author_id = public.get_my_id());

-- Authors can create pulses
CREATE POLICY "Authors create pulses"
  ON public.resonance_pulses FOR INSERT
  WITH CHECK (author_id = public.get_my_id());

-- Subjects read pulses disclosed to them (TIER_1_BOND or TIER_2_FAMILY)
CREATE POLICY "Subjects read disclosed pulses"
  ON public.resonance_pulses FOR SELECT
  USING (
    subject_id = public.get_my_id()
    AND disclosure_tier IN ('TIER_1_BOND', 'TIER_2_FAMILY')
  );

-- Anonymized student feedback on teachers: teachers only read if >= 5 responses (k >= 5 shroud)
CREATE POLICY "Teachers read anonymized pulses in aggregate"
  ON public.resonance_pulses FOR SELECT
  USING (
    subject_id = public.get_my_id()
    AND is_anonymized = TRUE
    AND (
      SELECT COUNT(*) FROM public.resonance_pulses p2
      WHERE p2.subject_id = public.get_my_id()
        AND p2.context_id = resonance_pulses.context_id
        AND p2.is_anonymized = TRUE
    ) >= 5
  );

-- 4. Pulse Dimension Scores:
CREATE POLICY "Scores readable by pulse viewers"
  ON public.pulse_dimension_scores FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.resonance_pulses p
      WHERE p.id = pulse_dimension_scores.pulse_id
    )
  );

CREATE POLICY "Scores insertable by pulse author"
  ON public.pulse_dimension_scores FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.resonance_pulses p
      WHERE p.id = pulse_dimension_scores.pulse_id
        AND p.author_id = public.get_my_id()
    )
  );

-- 5. Longitudinal Harmonic Rollups:
CREATE POLICY "Users read own rollups"
  ON public.longitudinal_harmonic_rollups FOR SELECT
  USING (user_id = public.get_my_id());

-- 6. Annual Living Portfolios:
CREATE POLICY "Users read own annual portfolios"
  ON public.annual_living_portfolios FOR SELECT
  USING (user_id = public.get_my_id() OR is_published = TRUE);

CREATE POLICY "Users update own annual portfolios"
  ON public.annual_living_portfolios FOR ALL
  USING (user_id = public.get_my_id())
  WITH CHECK (user_id = public.get_my_id());

-- 7. Classroom Desk Passes:
CREATE POLICY "Teachers manage desk passes in their classrooms"
  ON public.classroom_desk_passes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.classrooms c
      WHERE c.id = classroom_desk_passes.classroom_id
        AND c.teacher_id = public.get_my_id()
    )
  );

CREATE POLICY "Public look up active desk pass by code"
  ON public.classroom_desk_passes FOR SELECT
  USING (status = 'active');

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT ALL ON public.dimension_taxonomies TO authenticated, service_role;
GRANT ALL ON public.taxonomy_dimensions TO authenticated, service_role;
GRANT ALL ON public.institution_rubric_overrides TO authenticated, service_role;
GRANT ALL ON public.resonance_pulses TO authenticated, service_role;
GRANT ALL ON public.pulse_dimension_scores TO authenticated, service_role;
GRANT ALL ON public.storage_blobs TO authenticated, service_role;
GRANT ALL ON public.pulse_evidence_attachments TO authenticated, service_role;
GRANT ALL ON public.longitudinal_harmonic_rollups TO authenticated, service_role;
GRANT ALL ON public.annual_living_portfolios TO authenticated, service_role;
GRANT ALL ON public.classroom_desk_passes TO authenticated, service_role;

GRANT SELECT ON public.dimension_taxonomies TO anon;
GRANT SELECT ON public.taxonomy_dimensions TO anon;
GRANT EXECUTE ON FUNCTION public.claim_student_profile(TEXT, UUID) TO authenticated, anon, service_role;
