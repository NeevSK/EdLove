/**
 * Plan & Bridge persistence. Parameterized SQL over the server pool.
 *
 * The pool bypasses RLS, so every read and write here is scoped by school (and
 * by grade class or author) explicitly. Authorization decisions live in
 * service.ts; this file only fetches and stores.
 */
import type { ModeSchedule } from '@repo/core/logic/modes/schedule';

export type SqlPort = <T>(query: string, parameters?: readonly unknown[]) => Promise<T[]>;

export type GradeClassRow = {
  id: string;
  name: string;
  school_id: string;
  enrolled_count: number;
  verified_guardian_count: number;
};

export type SchoolRow = {
  school_id: string;
  timezone: string | null;
  usage_signal_opt_in: boolean | null;
};

export type ModePolicyRow = {
  mode_key: string;
  lock: 'locked' | 'suggested' | 'off';
  schedule: ModeSchedule;
  effects: Record<string, unknown>;
  override_roles: string[];
  override_rate_limit_per_day: number | null;
  version: number;
};

export type UsageEvent = 'held' | 'sent_in_window' | 'override' | 'policy_changed';

export type EventRow = {
  id: string;
  school_id: string;
  grade_class_id: string | null;
  title: string;
  type: string;
  description: string | null;
  start_date: string | Date;
  end_date: string | Date | null;
  notice_lead_days: number | null;
  created_by: string | null;
};

export type NoticeRow = {
  id: string;
  school_id: string;
  grade_class_id: string | null;
  grade_class_name: string | null;
  calendar_event_id: string | null;
  author_id: string | null;
  title: string;
  content: string;
  status: 'draft' | 'scheduled' | 'sent' | 'failed' | 'cancelled';
  send_at: string | Date | null;
  sent_at: string | Date | null;
  recipient_count: number | null;
  drafted_in_quiet_hours: boolean;
  held_by_mode: string | null;
  override_reason: string | null;
  overridden_by: string | null;
  schedule_version: number;
  created_at: string | Date;
};

export type NoticeWrite = {
  schoolId: string;
  gradeClassId: string;
  calendarEventId: string | null;
  authorId: string;
  title: string;
  body: string;
  sendAt: Date;
  draftedInQuietHours: boolean;
  heldByMode: string | null;
  override: { reason: string; by: string; at: Date } | null;
};

export type NoticeEventKind =
  | 'created'
  | 'scheduled'
  | 'rescheduled'
  | 'override'
  | 'cancelled'
  | 'released'
  | 'failed';

export type GuardianLinkRow = {
  id: string;
  student_id: string;
  guardian_id: string;
  verification_status: 'pending' | 'verified' | 'revoked';
  student_school_ids: string[] | null;
};

export interface PlanBridgeRepository {
  listGradeClasses(schoolId: string, teacherId: string | null): Promise<GradeClassRow[]>;
  isAssignedTeacher(gradeClassId: string, teacherId: string): Promise<boolean>;
  findGradeClass(
    gradeClassId: string,
  ): Promise<{ id: string; school_id: string; name: string; status: string } | null>;
  countRecipients(gradeClassId: string): Promise<number>;
  getSchool(schoolId: string): Promise<SchoolRow | null>;
  listModePolicies(schoolId: string): Promise<ModePolicyRow[]>;
  upsertModePolicy(input: {
    schoolId: string;
    modeKey: 'good_night';
    schedule: ModeSchedule;
    lock: 'locked' | 'suggested' | 'off';
    effects: Record<string, unknown>;
    overrideRoles: readonly string[];
    overrideRateLimitPerDay: number | null;
    actorId: string;
  }): Promise<void>;
  countOverridesSince(schoolId: string, actorId: string, since: Date): Promise<number>;
  /** No-op unless the school opted in (checked in SQL). Aggregate counts only. */
  bumpUsage(input: {
    schoolId: string;
    modeKey: string;
    event: UsageEvent;
    capacity: string | null;
  }): Promise<void>;
  setSchoolTimezone(schoolId: string, timezone: string): Promise<void>;
  insertEvent(input: {
    schoolId: string;
    gradeClassId: string;
    title: string;
    type: string;
    description: string | null;
    startsAt: Date;
    endsAt: Date | null;
    noticeLeadDays: number | null;
    createdBy: string;
  }): Promise<EventRow>;
  listEvents(schoolId: string, gradeClassIds: string[] | null, from: Date): Promise<EventRow[]>;
  findEvent(eventId: string): Promise<EventRow | null>;
  getNotice(noticeId: string): Promise<NoticeRow | null>;
  insertNotice(input: NoticeWrite): Promise<NoticeRow>;
  rescheduleNotice(noticeId: string, input: NoticeWrite): Promise<NoticeRow>;
  cancelNotice(noticeId: string): Promise<NoticeRow | null>;
  listNotices(
    schoolId: string,
    gradeClassIds: string[] | null,
    authorId: string | null,
  ): Promise<NoticeRow[]>;
  logNoticeEvent(input: {
    noticeId: string;
    schoolId: string;
    actorId: string | null;
    event: NoticeEventKind;
    detail?: Record<string, unknown>;
  }): Promise<void>;
  releaseNotice(
    noticeId: string,
    expectedVersion: number | null,
    now?: Date,
  ): Promise<{ outcome: string; recipients: number }>;
  releaseDue(now?: Date): Promise<number>;
  findGuardianLink(relationshipId: string): Promise<GuardianLinkRow | null>;
  setGuardianLinkStatus(
    relationshipId: string,
    status: 'verified' | 'revoked',
    actorId: string,
  ): Promise<void>;
}

const ACTIVE_ENROLLMENT = `e.status = 'active' AND e.effective_from <= now() AND (e.effective_to IS NULL OR e.effective_to >= now())`;
const ACTIVE_ASSIGNMENT = `a.status = 'active' AND a.effective_from <= now() AND (a.effective_to IS NULL OR a.effective_to >= now())`;

const NOTICE_COLUMNS = `
  n.id, n.school_id, n.grade_class_id, gc.name AS grade_class_name, n.calendar_event_id, n.author_id,
  n.title, n.content, n.status, n.send_at, n.sent_at, n.recipient_count, n.drafted_in_quiet_hours, n.held_by_mode,
  n.override_reason, n.overridden_by, n.schedule_version, n.created_at`;

export function createSqlPlanBridgeRepository(sql: SqlPort): PlanBridgeRepository {
  const one = async <T>(query: string, params: readonly unknown[]) =>
    (await sql<T>(query, params))[0] ?? null;
  const noticeById = (id: string) =>
    one<NoticeRow>(
      `SELECT ${NOTICE_COLUMNS} FROM public.announcements n
         LEFT JOIN public.grade_classes gc ON gc.id = n.grade_class_id
        WHERE n.id = $1::uuid`,
      [id],
    );

  return {
    async listGradeClasses(schoolId, teacherId) {
      const rows = await sql<GradeClassRow>(
        `SELECT c.id, c.name, c.school_id,
                (SELECT count(*)::int FROM public.student_grade_class_enrollments e
                  WHERE e.grade_class_id = c.id AND ${ACTIVE_ENROLLMENT}) AS enrolled_count,
                (SELECT count(DISTINCT g.guardian_id)::int FROM public.student_grade_class_enrollments e
                   JOIN public.student_guardian_relationships g
                     ON g.student_id = e.student_id AND g.verification_status = 'verified'
                  WHERE e.grade_class_id = c.id AND ${ACTIVE_ENROLLMENT}) AS verified_guardian_count
           FROM public.grade_classes c
          WHERE c.school_id = $1::uuid AND c.status = 'active'
            AND ($2::uuid IS NULL OR EXISTS (
                  SELECT 1 FROM public.grade_class_teacher_assignments a
                   WHERE a.grade_class_id = c.id AND a.teacher_id = $2::uuid AND ${ACTIVE_ASSIGNMENT}))
          ORDER BY c.name`,
        [schoolId, teacherId],
      );
      return rows.map((r) => ({
        ...r,
        enrolled_count: Number(r.enrolled_count),
        verified_guardian_count: Number(r.verified_guardian_count),
      }));
    },
    async isAssignedTeacher(gradeClassId, teacherId) {
      const row = await one<{ ok: boolean }>(
        `SELECT EXISTS (SELECT 1 FROM public.grade_class_teacher_assignments a
                         WHERE a.grade_class_id = $1::uuid AND a.teacher_id = $2::uuid AND ${ACTIVE_ASSIGNMENT}) AS ok`,
        [gradeClassId, teacherId],
      );
      return row?.ok === true;
    },
    findGradeClass(gradeClassId) {
      return one(
        `SELECT id, school_id, name, status FROM public.grade_classes WHERE id = $1::uuid`,
        [gradeClassId],
      );
    },
    async countRecipients(gradeClassId) {
      const row = await one<{ n: number }>(
        `SELECT count(DISTINCT g.guardian_id)::int AS n
           FROM public.student_grade_class_enrollments e
           JOIN public.student_guardian_relationships g
             ON g.student_id = e.student_id AND g.verification_status = 'verified'
          WHERE e.grade_class_id = $1::uuid AND ${ACTIVE_ENROLLMENT}`,
        [gradeClassId],
      );
      return Number(row?.n ?? 0);
    },
    getSchool(schoolId) {
      return one<SchoolRow>(
        `SELECT id AS school_id, timezone, usage_signal_opt_in FROM public.schools WHERE id = $1::uuid`,
        [schoolId],
      );
    },
    listModePolicies(schoolId) {
      return sql<ModePolicyRow>(
        `SELECT mode_key, lock, schedule, effects, override_roles, override_rate_limit_per_day, version
           FROM public.school_mode_policies WHERE school_id = $1::uuid ORDER BY mode_key`,
        [schoolId],
      );
    },
    async upsertModePolicy(input) {
      await sql(
        `INSERT INTO public.school_mode_policies
           (school_id, mode_key, lock, schedule, effects, override_roles, override_rate_limit_per_day, created_by, updated_by)
         VALUES ($1::uuid, $2, $3, $4::jsonb, $5::jsonb, $6::text[], $7, $8::uuid, $8::uuid)
         ON CONFLICT (school_id, mode_key)
         DO UPDATE SET lock = EXCLUDED.lock, schedule = EXCLUDED.schedule, effects = EXCLUDED.effects,
                       override_roles = EXCLUDED.override_roles,
                       override_rate_limit_per_day = EXCLUDED.override_rate_limit_per_day,
                       updated_by = EXCLUDED.updated_by, version = school_mode_policies.version + 1, updated_at = now()`,
        [
          input.schoolId,
          input.modeKey,
          input.lock,
          JSON.stringify(input.schedule),
          JSON.stringify(input.effects),
          [...input.overrideRoles],
          input.overrideRateLimitPerDay,
          input.actorId,
        ],
      );
    },
    async countOverridesSince(schoolId, actorId, since) {
      const row = await one<{ n: number }>(
        `SELECT count(*)::int AS n FROM public.school_notice_events
          WHERE school_id = $1::uuid AND actor_id = $2::uuid AND event = 'override' AND created_at >= $3::timestamptz`,
        [schoolId, actorId, since.toISOString()],
      );
      return Number(row?.n ?? 0);
    },
    async bumpUsage({ schoolId, modeKey, event, capacity }) {
      await sql(`SELECT public.bump_school_mode_usage($1::uuid, $2, $3, $4)`, [
        schoolId,
        modeKey,
        event,
        capacity ?? 'unknown',
      ]);
    },
    async setSchoolTimezone(schoolId, timezone) {
      await sql(`UPDATE public.schools SET timezone = $2 WHERE id = $1::uuid`, [
        schoolId,
        timezone,
      ]);
    },
    async insertEvent(input) {
      const row = await one<EventRow>(
        `INSERT INTO public.calendar_events
           (school_id, grade_class_id, title, type, description, start_date, end_date, notice_lead_days, is_public, created_by)
         VALUES ($1::uuid, $2::uuid, $3, $4, $5, $6::timestamptz, $7::timestamptz, $8, false, $9::uuid)
         RETURNING id, school_id, grade_class_id, title, type, description, start_date, end_date, notice_lead_days, created_by`,
        [
          input.schoolId,
          input.gradeClassId,
          input.title,
          input.type,
          input.description,
          input.startsAt.toISOString(),
          input.endsAt?.toISOString() ?? null,
          input.noticeLeadDays,
          input.createdBy,
        ],
      );
      if (!row) throw new Error('calendar event insert returned no row');
      return row;
    },
    listEvents(schoolId, gradeClassIds, from) {
      return sql<EventRow>(
        `SELECT id, school_id, grade_class_id, title, type, description, start_date, end_date, notice_lead_days, created_by
           FROM public.calendar_events
          WHERE school_id = $1::uuid
            AND COALESCE(end_date, start_date) >= $2::timestamptz
            AND (grade_class_id IS NULL OR $3::uuid[] IS NULL OR grade_class_id = ANY ($3::uuid[]))
          ORDER BY start_date
          LIMIT 100`,
        [schoolId, from.toISOString(), gradeClassIds],
      );
    },
    findEvent(eventId) {
      return one<EventRow>(
        `SELECT id, school_id, grade_class_id, title, type, description, start_date, end_date, notice_lead_days, created_by
           FROM public.calendar_events WHERE id = $1::uuid`,
        [eventId],
      );
    },
    getNotice: noticeById,
    async insertNotice(input) {
      const row = await one<{ id: string }>(
        `INSERT INTO public.announcements
           (school_id, author_id, title, content, is_pinned, audience_scope, grade_class_id, status, send_at,
            calendar_event_id, drafted_in_quiet_hours, override_reason, overridden_by, overridden_at, held_by_mode)
         VALUES ($1::uuid, $2::uuid, $3, $4, false, 'grade_class', $5::uuid, 'scheduled', $6::timestamptz,
                 $7::uuid, $8, $9, $10::uuid, $11::timestamptz, $12)
         RETURNING id`,
        [
          input.schoolId,
          input.authorId,
          input.title,
          input.body,
          input.gradeClassId,
          input.sendAt.toISOString(),
          input.calendarEventId,
          input.draftedInQuietHours,
          input.override?.reason ?? null,
          input.override?.by ?? null,
          input.override?.at.toISOString() ?? null,
          input.heldByMode,
        ],
      );
      const notice = row ? await noticeById(row.id) : null;
      if (!notice) throw new Error('notice insert returned no row');
      return notice;
    },
    async rescheduleNotice(noticeId, input) {
      const row = await one<{ id: string }>(
        `UPDATE public.announcements
            SET title = $2, content = $3, grade_class_id = $4::uuid, send_at = $5::timestamptz,
                calendar_event_id = $6::uuid, drafted_in_quiet_hours = $7,
                override_reason = $8, overridden_by = $9::uuid, overridden_at = $10::timestamptz,
                held_by_mode = $11, status = 'scheduled', schedule_version = schedule_version + 1, updated_at = now()
          WHERE id = $1::uuid AND status = 'scheduled'
          RETURNING id`,
        [
          noticeId,
          input.title,
          input.body,
          input.gradeClassId,
          input.sendAt.toISOString(),
          input.calendarEventId,
          input.draftedInQuietHours,
          input.override?.reason ?? null,
          input.override?.by ?? null,
          input.override?.at.toISOString() ?? null,
          input.heldByMode,
        ],
      );
      const notice = row ? await noticeById(row.id) : null;
      if (!notice) throw new Error('notice is no longer scheduled');
      return notice;
    },
    async cancelNotice(noticeId) {
      const row = await one<{ id: string }>(
        `UPDATE public.announcements
            SET status = 'cancelled', schedule_version = schedule_version + 1, updated_at = now()
          WHERE id = $1::uuid AND status = 'scheduled'
          RETURNING id`,
        [noticeId],
      );
      return row ? noticeById(row.id) : null;
    },
    listNotices(schoolId, gradeClassIds, authorId) {
      return sql<NoticeRow>(
        `SELECT ${NOTICE_COLUMNS} FROM public.announcements n
           LEFT JOIN public.grade_classes gc ON gc.id = n.grade_class_id
          WHERE n.school_id = $1::uuid AND n.audience_scope = 'grade_class'
            AND (($2::uuid[] IS NULL AND $3::uuid IS NULL)
                 OR n.grade_class_id = ANY (COALESCE($2::uuid[], ARRAY[]::uuid[]))
                 OR n.author_id = $3::uuid)
          ORDER BY COALESCE(n.send_at, n.created_at) DESC
          LIMIT 100`,
        [schoolId, gradeClassIds, authorId],
      );
    },
    async logNoticeEvent({ noticeId, schoolId, actorId, event, detail }) {
      await sql(
        `INSERT INTO public.school_notice_events (notice_id, school_id, actor_id, event, detail)
         VALUES ($1::uuid, $2::uuid, $3::uuid, $4, $5::jsonb)`,
        [noticeId, schoolId, actorId, event, JSON.stringify(detail ?? {})],
      );
    },
    async releaseNotice(noticeId, expectedVersion, now = new Date()) {
      const row = await one<{ outcome: string; recipients: number }>(
        `SELECT outcome, recipients FROM public.release_school_notice($1::uuid, $2::int, $3::timestamptz)`,
        [noticeId, expectedVersion, now.toISOString()],
      );
      return { outcome: row?.outcome ?? 'missing', recipients: Number(row?.recipients ?? 0) };
    },
    async releaseDue(now = new Date()) {
      const row = await one<{ n: number }>(
        `SELECT public.release_due_school_notices($1::timestamptz) AS n`,
        [now.toISOString()],
      );
      return Number(row?.n ?? 0);
    },
    findGuardianLink(relationshipId) {
      return one<GuardianLinkRow>(
        `SELECT g.id, g.student_id, g.guardian_id, g.verification_status,
                ARRAY(SELECT DISTINCT e.school_id FROM public.student_grade_class_enrollments e
                       WHERE e.student_id = g.student_id AND ${ACTIVE_ENROLLMENT}) AS student_school_ids
           FROM public.student_guardian_relationships g WHERE g.id = $1::uuid`,
        [relationshipId],
      );
    },
    async setGuardianLinkStatus(relationshipId, status, actorId) {
      await sql(
        `UPDATE public.student_guardian_relationships
            SET verification_status = $2,
                verified_by = CASE WHEN $2 = 'verified' THEN $3::uuid ELSE verified_by END,
                verified_at = CASE WHEN $2 = 'verified' THEN now() ELSE verified_at END
          WHERE id = $1::uuid`,
        [relationshipId, status, actorId],
      );
    },
  };
}
