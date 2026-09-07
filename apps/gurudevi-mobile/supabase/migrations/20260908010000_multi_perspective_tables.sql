-- 20260908010000_multi_perspective_tables.sql
-- Tripartite Multi-Perspective Architecture: Commercial Tuition, Guardian Bonds & School Invites

-- 1. Tuition Institutes (Commercial tuition centres, e.g., Apex Institute, Rotary Hall, or Independent Studios)
CREATE TABLE IF NOT EXISTS public.tuition_institutes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  city text,
  is_independent boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Tuition Batches (Commercial classes running under an institute or independent tutor)
CREATE TABLE IF NOT EXISTS public.tuition_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institute_id uuid REFERENCES public.tuition_institutes(id) ON DELETE CASCADE,
  tutor_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_name text NOT NULL,
  grade_level text NOT NULL,
  medium text NOT NULL CHECK (medium IN ('sinhala', 'english', 'tamil')),
  format text NOT NULL DEFAULT 'physical' CHECK (format IN ('physical', 'online', 'hybrid', 'paper_class')),
  schedule text NOT NULL,
  monthly_fee numeric(10, 2),
  custom_alias text,
  role text NOT NULL DEFAULT 'lead_tutor' CHECK (role IN ('founder', 'lead_tutor', 'assistant_tutor', 'paper_marker')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Guardian Bonds (Relational linking between a guardian/parent and a student ward)
CREATE TABLE IF NOT EXISTS public.guardian_bonds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guardian_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ward_student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  relationship text NOT NULL DEFAULT 'parent' CHECK (relationship IN ('parent', 'mother', 'father', 'guardian', 'relative')),
  status text NOT NULL DEFAULT 'verified' CHECK (status IN ('pending', 'verified', 'revoked')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_guardian_ward UNIQUE (guardian_user_id, ward_student_id)
);

-- 4. School Invite Codes (For instant, secure educator/student/admin school bond activation)
CREATE TABLE IF NOT EXISTS public.school_invite_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  capacity text NOT NULL CHECK (capacity IN ('teacher', 'student', 'principal', 'admin')),
  roles jsonb NOT NULL DEFAULT '[]'::jsonb,
  max_uses int DEFAULT 100,
  used_count int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tuition_batches_tutor ON public.tuition_batches(tutor_user_id);
CREATE INDEX IF NOT EXISTS idx_tuition_batches_institute ON public.tuition_batches(institute_id);
CREATE INDEX IF NOT EXISTS idx_tuition_batches_active ON public.tuition_batches(tutor_user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_guardian_bonds_guardian ON public.guardian_bonds(guardian_user_id);
CREATE INDEX IF NOT EXISTS idx_guardian_bonds_ward ON public.guardian_bonds(ward_student_id);
CREATE INDEX IF NOT EXISTS idx_school_invite_codes_code ON public.school_invite_codes(code) WHERE is_active = true;

-- Enable Row Level Security
ALTER TABLE public.tuition_institutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tuition_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guardian_bonds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_invite_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Tuition Institutes
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tuition_institutes' AND policyname = 'Users can view tuition institutes') THEN
    CREATE POLICY "Users can view tuition institutes"
      ON public.tuition_institutes FOR SELECT
      TO authenticated
      USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tuition_institutes' AND policyname = 'Tutors can manage institutes they created') THEN
    CREATE POLICY "Tutors can manage institutes they created"
      ON public.tuition_institutes FOR ALL
      TO authenticated
      USING (created_by = auth.uid())
      WITH CHECK (created_by = auth.uid());
  END IF;
END $$;

-- RLS Policies: Tuition Batches
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tuition_batches' AND policyname = 'Users can view active tuition batches') THEN
    CREATE POLICY "Users can view active tuition batches"
      ON public.tuition_batches FOR SELECT
      TO authenticated
      USING (is_active = true OR tutor_user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tuition_batches' AND policyname = 'Tutors can manage their own batches') THEN
    CREATE POLICY "Tutors can manage their own batches"
      ON public.tuition_batches FOR ALL
      TO authenticated
      USING (tutor_user_id = auth.uid())
      WITH CHECK (tutor_user_id = auth.uid());
  END IF;
END $$;

-- RLS Policies: Guardian Bonds
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'guardian_bonds' AND policyname = 'Guardians can manage their own ward bonds') THEN
    CREATE POLICY "Guardians can manage their own ward bonds"
      ON public.guardian_bonds FOR ALL
      TO authenticated
      USING (guardian_user_id = auth.uid())
      WITH CHECK (guardian_user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'guardian_bonds' AND policyname = 'Wards can view their guardian bonds') THEN
    CREATE POLICY "Wards can view their guardian bonds"
      ON public.guardian_bonds FOR SELECT
      TO authenticated
      USING (ward_student_id = auth.uid());
  END IF;
END $$;

-- RLS Policies: School Invite Codes
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'school_invite_codes' AND policyname = 'Authenticated users can verify active invite codes') THEN
    CREATE POLICY "Authenticated users can verify active invite codes"
      ON public.school_invite_codes FOR SELECT
      TO authenticated
      USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'school_invite_codes' AND policyname = 'School admins can manage invite codes') THEN
    CREATE POLICY "School admins can manage invite codes"
      ON public.school_invite_codes FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.bonds b
          WHERE b.entity_id = school_invite_codes.school_id::text
            AND b.user_id = auth.uid()
            AND b.capacity IN ('principal', 'admin', 'section_head')
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.bonds b
          WHERE b.entity_id = school_invite_codes.school_id::text
            AND b.user_id = auth.uid()
            AND b.capacity IN ('principal', 'admin', 'section_head')
        )
      );
  END IF;
END $$;
