-- ========================================================
-- IDENTITY RLS FIX
-- ========================================================
-- The identity_architecture migration (20260308000000) introduced
-- new users whose public.users.id is a fresh UUID, NOT auth.uid().
-- All existing RLS policies used `auth.uid() = id` which breaks
-- for these new users. This migration replaces every affected policy
-- with one that calls get_my_id() — which correctly resolves
-- auth.uid() → internal user UUID via auth_identities for both
-- legacy users (where get_my_id() == auth.uid()) and new users.
-- ========================================================

-- ── users ─────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
CREATE POLICY "Users can view their own profile"
    ON public.users FOR SELECT
    USING (id = get_my_id());

DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile"
    ON public.users FOR UPDATE
    USING (id = get_my_id())
    WITH CHECK (id = get_my_id());

DROP POLICY IF EXISTS "Admins can view users in their school" ON public.users;
CREATE POLICY "Admins can view users in their school"
    ON public.users FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users AS viewer
            WHERE viewer.id = get_my_id()
            AND viewer.school_id = public.users.school_id
            AND viewer.role IN ('admin', 'principal', 'founder', 'developer')
        )
    );

-- Allow teachers to see students in their classrooms
DROP POLICY IF EXISTS "Teachers can view students in their classrooms" ON public.users;
CREATE POLICY "Teachers can view students in their classrooms"
    ON public.users FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.classroom_students cs
            JOIN public.classrooms c ON c.id = cs.classroom_id
            WHERE cs.student_id = public.users.id
            AND c.teacher_id = get_my_id()
        )
    );

-- ── mood_logs ──────────────────────────────────────────────────────
DROP POLICY IF EXISTS "mood_logs_privacy" ON public.mood_logs;
CREATE POLICY "mood_logs_privacy"
    ON public.mood_logs FOR ALL TO authenticated
    USING (user_id = get_my_id())
    WITH CHECK (user_id = get_my_id());

-- ── journal_entries ────────────────────────────────────────────────
DROP POLICY IF EXISTS "journal_entries_privacy" ON public.journal_entries;
CREATE POLICY "journal_entries_privacy"
    ON public.journal_entries FOR ALL TO authenticated
    USING (user_id = get_my_id())
    WITH CHECK (user_id = get_my_id());

-- ── fire_journal ───────────────────────────────────────────────────
DROP POLICY IF EXISTS "fire_journal_privacy" ON public.fire_journal;
CREATE POLICY "fire_journal_privacy"
    ON public.fire_journal FOR ALL TO authenticated
    USING (user_id = get_my_id())
    WITH CHECK (user_id = get_my_id());

-- ── notifications ──────────────────────────────────────────────────
DROP POLICY IF EXISTS "notifications_privacy" ON public.notifications;
CREATE POLICY "notifications_privacy"
    ON public.notifications FOR ALL TO authenticated
    USING (user_id = get_my_id())
    WITH CHECK (user_id = get_my_id());

-- ── timetable ──────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users manage own timetable" ON public.timetable;
CREATE POLICY "Users manage own timetable"
    ON public.timetable FOR ALL TO authenticated
    USING (user_id = get_my_id())
    WITH CHECK (user_id = get_my_id());

-- ── feature_usage_log ─────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can insert own usage logs" ON public.feature_usage_log;
CREATE POLICY "Users can insert own usage logs"
    ON public.feature_usage_log FOR INSERT
    WITH CHECK (user_id = get_my_id());

DROP POLICY IF EXISTS "Users can view own usage logs" ON public.feature_usage_log;
CREATE POLICY "Users can view own usage logs"
    ON public.feature_usage_log FOR SELECT
    USING (user_id = get_my_id());

-- ── user_rewards ───────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can view own rewards" ON public.user_rewards;
CREATE POLICY "Users can view own rewards"
    ON public.user_rewards FOR SELECT
    USING (user_id = get_my_id());

DROP POLICY IF EXISTS "Users can insert own rewards" ON public.user_rewards;
CREATE POLICY "Users can insert own rewards"
    ON public.user_rewards FOR INSERT
    WITH CHECK (user_id = get_my_id());

DROP POLICY IF EXISTS "Users can update own rewards" ON public.user_rewards;
CREATE POLICY "Users can update own rewards"
    ON public.user_rewards FOR UPDATE
    USING (user_id = get_my_id())
    WITH CHECK (user_id = get_my_id());

-- ── user_growth_state ──────────────────────────────────────────────
DROP POLICY IF EXISTS "growth_state_own" ON public.user_growth_state;
CREATE POLICY "growth_state_own"
    ON public.user_growth_state FOR ALL TO authenticated
    USING (user_id = get_my_id())
    WITH CHECK (user_id = get_my_id());

-- ── submissions ────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Students can read their own submissions" ON public.submissions;
CREATE POLICY "Students can read their own submissions"
    ON public.submissions FOR SELECT TO authenticated
    USING (student_id = get_my_id());

DROP POLICY IF EXISTS "Students can create submissions" ON public.submissions;
CREATE POLICY "Students can create submissions"
    ON public.submissions FOR INSERT TO authenticated
    WITH CHECK (student_id = get_my_id());

DROP POLICY IF EXISTS "Teachers can read submissions in their classrooms" ON public.submissions;
CREATE POLICY "Teachers can read submissions in their classrooms"
    ON public.submissions FOR SELECT TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.assignments a
        JOIN public.classrooms c ON c.id = a.classroom_id
        WHERE a.id = public.submissions.assignment_id
          AND c.teacher_id = get_my_id()
    ));

DROP POLICY IF EXISTS "Teachers can grade submissions in their classrooms" ON public.submissions;
CREATE POLICY "Teachers can grade submissions in their classrooms"
    ON public.submissions FOR UPDATE TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.assignments a
        JOIN public.classrooms c ON c.id = a.classroom_id
        WHERE a.id = public.submissions.assignment_id
          AND c.teacher_id = get_my_id()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.assignments a
        JOIN public.classrooms c ON c.id = a.classroom_id
        WHERE a.id = public.submissions.assignment_id
          AND c.teacher_id = get_my_id()
    ));

-- ── group_messages ─────────────────────────────────────────────────
DROP POLICY IF EXISTS "group_messages_member_read" ON public.group_messages;
CREATE POLICY "group_messages_member_read"
    ON public.group_messages FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM community_group_members m
        WHERE m.group_id = group_messages.group_id
        AND m.user_id = get_my_id()
        AND m.status = 'active'
    ));

DROP POLICY IF EXISTS "group_messages_member_insert" ON public.group_messages;
CREATE POLICY "group_messages_member_insert"
    ON public.group_messages FOR INSERT
    WITH CHECK (
        author_id = get_my_id()
        AND EXISTS (
            SELECT 1 FROM community_group_members m
            WHERE m.group_id = group_messages.group_id
            AND m.user_id = get_my_id()
            AND m.status = 'active'
        )
    );

-- ── direct_messages ────────────────────────────────────────────────
-- Drop the loose insert policy; the stricter direct_messages_insert policy
-- (with conversation membership + block checks) is added below at line ~455.
-- Having both with OR semantics would allow blocked users to bypass the block.
DROP POLICY IF EXISTS "Users can insert their own messages" ON public.direct_messages;

DROP POLICY IF EXISTS "Users can read messages in their conversations" ON public.direct_messages;
CREATE POLICY "Users can read messages in their conversations"
    ON public.direct_messages FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.direct_conversations c
            WHERE c.id = conversation_id
            AND (c.user1_id = get_my_id() OR c.user2_id = get_my_id())
        )
    );

-- ── direct_conversations ────────────────────────────────────────────
-- Policies for direct_conversations are handled at line ~436.
-- The legacy policies below referencing public.conversations are removed
-- because public.conversations does not exist in the schema.
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.direct_conversations;
CREATE POLICY "Users can view their own conversations"
    ON public.direct_conversations FOR SELECT TO authenticated
    USING (user1_id = get_my_id() OR user2_id = get_my_id());

DROP POLICY IF EXISTS "Users can create conversations" ON public.direct_conversations;
CREATE POLICY "Users can create conversations"
    ON public.direct_conversations FOR INSERT TO authenticated
    WITH CHECK (user1_id = get_my_id() OR user2_id = get_my_id());

-- ── staff_attendance ───────────────────────────────────────────────
DROP POLICY IF EXISTS "staff_attendance_school_read" ON public.staff_attendance;
CREATE POLICY "staff_attendance_school_read"
    ON public.staff_attendance FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.id = get_my_id()
        AND u.school_id = staff_attendance.school_id
    ));

DROP POLICY IF EXISTS "staff_attendance_self_insert" ON public.staff_attendance;
CREATE POLICY "staff_attendance_self_insert"
    ON public.staff_attendance FOR INSERT
    WITH CHECK (get_my_id() = user_id);

DROP POLICY IF EXISTS "staff_attendance_self_update" ON public.staff_attendance;
CREATE POLICY "staff_attendance_self_update"
    ON public.staff_attendance FOR UPDATE
    USING (get_my_id() = user_id)
    WITH CHECK (get_my_id() = user_id);

-- ── student_academic_records ───────────────────────────────────────
DROP POLICY IF EXISTS "sar_student_read_own" ON public.student_academic_records;
CREATE POLICY "sar_student_read_own"
    ON public.student_academic_records FOR SELECT
    USING (student_id = get_my_id());

DROP POLICY IF EXISTS "sar_staff_read_school" ON public.student_academic_records;
CREATE POLICY "sar_staff_read_school"
    ON public.student_academic_records FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.id = get_my_id()
        AND u.school_id = student_academic_records.school_id
        AND u.role IN ('teacher', 'principal', 'admin')
    ));

-- ── principal_notes ────────────────────────────────────────────────
DROP POLICY IF EXISTS "principal_notes_privacy" ON public.principal_notes;
CREATE POLICY "principal_notes_privacy"
    ON public.principal_notes FOR ALL TO authenticated
    USING (author_id = get_my_id())
    WITH CHECK (author_id = get_my_id());

-- ── principal_observations ─────────────────────────────────────────
DROP POLICY IF EXISTS "observations_principal_own" ON public.principal_observations;
CREATE POLICY "observations_principal_own"
    ON public.principal_observations FOR ALL
    USING (get_my_id() = principal_id)
    WITH CHECK (
        get_my_id() = principal_id
        AND EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = get_my_id()
            AND u.school_id = principal_observations.school_id
            AND u.role IN ('principal', 'founder')
        )
    );

-- ── thuthimal_gifts ────────────────────────────────────────────────
DROP POLICY IF EXISTS "thuthimal_gifter_reads_own" ON public.thuthimal_gifts;
CREATE POLICY "thuthimal_gifter_reads_own"
    ON public.thuthimal_gifts FOR SELECT
    USING (gifter_id = get_my_id());

-- ── audit_log ──────────────────────────────────────────────────────
DROP POLICY IF EXISTS "audit_log_admin_view" ON public.audit_log;
CREATE POLICY "audit_log_admin_view"
    ON public.audit_log FOR SELECT TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.users
        WHERE id = get_my_id() AND role IN ('founder', 'admin', 'developer')
    ));

-- ── lesson_materials ───────────────────────────────────────────────
DROP POLICY IF EXISTS "lesson_materials_teacher_manage" ON public.lesson_materials;
CREATE POLICY "lesson_materials_teacher_manage"
    ON public.lesson_materials FOR ALL TO authenticated
    USING (classroom_id IN (
        SELECT id FROM public.classrooms WHERE teacher_id = get_my_id()
    ));

DROP POLICY IF EXISTS "lesson_materials_student_read" ON public.lesson_materials;
CREATE POLICY "lesson_materials_student_read"
    ON public.lesson_materials FOR SELECT TO authenticated
    USING (classroom_id IN (
        SELECT id FROM public.classrooms WHERE teacher_id = get_my_id()
        UNION
        SELECT classroom_id FROM classroom_students WHERE student_id = get_my_id()
    ));

-- ── schools ────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can view their own school" ON public.schools;
CREATE POLICY "Users can view their own school"
    ON public.schools FOR SELECT
    USING (
        id IN (SELECT school_id FROM public.users WHERE id = get_my_id())
    );

-- ── institutional_calendar ─────────────────────────────────────────
DROP POLICY IF EXISTS "calendar_school_read" ON public.institutional_calendar;
CREATE POLICY "calendar_school_read"
    ON public.institutional_calendar FOR SELECT
    USING (
        is_public OR EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = get_my_id()
            AND u.school_id = institutional_calendar.school_id
        )
    );

-- ── Fix get_ecosystem_stats() function ────────────────────────────
-- This function uses `WHERE id = auth.uid()` which breaks for new users.
CREATE OR REPLACE FUNCTION public.get_ecosystem_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    result JSONB;
    caller_role TEXT;
    caller_id UUID;
BEGIN
    -- Resolve internal user ID
    caller_id := get_my_id();

    -- Strict role check — Founders and Admins only
    SELECT role INTO caller_role
    FROM public.users
    WHERE id = caller_id;

    IF caller_role IS NULL OR caller_role NOT IN ('founder', 'admin', 'developer') THEN
        RAISE EXCEPTION 'Access Denied: Founder privileges required.';
    END IF;

    SELECT jsonb_build_object(
        'total_schools',         (SELECT count(*)::int FROM public.schools),
        'total_users',           (SELECT count(*)::int FROM public.users),
        'total_classrooms',      (SELECT count(*)::int FROM public.classrooms),
        'total_mood_logs',       (SELECT count(*)::int FROM public.mood_logs),
        'total_journal_entries', (SELECT count(*)::int FROM public.journal_entries),
        'total_resources',       (SELECT count(*)::int FROM public.library_resources),
        'total_community_posts', (SELECT count(*)::int FROM public.community_posts)
    ) INTO result;

    RETURN result;
END;
$$;

-- ── Fix privilege-escalation UPDATE policy (20260217192416) ───────
-- The restrictive "safe fields" policy also used auth.uid().
DROP POLICY IF EXISTS "Users can update safe profile fields" ON public.users;
CREATE POLICY "Users can update safe profile fields"
    ON public.users FOR UPDATE TO authenticated
    USING (id = get_my_id())
    WITH CHECK (
        id = get_my_id()
        -- Ensure privileged fields remain unchanged
        AND role = (SELECT role FROM public.users WHERE id = get_my_id())
        AND school_id IS NOT DISTINCT FROM (SELECT school_id FROM public.users WHERE id = get_my_id())
        AND is_pro = (SELECT is_pro FROM public.users WHERE id = get_my_id())
        AND is_thuthimal = (SELECT is_thuthimal FROM public.users WHERE id = get_my_id())
        AND invitations_remaining = (SELECT invitations_remaining FROM public.users WHERE id = get_my_id())
        AND invitations_sent = (SELECT invitations_sent FROM public.users WHERE id = get_my_id())
    );

-- ── Fix assign_user_role() function ───────────────────────────────
CREATE OR REPLACE FUNCTION assign_user_role(
    target_user_id UUID,
    new_role TEXT,
    new_school_id UUID DEFAULT NULL,
    new_section_id UUID DEFAULT NULL,
    new_grade_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    old_role_val TEXT;
    old_school_val UUID;
    actor_role TEXT;
    actor_id UUID;
BEGIN
    actor_id := get_my_id();

    -- Get actor's role
    SELECT role INTO actor_role FROM public.users WHERE id = actor_id;

    IF actor_role NOT IN ('founder', 'admin') THEN
        RAISE EXCEPTION 'Unauthorized: Only founders and admins can assign roles';
    END IF;

    IF new_role NOT IN ('founder', 'admin', 'principal', 'section_head', 'grade_head', 'teacher', 'student', 'developer') THEN
        RAISE EXCEPTION 'Invalid role: %', new_role;
    END IF;

    SELECT role, school_id INTO old_role_val, old_school_val
    FROM public.users WHERE id = target_user_id;

    UPDATE public.users
    SET
        role = new_role,
        school_id = COALESCE(new_school_id, school_id),
        section_id = new_section_id,
        grade_id = new_grade_id,
        updated_at = now()
    WHERE id = target_user_id;

    INSERT INTO audit_log (
        action, actor_id, target_user_id,
        old_role, new_role,
        old_school_id, new_school_id,
        created_at
    )
    VALUES (
        'role_assignment',
        actor_id,
        target_user_id,
        old_role_val,
        new_role,
        old_school_val,
        new_school_id,
        now()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- ── direct_conversations ───────────────────────────────────────────
DROP POLICY IF EXISTS "direct_conversations_read" ON public.direct_conversations;
CREATE POLICY "direct_conversations_read"
    ON public.direct_conversations FOR SELECT
    USING (get_my_id() = user1_id OR get_my_id() = user2_id);

-- ── direct_messages ────────────────────────────────────────────────
-- Full replacement including block enforcement from social_shields_v2
DROP POLICY IF EXISTS "direct_messages_read" ON public.direct_messages;
CREATE POLICY "direct_messages_read"
    ON public.direct_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.direct_conversations c
            WHERE c.id = direct_messages.conversation_id
              AND (get_my_id() = c.user1_id OR get_my_id() = c.user2_id)
        )
    );

DROP POLICY IF EXISTS "direct_messages_insert" ON public.direct_messages;
CREATE POLICY "direct_messages_insert"
    ON public.direct_messages FOR INSERT
    WITH CHECK (
        author_id = get_my_id()
        AND EXISTS (
            SELECT 1 FROM public.direct_conversations c
            WHERE c.id = direct_messages.conversation_id
              AND (get_my_id() = c.user1_id OR get_my_id() = c.user2_id)
              AND NOT EXISTS (
                  SELECT 1 FROM public.user_blocks b
                  WHERE b.blocker_id = (CASE WHEN c.user1_id = get_my_id() THEN c.user2_id ELSE c.user1_id END)
                    AND b.blocked_id = get_my_id()
              )
        )
    );

-- ── user_blocks ────────────────────────────────────────────────────
DROP POLICY IF EXISTS "user_blocks_read_own" ON public.user_blocks;
CREATE POLICY "user_blocks_read_own"
    ON public.user_blocks FOR SELECT
    USING (get_my_id() = blocker_id);

DROP POLICY IF EXISTS "user_blocks_insert_own" ON public.user_blocks;
CREATE POLICY "user_blocks_insert_own"
    ON public.user_blocks FOR INSERT
    WITH CHECK (get_my_id() = blocker_id);

DROP POLICY IF EXISTS "user_blocks_delete_own" ON public.user_blocks;
CREATE POLICY "user_blocks_delete_own"
    ON public.user_blocks FOR DELETE
    USING (get_my_id() = blocker_id);

-- ── conversation_settings ──────────────────────────────────────────
DROP POLICY IF EXISTS "conv_settings_read_own" ON public.conversation_settings;
CREATE POLICY "conv_settings_read_own"
    ON public.conversation_settings FOR SELECT
    USING (get_my_id() = user_id);

DROP POLICY IF EXISTS "conv_settings_all_own" ON public.conversation_settings;
CREATE POLICY "conv_settings_all_own"
    ON public.conversation_settings FOR ALL
    USING (get_my_id() = user_id)
    WITH CHECK (get_my_id() = user_id);

-- ── Fix get_or_create_direct_conversation() ────────────────────────
CREATE OR REPLACE FUNCTION public.get_or_create_direct_conversation(target_user_id UUID)
RETURNS UUID AS $$
DECLARE
    caller_id UUID;
    uid1 UUID;
    uid2 UUID;
    conv_id UUID;
BEGIN
    caller_id := get_my_id();

    IF caller_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    IF caller_id < target_user_id THEN
        uid1 := caller_id;
        uid2 := target_user_id;
    ELSE
        uid1 := target_user_id;
        uid2 := caller_id;
    END IF;

    INSERT INTO public.direct_conversations (user1_id, user2_id)
    VALUES (uid1, uid2)
    ON CONFLICT (user1_id, user2_id) DO UPDATE SET updated_at = now()
    RETURNING id INTO conv_id;

    RETURN conv_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- ── privacy_ledger_entries ─────────────────────────────────────────
DROP POLICY IF EXISTS "privacy_ledger_read_own" ON public.privacy_ledger_entries;
CREATE POLICY "privacy_ledger_read_own"
    ON public.privacy_ledger_entries FOR SELECT
    USING (get_my_id() = user_id);

DROP POLICY IF EXISTS "privacy_ledger_insert_own" ON public.privacy_ledger_entries;
CREATE POLICY "privacy_ledger_insert_own"
    ON public.privacy_ledger_entries FOR INSERT
    WITH CHECK (get_my_id() = user_id);

-- ── student_observations ───────────────────────────────────────────
DROP POLICY IF EXISTS "Teachers can view their own observations" ON public.student_observations;
CREATE POLICY "Teachers can view their own observations"
    ON public.student_observations FOR SELECT TO authenticated
    USING (get_my_id() = author_id);

DROP POLICY IF EXISTS "Teachers can insert their own non-finalized observations" ON public.student_observations;
CREATE POLICY "Teachers can insert their own non-finalized observations"
    ON public.student_observations FOR INSERT TO authenticated
    WITH CHECK (get_my_id() = author_id AND is_finalized = false);

DROP POLICY IF EXISTS "Teachers can update their own non-finalized observations" ON public.student_observations;
CREATE POLICY "Teachers can update their own non-finalized observations"
    ON public.student_observations FOR UPDATE TO authenticated
    USING (get_my_id() = author_id AND is_finalized = false)
    WITH CHECK (get_my_id() = author_id AND is_finalized = false);

DROP POLICY IF EXISTS "Teachers can delete their own non-finalized observations" ON public.student_observations;
CREATE POLICY "Teachers can delete their own non-finalized observations"
    ON public.student_observations FOR DELETE TO authenticated
    USING (get_my_id() = author_id AND is_finalized = false);

DROP POLICY IF EXISTS "Current teachers can view historical observations" ON public.student_observations;
CREATE POLICY "Current teachers can view historical observations"
    ON public.student_observations FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.classroom_students cs
            JOIN public.classrooms c ON c.id = cs.classroom_id
            WHERE cs.student_id = student_observations.student_id
              AND c.teacher_id = get_my_id()
        )
    );

DROP POLICY IF EXISTS "Principals can view all observations in their school" ON public.student_observations;
CREATE POLICY "Principals can view all observations in their school"
    ON public.student_observations FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = get_my_id()
              AND school_id = student_observations.school_id
              AND role IN ('principal', 'admin', 'founder')
        )
    );

DROP POLICY IF EXISTS "Students can view their own visible observations" ON public.student_observations;
CREATE POLICY "Students can view their own visible observations"
    ON public.student_observations FOR SELECT TO authenticated
    USING (get_my_id() = student_id AND is_visible_to_student = true);

-- ── community_group_members ────────────────────────────────────────
DROP POLICY IF EXISTS "group_members_management_v2" ON public.community_group_members;

-- Admins can perform all operations; regular members can read and manage their own
-- non-sensitive membership fields (e.g., status). Only admins may change role.
CREATE POLICY "group_members_read"
    ON public.community_group_members FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.community_group_members m
            WHERE m.group_id = community_group_members.group_id
              AND m.user_id = get_my_id()
              AND m.status = 'active'
        )
    );

CREATE POLICY "group_members_insert"
    ON public.community_group_members FOR INSERT
    WITH CHECK (
        -- Admins can add anyone to their group
        EXISTS (
            SELECT 1 FROM public.community_group_members a
            WHERE a.group_id = community_group_members.group_id
              AND a.user_id = get_my_id()
              AND a.role = 'admin'
              AND a.status = 'active'
        )
        -- Users can insert only their own row with a non-admin role,
        -- only into open groups, and only with pending/active status
        -- (prevents bypassing invite-only or approval-required join policies)
        OR (
            community_group_members.user_id = get_my_id()
            AND community_group_members.role != 'admin'
            AND community_group_members.status IN ('pending', 'active')
            AND EXISTS (
                SELECT 1 FROM public.community_groups g
                WHERE g.id = community_group_members.group_id
                  AND g.join_policy = 'open'
            )
        )
    );

CREATE POLICY "group_members_delete"
    ON public.community_group_members FOR DELETE
    USING (
        -- Admins can remove any member
        EXISTS (
            SELECT 1 FROM public.community_group_members a
            WHERE a.group_id = community_group_members.group_id
              AND a.user_id = get_my_id()
              AND a.role = 'admin'
              AND a.status = 'active'
        )
        -- Users can remove (leave) their own membership
        OR community_group_members.user_id = get_my_id()
    );

CREATE POLICY "group_members_update"
    ON public.community_group_members FOR UPDATE
    USING (
        -- Admins can update any member
        EXISTS (
            SELECT 1 FROM public.community_group_members a
            WHERE a.group_id = community_group_members.group_id
              AND a.user_id = get_my_id()
              AND a.role = 'admin'
              AND a.status = 'active'
        )
        -- Non-admin users can only update their own membership row
        OR community_group_members.user_id = get_my_id()
    )
    -- Admins may change any field.
    -- Non-admins: cannot self-promote to admin, cannot change group_id or user_id
    -- (pins them to the row they already own).
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.community_group_members a
            WHERE a.group_id = community_group_members.group_id
              AND a.user_id = get_my_id()
              AND a.role = 'admin'
              AND a.status = 'active'
        )
        OR (
            community_group_members.user_id = get_my_id()
            AND community_group_members.role != 'admin'
            -- Prevent moving membership to a different group or different user
            AND community_group_members.group_id = (
                SELECT m.group_id FROM public.community_group_members m
                WHERE m.id = community_group_members.id AND m.user_id = get_my_id()
            )
        )
    );

-- ── classrooms ─────────────────────────────────────────────────────
DROP POLICY IF EXISTS "classrooms_owner_all" ON public.classrooms;
CREATE POLICY "classrooms_owner_all"
    ON public.classrooms FOR ALL
    USING (get_my_id() = created_by OR get_my_id() = teacher_id)
    WITH CHECK (get_my_id() = created_by OR get_my_id() = teacher_id);
