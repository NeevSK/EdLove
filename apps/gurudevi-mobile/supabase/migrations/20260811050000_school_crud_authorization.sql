-- School tenant CRUD authorization. Registry facts remain public/read-only;
-- tenant school administration requires a school leadership bond.

-- Schools
DROP POLICY IF EXISTS "Users can view their own school" ON public.schools;
CREATE POLICY "Users can view their own school"
  ON public.schools FOR SELECT
  USING (
    id = public.get_my_active_school_id()
    OR created_by = auth.uid()
    OR public.has_capacity('admin', 'GLOBAL')
  );

DROP POLICY IF EXISTS "School leaders can update schools" ON public.schools;
CREATE POLICY "School leaders can update schools"
  ON public.schools FOR UPDATE
  USING (
    created_by = auth.uid()
    OR public.has_capacity_in_school('principal', id)
    OR public.has_capacity_in_school('section_head', id)
    OR public.has_capacity('admin', 'GLOBAL')
  )
  WITH CHECK (
    created_by = auth.uid()
    OR public.has_capacity_in_school('principal', id)
    OR public.has_capacity_in_school('section_head', id)
    OR public.has_capacity('admin', 'GLOBAL')
  );

DROP POLICY IF EXISTS "School leaders can delete schools" ON public.schools;
CREATE POLICY "School leaders can delete schools"
  ON public.schools FOR DELETE
  USING (
    created_by = auth.uid()
    OR public.has_capacity_in_school('principal', id)
    OR public.has_capacity('admin', 'GLOBAL')
  );

-- Sections
DROP POLICY IF EXISTS "Anyone in school can view sections" ON public.sections;
CREATE POLICY "School members can view sections"
  ON public.sections FOR SELECT
  USING (
    public.has_capacity_in_school('student', school_id)
    OR public.has_capacity_in_school('teacher', school_id)
    OR public.has_capacity_in_school('principal', school_id)
    OR public.has_capacity_in_school('section_head', school_id)
    OR public.has_capacity('admin', 'GLOBAL')
  );

CREATE POLICY "School leaders can create sections"
  ON public.sections FOR INSERT
  WITH CHECK (
    public.has_capacity_in_school('principal', school_id)
    OR public.has_capacity_in_school('section_head', school_id)
    OR public.has_capacity('admin', 'GLOBAL')
  );

CREATE POLICY "School leaders can update sections"
  ON public.sections FOR UPDATE
  USING (
    public.has_capacity_in_school('principal', school_id)
    OR public.has_capacity_in_school('section_head', school_id)
    OR public.has_capacity('admin', 'GLOBAL')
  )
  WITH CHECK (
    public.has_capacity_in_school('principal', school_id)
    OR public.has_capacity_in_school('section_head', school_id)
    OR public.has_capacity('admin', 'GLOBAL')
  );

CREATE POLICY "School leaders can delete sections"
  ON public.sections FOR DELETE
  USING (
    public.has_capacity_in_school('principal', school_id)
    OR public.has_capacity('admin', 'GLOBAL')
  );

-- Grades
DROP POLICY IF EXISTS "Users can view grades" ON public.grade_levels;
CREATE POLICY "School members can view grades"
  ON public.grade_levels FOR SELECT
  USING (
    public.has_capacity_in_school('student', school_id)
    OR public.has_capacity_in_school('teacher', school_id)
    OR public.has_capacity_in_school('principal', school_id)
    OR public.has_capacity_in_school('section_head', school_id)
    OR public.has_capacity_in_school('grade_head', school_id)
    OR public.has_capacity('admin', 'GLOBAL')
  );

CREATE POLICY "School leaders can create grades"
  ON public.grade_levels FOR INSERT
  WITH CHECK (
    public.has_capacity_in_school('principal', school_id)
    OR public.has_capacity_in_school('section_head', school_id)
    OR public.has_capacity_in_school('grade_head', school_id)
    OR public.has_capacity('admin', 'GLOBAL')
  );

CREATE POLICY "School leaders can update grades"
  ON public.grade_levels FOR UPDATE
  USING (
    public.has_capacity_in_school('principal', school_id)
    OR public.has_capacity_in_school('section_head', school_id)
    OR public.has_capacity_in_school('grade_head', school_id)
    OR public.has_capacity('admin', 'GLOBAL')
  )
  WITH CHECK (
    public.has_capacity_in_school('principal', school_id)
    OR public.has_capacity_in_school('section_head', school_id)
    OR public.has_capacity_in_school('grade_head', school_id)
    OR public.has_capacity('admin', 'GLOBAL')
  );

CREATE POLICY "School leaders can delete grades"
  ON public.grade_levels FOR DELETE
  USING (
    public.has_capacity_in_school('principal', school_id)
    OR public.has_capacity_in_school('section_head', school_id)
    OR public.has_capacity('admin', 'GLOBAL')
  );

-- Invite codes are generated and revoked by school leadership only.
CREATE POLICY "School leaders can create invite codes"
  ON public.invite_codes FOR INSERT
  WITH CHECK (
    public.has_capacity_in_school('principal', school_id)
    OR public.has_capacity_in_school('section_head', school_id)
    OR public.has_capacity('admin', 'GLOBAL')
  );

CREATE POLICY "School leaders can update invite codes"
  ON public.invite_codes FOR UPDATE
  USING (
    public.has_capacity_in_school('principal', school_id)
    OR public.has_capacity_in_school('section_head', school_id)
    OR public.has_capacity('admin', 'GLOBAL')
  )
  WITH CHECK (
    public.has_capacity_in_school('principal', school_id)
    OR public.has_capacity_in_school('section_head', school_id)
    OR public.has_capacity('admin', 'GLOBAL')
  );

CREATE POLICY "School leaders can delete invite codes"
  ON public.invite_codes FOR DELETE
  USING (
    public.has_capacity_in_school('principal', school_id)
    OR public.has_capacity_in_school('section_head', school_id)
    OR public.has_capacity('admin', 'GLOBAL')
  );
