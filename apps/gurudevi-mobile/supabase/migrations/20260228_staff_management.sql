-- staff_attendance: daily check-in/check-out for staff
CREATE TABLE IF NOT EXISTS public.staff_attendance (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id     UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  user_id       UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  date          DATE NOT NULL DEFAULT CURRENT_DATE,
  status        TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present','absent','late','half_day','on_leave')),
  check_in      TIMESTAMPTZ,
  check_out     TIMESTAMPTZ,
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(school_id, user_id, date)
);
ALTER TABLE public.staff_attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff_attendance_school_read" ON public.staff_attendance FOR SELECT USING (
  EXISTS(SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.school_id = staff_attendance.school_id)
);
-- Self-write: split into INSERT + UPDATE so WITH CHECK enforces user_id on new/modified rows.
CREATE POLICY "staff_attendance_self_insert" ON public.staff_attendance FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "staff_attendance_self_update" ON public.staff_attendance FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- staff_leaves: leave requests
CREATE TABLE IF NOT EXISTS public.staff_leaves (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id     UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  user_id       UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  leave_type    TEXT NOT NULL CHECK (leave_type IN ('sick','casual','annual','maternity','paternity','other')),
  start_date    DATE NOT NULL,
  end_date      DATE NOT NULL,
  reason        TEXT,
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  reviewed_by   UUID REFERENCES public.users(id),
  reviewed_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.staff_leaves ENABLE ROW LEVEL SECURITY;
-- Only the staff member themselves OR a principal/founder in the same school can read leave rows.
CREATE POLICY "staff_leaves_read" ON public.staff_leaves FOR SELECT USING (
  EXISTS(
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
      AND u.school_id = staff_leaves.school_id
      AND (u.id = staff_leaves.user_id OR u.role IN ('principal','founder'))
  )
);
CREATE POLICY "staff_leaves_self_insert" ON public.staff_leaves FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "staff_leaves_principal_update" ON public.staff_leaves FOR UPDATE USING (
  EXISTS(SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.school_id = staff_leaves.school_id AND u.role IN ('principal','founder'))
);

-- principal_observations
CREATE TABLE IF NOT EXISTS public.principal_observations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id     UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  principal_id  UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  teacher_id    UUID REFERENCES public.users(id),
  classroom_id  UUID REFERENCES public.classrooms(id),
  content       TEXT NOT NULL,
  type          TEXT NOT NULL DEFAULT 'note' CHECK (type IN ('walkthrough','note','concern','praise')),
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.principal_observations ENABLE ROW LEVEL SECURITY;
-- Only the authoring principal can access their own observations.
-- WITH CHECK ensures no user can forge rows attributed to a different principal.
CREATE POLICY "observations_principal_own" ON public.principal_observations
  FOR ALL
  USING (auth.uid() = principal_id)
  WITH CHECK (
    auth.uid() = principal_id
    AND EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
        AND u.school_id = principal_observations.school_id
        AND u.role IN ('principal','founder')
    )
  );

-- institutional_calendar
CREATE TABLE IF NOT EXISTS public.institutional_calendar (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id     UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  title         TEXT NOT NULL,
  type          TEXT NOT NULL DEFAULT 'event' CHECK (type IN ('term_start','term_end','exam','holiday','sports','event','other')),
  start_date    DATE NOT NULL,
  end_date      DATE,
  is_public     BOOLEAN DEFAULT TRUE NOT NULL,
  created_by    UUID REFERENCES public.users(id),
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.institutional_calendar ENABLE ROW LEVEL SECURITY;
CREATE POLICY "calendar_school_read" ON public.institutional_calendar FOR SELECT USING (
  is_public OR EXISTS(SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.school_id = institutional_calendar.school_id)
);
-- Principals can delete any calendar entry within their school (institutional resource).
CREATE POLICY "calendar_principal_delete" ON public.institutional_calendar FOR DELETE USING (
  EXISTS(SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.school_id = institutional_calendar.school_id AND u.role IN ('principal','founder'))
);
-- New events must be created by the calling principal within their school (prevents cross-school injection).
CREATE POLICY "calendar_principal_insert" ON public.institutional_calendar FOR INSERT
  WITH CHECK (
    created_by = auth.uid()
    AND EXISTS(SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.school_id = institutional_calendar.school_id AND u.role IN ('principal','founder'))
  );
-- Updates must stay within the same school and preserve created_by.
CREATE POLICY "calendar_principal_update" ON public.institutional_calendar FOR UPDATE
  USING (
    EXISTS(SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.school_id = institutional_calendar.school_id AND u.role IN ('principal','founder'))
  )
  WITH CHECK (
    created_by = auth.uid()
    AND EXISTS(SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.school_id = institutional_calendar.school_id AND u.role IN ('principal','founder'))
  );
