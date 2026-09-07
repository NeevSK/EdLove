-- 20260907_multi_perspective_tables.sql
-- Tripartite Multi-Perspective Architecture: Commercial Tuition, Guardian Bonds & School Invites

-- 1. Tuition Institutes (Commercial tuition centres, e.g., Apex Institute, Rotary Hall, or Independent Studios)
CREATE TABLE IF NOT EXISTS tuition_institutes (
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
CREATE TABLE IF NOT EXISTS tuition_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institute_id uuid REFERENCES tuition_institutes(id) ON DELETE CASCADE,
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
CREATE TABLE IF NOT EXISTS guardian_bonds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guardian_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ward_student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  relationship text NOT NULL DEFAULT 'parent' CHECK (relationship IN ('parent', 'mother', 'father', 'guardian', 'relative')),
  status text NOT NULL DEFAULT 'verified' CHECK (status IN ('pending', 'verified', 'revoked')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_guardian_ward UNIQUE (guardian_user_id, ward_student_id)
);

-- 4. School Invite Codes (For instant, secure educator/student/admin school bond activation)
CREATE TABLE IF NOT EXISTS school_invite_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  capacity text NOT NULL CHECK (capacity IN ('teacher', 'student', 'principal', 'admin')),
  roles jsonb NOT NULL DEFAULT '[]'::jsonb,
  max_uses int DEFAULT 100,
  used_count int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for lightning fast B-Tree scans
CREATE INDEX IF NOT EXISTS idx_tuition_batches_tutor ON tuition_batches(tutor_user_id);
CREATE INDEX IF NOT EXISTS idx_tuition_batches_institute ON tuition_batches(institute_id);
CREATE INDEX IF NOT EXISTS idx_tuition_batches_active ON tuition_batches(tutor_user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_guardian_bonds_guardian ON guardian_bonds(guardian_user_id);
CREATE INDEX IF NOT EXISTS idx_guardian_bonds_ward ON guardian_bonds(ward_student_id);
CREATE INDEX IF NOT EXISTS idx_school_invite_codes_code ON school_invite_codes(code) WHERE is_active = true;

-- Enable Row Level Security
ALTER TABLE tuition_institutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tuition_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE guardian_bonds ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_invite_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Tuition Institutes
CREATE POLICY "Users can view tuition institutes"
  ON tuition_institutes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Tutors can manage institutes they created"
  ON tuition_institutes FOR ALL
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- RLS Policies: Tuition Batches
CREATE POLICY "Tutors can view and manage their own batches"
  ON tuition_batches FOR ALL
  TO authenticated
  USING (tutor_user_id = auth.uid())
  WITH CHECK (tutor_user_id = auth.uid());

-- RLS Policies: Guardian Bonds
CREATE POLICY "Guardians can view and manage their own ward bonds"
  ON guardian_bonds FOR ALL
  TO authenticated
  USING (guardian_user_id = auth.uid())
  WITH CHECK (guardian_user_id = auth.uid());

-- RLS Policies: School Invite Codes
CREATE POLICY "Authenticated users can verify active invite codes"
  ON school_invite_codes FOR SELECT
  TO authenticated
  USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));
