import { z } from 'zod';

/**
 * Plan & Bridge (Calm Communication), first slice.
 * ADR: docs/decisions/2026-10-17-plan-and-bridge-calm-notices.md
 *
 * Audience is always a grade class (model A). Legacy classrooms are never an
 * audience. The server owns every release time: clients preview, the server
 * decides, so a device clock cannot bypass school quiet hours.
 */

const isoDateTime = z.string().datetime({ offset: true });
const hhmm = z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Use HH:MM (24-hour)');

export const noticeStatus = z.enum(['draft', 'scheduled', 'sent', 'failed', 'cancelled']);
export const noticeTiming = z.enum(['as_requested', 'next_allowed', 'override']);
export const calendarEventType = z.enum([
  'event',
  'exam',
  'holiday',
  'term_start',
  'term_end',
  'sports',
  'meeting',
  'other',
]);

const windowInterval = z.object({ start: hhmm, end: hhmm });

export const planGradeClass = z.object({
  id: z.string().uuid(),
  name: z.string(),
  school_id: z.string().uuid(),
  enrolled_count: z.number().int().nonnegative(),
  verified_guardian_count: z.number().int().nonnegative(),
});

export const modeLock = z.enum(['locked', 'suggested', 'off']);
const scheduleRule = z.object({ days: z.array(z.string()), start: hhmm, end: hhmm });

/** School quiet hours = the good_night mode policy (modes engine v0). */
export const planSettings = z.object({
  school_id: z.string().uuid(),
  timezone: z.string(),
  good_night: z.object({
    mode_key: z.literal('good_night'),
    lock: modeLock,
    schedule: z.object({ weekly: z.array(scheduleRule) }),
    everyday: windowInterval.nullable(),
    override_roles: z.array(z.string()),
    override_rate_limit_per_day: z.number().int().nullable(),
    /** true = no school row yet; values are provisional placeholders. */
    provisional: z.boolean(),
  }),
  usage_signal_opt_in: z.boolean(),
  can_edit: z.boolean(),
  can_override: z.boolean(),
});

export const planEvent = z.object({
  id: z.string().uuid(),
  school_id: z.string().uuid(),
  grade_class_id: z.string().uuid().nullable(),
  title: z.string(),
  type: z.string(),
  description: z.string().nullable(),
  starts_at: z.string(),
  ends_at: z.string().nullable(),
  notice_lead_days: z.number().int().nullable(),
  /** starts_at minus notice_lead_days, if set: the day a notice should go out. */
  notice_due_at: z.string().nullable(),
  created_by: z.string().uuid().nullable(),
});

export const schedulePreview = z.object({
  timezone: z.string(),
  requested_at: z.string(),
  requested_label: z.string(),
  in_quiet_hours: z.boolean(),
  suggested_at: z.string(),
  suggested_label: z.string(),
  window: windowInterval.nullable(),
  mode_key: z.string().nullable(),
  lock: modeLock.nullable(),
  can_override: z.boolean(),
  recipient_count: z.number().int().nonnegative(),
});

export const planNotice = z.object({
  id: z.string().uuid(),
  school_id: z.string().uuid(),
  grade_class_id: z.string().uuid().nullable(),
  grade_class_name: z.string().nullable(),
  calendar_event_id: z.string().uuid().nullable(),
  author_id: z.string().uuid().nullable(),
  title: z.string(),
  body: z.string(),
  status: noticeStatus,
  send_at: z.string().nullable(),
  sent_at: z.string().nullable(),
  recipient_count: z.number().int().nullable(),
  drafted_in_quiet_hours: z.boolean(),
  held_by_mode: z.string().nullable(),
  override_reason: z.string().nullable(),
  overridden_by: z.string().uuid().nullable(),
  schedule_version: z.number().int(),
  created_at: z.string(),
});

const calendarRead = { policy: { action: 'read', subject: 'Calendar' } } as const;
const calendarCreate = { policy: { action: 'create', subject: 'Calendar' } } as const;
const calendarUpdate = { policy: { action: 'update', subject: 'Calendar' } } as const;
const noticeRead = { policy: { action: 'read', subject: 'Announcement' } } as const;
const noticeCreate = { policy: { action: 'create', subject: 'Announcement' } } as const;
const noticeUpdate = { policy: { action: 'update', subject: 'Announcement' } } as const;
const guardianUpdate = { policy: { action: 'update', subject: 'Guardian' } } as const;

export const planBridgeORPCContract = {
  listMyGradeClasses: {
    method: 'get',
    path: '/plan/grade-classes',
    request: {},
    responses: {
      200: {
        schema: z.array(planGradeClass),
        description: 'Grade classes the caller can plan for',
      },
    },
    metadata: calendarRead,
  },
  getSettings: {
    method: 'get',
    path: '/plan/settings',
    request: {},
    responses: { 200: { schema: planSettings, description: 'School timezone and quiet hours' } },
    metadata: calendarRead,
  },
  updateQuietHours: {
    method: 'post',
    path: '/plan/settings/quiet-hours',
    request: {
      body: z.strictObject({
        start: hhmm,
        end: hhmm,
        lock: modeLock.optional(),
        overrideRoles: z.array(z.string().min(1).max(40)).max(10).optional(),
        overrideRateLimitPerDay: z.number().int().min(0).max(50).nullable().optional(),
        timezone: z.string().min(1).max(64).optional(),
      }),
    },
    responses: { 200: { schema: planSettings, description: 'Updated settings' } },
    metadata: calendarUpdate,
  },
  listEvents: {
    method: 'get',
    path: '/plan/events',
    request: {
      query: z.strictObject({
        gradeClassId: z.string().uuid().optional(),
        from: isoDateTime.optional(),
      }),
    },
    responses: { 200: { schema: z.array(planEvent), description: 'Upcoming plan events' } },
    metadata: calendarRead,
  },
  createEvent: {
    method: 'post',
    path: '/plan/events',
    request: {
      body: z.strictObject({
        gradeClassId: z.string().uuid(),
        title: z.string().trim().min(2).max(140),
        type: calendarEventType,
        description: z.string().trim().max(1000).optional(),
        startsAt: isoDateTime,
        endsAt: isoDateTime.optional(),
        noticeLeadDays: z.number().int().min(0).max(60).optional(),
      }),
    },
    responses: { 201: { schema: planEvent, description: 'Created event' } },
    metadata: calendarCreate,
  },
  previewNotice: {
    method: 'post',
    path: '/plan/notices/preview',
    request: {
      body: z.strictObject({
        gradeClassId: z.string().uuid(),
        sendAt: isoDateTime.nullable().optional(),
      }),
    },
    responses: { 200: { schema: schedulePreview, description: 'When the notice would go out' } },
    metadata: noticeRead,
  },
  scheduleNotice: {
    method: 'post',
    path: '/plan/notices',
    request: {
      body: z.strictObject({
        noticeId: z.string().uuid().optional(),
        gradeClassId: z.string().uuid(),
        calendarEventId: z.string().uuid().nullable().optional(),
        title: z.string().trim().min(2).max(140),
        body: z.string().trim().min(2).max(2000),
        /** Omit or null for "as soon as allowed". */
        sendAt: isoDateTime.nullable().optional(),
        timing: noticeTiming,
        overrideReason: z.string().trim().min(10).max(500).optional(),
      }),
    },
    responses: { 201: { schema: planNotice, description: 'Scheduled (or sent) notice' } },
    metadata: noticeCreate,
  },
  cancelNotice: {
    method: 'post',
    path: '/plan/notices/cancel',
    request: { body: z.strictObject({ noticeId: z.string().uuid() }) },
    responses: { 200: { schema: planNotice, description: 'Cancelled notice' } },
    metadata: noticeUpdate,
  },
  listNotices: {
    method: 'get',
    path: '/plan/notices',
    request: {
      query: z.strictObject({ gradeClassId: z.string().uuid().optional() }),
    },
    responses: { 200: { schema: z.array(planNotice), description: 'Scheduled and sent notices' } },
    metadata: noticeRead,
  },
  verifyGuardianLink: {
    method: 'post',
    path: '/plan/guardian-links/verify',
    request: {
      body: z.strictObject({
        relationshipId: z.string().uuid(),
        decision: z.enum(['verified', 'revoked']),
      }),
    },
    responses: {
      200: {
        schema: z.object({
          id: z.string().uuid(),
          verification_status: z.enum(['pending', 'verified', 'revoked']),
        }),
        description: 'Updated guardian link',
      },
    },
    metadata: guardianUpdate,
  },
};

export type PlanGradeClass = z.infer<typeof planGradeClass>;
export type PlanSettings = z.infer<typeof planSettings>;
export type PlanEvent = z.infer<typeof planEvent>;
export type SchedulePreview = z.infer<typeof schedulePreview>;
export type PlanNotice = z.infer<typeof planNotice>;
export type NoticeTiming = z.infer<typeof noticeTiming>;
export type CalendarEventType = z.infer<typeof calendarEventType>;
