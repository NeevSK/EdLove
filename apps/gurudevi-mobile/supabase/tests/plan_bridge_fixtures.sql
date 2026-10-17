-- Shared fixtures for plan_bridge_calm_notices.test.sql and the sanctuary-api
-- repository integration test. Load inside a transaction that rolls back.
-- Fixtures --------------------------------------------------------------------
-- Profile side-effect triggers reference tables a fresh replay may lack; they
-- are irrelevant here (rolled back with the transaction).
ALTER TABLE public.users DISABLE TRIGGER USER;
INSERT INTO public.schools (id, name) VALUES
  ('a0000000-0000-4000-8000-000000000001', 'Plan Bridge Test School'),
  ('a0000000-0000-4000-8000-000000000002', 'Other School');
INSERT INTO public.users (id, full_name, capacity, school_id) VALUES
  ('b0000000-0000-4000-8000-0000000000a1', 'Teacher T', 'teacher', 'a0000000-0000-4000-8000-000000000001'),
  ('b0000000-0000-4000-8000-0000000000a2', 'Principal P', 'principal', 'a0000000-0000-4000-8000-000000000001'),
  ('b0000000-0000-4000-8000-0000000000b1', 'Student A', 'student', 'a0000000-0000-4000-8000-000000000001'),
  ('b0000000-0000-4000-8000-0000000000b2', 'Student B', 'student', 'a0000000-0000-4000-8000-000000000001'),
  ('b0000000-0000-4000-8000-0000000000b3', 'Student C', 'student', 'a0000000-0000-4000-8000-000000000001'),
  ('b0000000-0000-4000-8000-0000000000c1', 'Guardian GA (verified for A and B)', 'guest', NULL),
  ('b0000000-0000-4000-8000-0000000000c2', 'Guardian GA2 (verified for A)', 'guest', NULL),
  ('b0000000-0000-4000-8000-0000000000c3', 'Guardian GB (pending for B)', 'guest', NULL),
  ('b0000000-0000-4000-8000-0000000000c4', 'Guardian GC (verified for C, other class)', 'guest', NULL),
  ('b0000000-0000-4000-8000-0000000000d1', 'Stranger', 'guest', NULL);
ALTER TABLE public.users ENABLE TRIGGER USER;
INSERT INTO public.auth_identities (user_id, provider, provider_user_id)
SELECT id, 'test', id::text FROM public.users WHERE id::text LIKE 'b0000000-%';
INSERT INTO public.bonds (user_id, entity_id, entity_type, capacity, status) VALUES
  ('b0000000-0000-4000-8000-0000000000a1', 'a0000000-0000-4000-8000-000000000001', 'SCHOOL', 'teacher', 'active'),
  ('b0000000-0000-4000-8000-0000000000a2', 'a0000000-0000-4000-8000-000000000001', 'SCHOOL', 'principal', 'active');
INSERT INTO public.academic_cycles (id, school_id, name, starts_at, ends_at, status) VALUES
  ('c0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', '2026', '2026-01-01', '2027-01-01', 'active');
INSERT INTO public.sections (id, school_id, name) VALUES
  ('c1000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'Middle');
INSERT INTO public.academic_grade_levels (id, section_id, school_id, grade_number) VALUES
  ('c2000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 6);
INSERT INTO public.grade_classes (id, school_id, grade_level_id, academic_cycle_id, name, status) VALUES
  ('d0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'c2000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', '6 A', 'active'),
  ('d0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'c2000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', '6 B', 'active');
INSERT INTO public.grade_class_teacher_assignments (grade_class_id, academic_cycle_id, teacher_id, role, effective_from, status) VALUES
  ('d0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-0000000000a1', 'class_teacher', '2026-01-01', 'active');
INSERT INTO public.student_grade_class_enrollments (school_id, academic_cycle_id, grade_class_id, student_id, effective_from, status) VALUES
  ('a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-0000000000b1', '2026-01-01', 'active'),
  ('a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-0000000000b2', '2026-01-01', 'active'),
  ('a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-0000000000b3', '2026-01-01', 'active');
INSERT INTO public.student_guardian_relationships (student_id, guardian_id, relationship_type, verification_status, verified_by, verified_at) VALUES
  ('b0000000-0000-4000-8000-0000000000b1', 'b0000000-0000-4000-8000-0000000000c1', 'parent', 'verified', 'b0000000-0000-4000-8000-0000000000a2', now()),
  ('b0000000-0000-4000-8000-0000000000b2', 'b0000000-0000-4000-8000-0000000000c1', 'parent', 'verified', 'b0000000-0000-4000-8000-0000000000a2', now()),
  ('b0000000-0000-4000-8000-0000000000b1', 'b0000000-0000-4000-8000-0000000000c2', 'parent', 'verified', 'b0000000-0000-4000-8000-0000000000a2', now()),
  ('b0000000-0000-4000-8000-0000000000b3', 'b0000000-0000-4000-8000-0000000000c4', 'parent', 'verified', 'b0000000-0000-4000-8000-0000000000a2', now());
INSERT INTO public.student_guardian_relationships (student_id, guardian_id, relationship_type) VALUES
  ('b0000000-0000-4000-8000-0000000000b2', 'b0000000-0000-4000-8000-0000000000c3', 'parent');

INSERT INTO public.school_mode_policies (school_id, mode_key, lock, override_roles, override_rate_limit_per_day, schedule) VALUES
  ('a0000000-0000-4000-8000-000000000001', 'good_night', 'locked', ARRAY['principal'], 3,
   '{"weekly":[{"days":["sun","mon","tue","wed","thu","fri","sat"],"start":"20:00","end":"06:30"}],"date_overrides":[]}');

INSERT INTO public.calendar_events (id, school_id, grade_class_id, title, type, start_date, notice_lead_days, is_public, created_by) VALUES
  ('e0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001',
   'Sports day', 'sports', now() + interval '6 days', 3, false, 'b0000000-0000-4000-8000-0000000000a1');

INSERT INTO public.announcements (id, school_id, author_id, title, content, audience_scope, grade_class_id, status, send_at, schedule_version, calendar_event_id) VALUES
  ('f0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-0000000000a1', 'Sports day kit', 'White shoes on Friday', 'grade_class', 'd0000000-0000-4000-8000-000000000001', 'scheduled', now() - interval '1 minute', 0, 'e0000000-0000-4000-8000-000000000001'),
  ('f0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-0000000000a1', 'Rescheduled', 'v2 wins', 'grade_class', 'd0000000-0000-4000-8000-000000000001', 'scheduled', now() - interval '1 minute', 2, NULL),
  ('f0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-0000000000a1', 'Tomorrow 6:30', 'Held by quiet hours', 'grade_class', 'd0000000-0000-4000-8000-000000000001', 'scheduled', now() + interval '9 hours', 0, NULL),
  ('f0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-0000000000a1', 'Cancelled', 'never', 'grade_class', 'd0000000-0000-4000-8000-000000000001', 'cancelled', now() - interval '1 minute', 1, NULL);

