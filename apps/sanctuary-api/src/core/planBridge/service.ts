/**
 * Plan & Bridge service: authorization + business rules for planning events
 * and scheduling calm notices. Transport-free (no oRPC), so it is unit-tested
 * with an in-memory repository and reused by the Inngest worker.
 *
 * Rules:
 * - Audience is a grade class (model A). Never a legacy classroom.
 * - Teachers act only for grade classes they are actively assigned to;
 *   school leaders act for every active grade class in their school.
 * - The release time comes from resolveSendTime() (one resolver, server-side).
 * - Overrides need a reason and are logged on the notice and in the event log.
 * - Fan-out happens in SQL (release_school_notice) to verified guardians only.
 */

import type {
  PlanEvent,
  PlanGradeClass,
  PlanNotice,
  PlanSettings,
  SchedulePreview,
} from '@repo/core/api/planBridge.orpc.contract';
import {
  MODE_LOCKS,
  type ModeEffects,
  type ModeLock,
  type SchoolModePolicy,
} from '@repo/core/logic/modes/catalog';
import { PROVISIONAL_MODE_DEFAULTS } from '@repo/core/logic/modes/provisionalDefaults';
import {
  canUseEmergencyLane,
  resolveSendTime,
  type SendTiming,
} from '@repo/core/logic/modes/resolveSendTime';
import {
  assertModeSchedule,
  DEFAULT_SCHOOL_TIMEZONE,
  everyDaySchedule,
  formatLocal,
  isValidTimeZone,
  sharedDailyInterval,
} from '@repo/core/logic/modes/schedule';
import type { EventRow, NoticeRow, PlanBridgeRepository, UsageEvent } from './repository';

export type PlanBridgeActor = {
  userId: string;
  schoolId: string | null | undefined;
  capacity: string | null | undefined;
};

export type PlanBridgeErrorCode = 'FORBIDDEN' | 'NOT_FOUND' | 'BAD_REQUEST' | 'CONFLICT';

export class PlanBridgeError extends Error {
  constructor(
    readonly code: PlanBridgeErrorCode,
    message: string,
    readonly data?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'PlanBridgeError';
  }
}

export type SchedulerPort = {
  noticeScheduled(input: {
    noticeId: string;
    schoolId: string;
    version: number;
    sendAt: Date;
  }): Promise<void>;
  noticeCancelled(input: { noticeId: string; schoolId: string }): Promise<void>;
};

export const LEADER_CAPACITIES = [
  'principal',
  'assistant_principal',
  'section_head',
  'grade_head',
  'admin',
];
export const SETTINGS_EDITORS = ['principal', 'assistant_principal', 'admin'];
export const GUARDIAN_VERIFIERS = ['principal', 'assistant_principal', 'admin'];
const IMMEDIATE_WINDOW_MS = 5_000;
const PAST_TOLERANCE_MS = 60_000;

const iso = (value: string | Date | null | undefined) =>
  value === null || value === undefined ? null : new Date(value).toISOString();
const isLeader = (capacity: string | null | undefined) =>
  LEADER_CAPACITIES.includes(capacity ?? '');

export function createPlanBridgeService(deps: {
  repo: PlanBridgeRepository;
  scheduler: SchedulerPort;
  now?: () => Date;
  log?: (event: string, detail: Record<string, unknown>) => void;
}) {
  const { repo, scheduler } = deps;
  const now = deps.now ?? (() => new Date());
  const log = deps.log ?? ((event, detail) => console.warn(JSON.stringify({ event, ...detail })));

  // Opt-in aggregate usage signal (counts only). Never blocks the user path.
  const usage = async (
    schoolId: string,
    modeKey: string,
    event: UsageEvent,
    capacity: string | null | undefined,
  ) => {
    try {
      await repo.bumpUsage({ schoolId, modeKey, event, capacity: capacity ?? null });
    } catch (error) {
      log('plan_bridge.usage_signal_failed', { error: String(error) });
    }
  };

  const schoolOf = (actor: PlanBridgeActor) => {
    if (!actor.schoolId) throw new PlanBridgeError('FORBIDDEN', 'Choose a school workspace first.');
    return actor.schoolId;
  };

  async function requireGradeClass(actor: PlanBridgeActor, gradeClassId: string) {
    const schoolId = schoolOf(actor);
    const gradeClass = await repo.findGradeClass(gradeClassId);
    // Same answer for "missing" and "other school": no cross-tenant probing.
    if (!gradeClass || gradeClass.school_id !== schoolId || gradeClass.status !== 'active') {
      throw new PlanBridgeError('NOT_FOUND', 'That class was not found in this school.');
    }
    if (isLeader(actor.capacity)) return gradeClass;
    if (
      actor.capacity === 'teacher' &&
      (await repo.isAssignedTeacher(gradeClassId, actor.userId))
    ) {
      return gradeClass;
    }
    throw new PlanBridgeError('FORBIDDEN', 'You can plan only for classes you teach.');
  }

  async function loadModes(schoolId: string) {
    const [school, rows] = await Promise.all([
      repo.getSchool(schoolId),
      repo.listModePolicies(schoolId),
    ]);
    if (!school) throw new PlanBridgeError('NOT_FOUND', 'School was not found.');
    const timezone =
      school.timezone && isValidTimeZone(school.timezone)
        ? school.timezone
        : DEFAULT_SCHOOL_TIMEZONE;
    const stored = rows.find((row) => row.mode_key === 'good_night');
    const provisional = PROVISIONAL_MODE_DEFAULTS.good_night;
    const goodNight: SchoolModePolicy = stored
      ? {
          modeKey: 'good_night',
          lock: (MODE_LOCKS as readonly string[]).includes(stored.lock)
            ? stored.lock
            : provisional.lock,
          schedule: stored.schedule,
          effects: { ...provisional.effects, ...(stored.effects as ModeEffects) },
          overrideRoles: stored.override_roles ?? [],
          overrideRateLimitPerDay: stored.override_rate_limit_per_day,
          isDefault: false,
        }
      : provisional;
    return {
      timezone,
      goodNight,
      policies: [goodNight],
      usageOptIn: school.usage_signal_opt_in === true,
    };
  }

  const toSettings = (
    actor: PlanBridgeActor,
    schoolId: string,
    modes: Awaited<ReturnType<typeof loadModes>>,
  ): PlanSettings => ({
    school_id: schoolId,
    timezone: modes.timezone,
    good_night: {
      mode_key: 'good_night',
      lock: modes.goodNight.lock,
      schedule: { weekly: [...modes.goodNight.schedule.weekly] },
      everyday: sharedDailyInterval(modes.goodNight.schedule),
      override_roles: [...modes.goodNight.overrideRoles],
      override_rate_limit_per_day: modes.goodNight.overrideRateLimitPerDay,
      provisional: modes.goodNight.isDefault,
    },
    usage_signal_opt_in: modes.usageOptIn,
    can_edit: SETTINGS_EDITORS.includes(actor.capacity ?? ''),
    can_override: canUseEmergencyLane(actor.capacity, modes.goodNight),
  });

  const toEvent = (row: EventRow): PlanEvent => {
    const startsAt = new Date(row.start_date);
    const due =
      row.notice_lead_days === null || row.notice_lead_days === undefined
        ? null
        : new Date(startsAt.getTime() - row.notice_lead_days * 86_400_000).toISOString();
    return {
      id: row.id,
      school_id: row.school_id,
      grade_class_id: row.grade_class_id,
      title: row.title,
      type: row.type,
      description: row.description,
      starts_at: startsAt.toISOString(),
      ends_at: iso(row.end_date),
      notice_lead_days: row.notice_lead_days,
      notice_due_at: due,
      created_by: row.created_by,
    };
  };

  const toNotice = (row: NoticeRow): PlanNotice => ({
    id: row.id,
    school_id: row.school_id,
    grade_class_id: row.grade_class_id,
    grade_class_name: row.grade_class_name,
    calendar_event_id: row.calendar_event_id,
    author_id: row.author_id,
    title: row.title,
    body: row.content,
    status: row.status,
    send_at: iso(row.send_at),
    sent_at: iso(row.sent_at),
    recipient_count: row.recipient_count === null ? null : Number(row.recipient_count),
    drafted_in_quiet_hours: row.drafted_in_quiet_hours === true,
    held_by_mode: row.held_by_mode ?? null,
    override_reason: row.override_reason,
    overridden_by: row.overridden_by,
    schedule_version: Number(row.schedule_version ?? 0),
    created_at: new Date(row.created_at).toISOString(),
  });

  async function visibleGradeClassIds(actor: PlanBridgeActor): Promise<string[] | null> {
    if (isLeader(actor.capacity)) return null; // whole school
    if (actor.capacity !== 'teacher')
      throw new PlanBridgeError('FORBIDDEN', 'Planning is for school staff.');
    const classes = await repo.listGradeClasses(schoolOf(actor), actor.userId);
    return classes.map((c) => c.id);
  }

  return {
    async listMyGradeClasses(actor: PlanBridgeActor): Promise<PlanGradeClass[]> {
      const schoolId = schoolOf(actor);
      if (isLeader(actor.capacity)) return repo.listGradeClasses(schoolId, null);
      if (actor.capacity === 'teacher') return repo.listGradeClasses(schoolId, actor.userId);
      throw new PlanBridgeError('FORBIDDEN', 'Planning is for school staff.');
    },

    async getSettings(actor: PlanBridgeActor): Promise<PlanSettings> {
      const schoolId = schoolOf(actor);
      return toSettings(actor, schoolId, await loadModes(schoolId));
    },

    async updateGoodNight(
      actor: PlanBridgeActor,
      input: {
        start: string;
        end: string;
        lock?: ModeLock;
        overrideRoles?: string[];
        overrideRateLimitPerDay?: number | null;
        timezone?: string;
      },
    ): Promise<PlanSettings> {
      const schoolId = schoolOf(actor);
      if (!SETTINGS_EDITORS.includes(actor.capacity ?? '')) {
        throw new PlanBridgeError(
          'FORBIDDEN',
          'Only the principal or an admin can change school quiet hours.',
        );
      }
      if (input.timezone && !isValidTimeZone(input.timezone)) {
        throw new PlanBridgeError('BAD_REQUEST', 'That timezone is not recognised.');
      }
      const schedule = everyDaySchedule({ start: input.start, end: input.end });
      try {
        assertModeSchedule(schedule);
      } catch (error) {
        throw new PlanBridgeError(
          'BAD_REQUEST',
          error instanceof Error ? error.message : 'Invalid schedule.',
        );
      }
      const current = await loadModes(schoolId);
      await repo.upsertModePolicy({
        schoolId,
        modeKey: 'good_night',
        schedule,
        lock: input.lock ?? current.goodNight.lock,
        effects: { ...current.goodNight.effects },
        overrideRoles: input.overrideRoles ?? current.goodNight.overrideRoles,
        overrideRateLimitPerDay:
          input.overrideRateLimitPerDay === undefined
            ? current.goodNight.overrideRateLimitPerDay
            : input.overrideRateLimitPerDay,
        actorId: actor.userId,
      });
      await usage(schoolId, 'good_night', 'policy_changed', actor.capacity);
      if (input.timezone) await repo.setSchoolTimezone(schoolId, input.timezone);
      return toSettings(actor, schoolId, await loadModes(schoolId));
    },

    async listEvents(
      actor: PlanBridgeActor,
      input: { gradeClassId?: string; from?: string },
    ): Promise<PlanEvent[]> {
      const schoolId = schoolOf(actor);
      let ids = await visibleGradeClassIds(actor);
      if (input.gradeClassId) {
        await requireGradeClass(actor, input.gradeClassId);
        ids = [input.gradeClassId];
      }
      const from = input.from ? new Date(input.from) : new Date(now().getTime() - 86_400_000);
      const rows = await repo.listEvents(schoolId, ids, from);
      return rows.map(toEvent);
    },

    async createEvent(
      actor: PlanBridgeActor,
      input: {
        gradeClassId: string;
        title: string;
        type: string;
        description?: string;
        startsAt: string;
        endsAt?: string;
        noticeLeadDays?: number;
      },
    ): Promise<PlanEvent> {
      const gradeClass = await requireGradeClass(actor, input.gradeClassId);
      const startsAt = new Date(input.startsAt);
      const endsAt = input.endsAt ? new Date(input.endsAt) : null;
      if (endsAt && endsAt < startsAt)
        throw new PlanBridgeError('BAD_REQUEST', 'The event ends before it starts.');
      const row = await repo.insertEvent({
        schoolId: gradeClass.school_id,
        gradeClassId: gradeClass.id,
        title: input.title.trim(),
        type: input.type,
        description: input.description?.trim() || null,
        startsAt,
        endsAt,
        noticeLeadDays: input.noticeLeadDays ?? null,
        createdBy: actor.userId,
      });
      return toEvent(row);
    },

    async previewNotice(
      actor: PlanBridgeActor,
      input: { gradeClassId: string; sendAt?: string | null },
    ): Promise<SchedulePreview> {
      const gradeClass = await requireGradeClass(actor, input.gradeClassId);
      const modes = await loadModes(gradeClass.school_id);
      const current = now();
      const requestedAt = input.sendAt ? new Date(input.sendAt) : current;
      const decision = resolveSendTime({
        requestedAt: requestedAt < current ? current : requestedAt,
        timezone: modes.timezone,
        policies: modes.policies,
        senderCapacity: actor.capacity,
        timing: 'next_allowed',
      });
      const suggestedAt = decision.ok ? decision.sendAt : decision.nextAllowedAt;
      return {
        timezone: modes.timezone,
        requested_at: requestedAt.toISOString(),
        requested_label: formatLocal(requestedAt, modes.timezone),
        in_quiet_hours: decision.ok ? decision.insideWindow : true,
        suggested_at: suggestedAt.toISOString(),
        suggested_label: formatLocal(suggestedAt, modes.timezone),
        window: decision.window,
        mode_key: decision.modeKey,
        lock: decision.modeKey ? modes.goodNight.lock : null,
        can_override: canUseEmergencyLane(actor.capacity, modes.goodNight),
        recipient_count: await repo.countRecipients(gradeClass.id),
      };
    },

    async scheduleNotice(
      actor: PlanBridgeActor,
      input: {
        noticeId?: string;
        gradeClassId: string;
        calendarEventId?: string | null;
        title: string;
        body: string;
        sendAt?: string | null;
        timing: SendTiming;
        overrideReason?: string;
      },
    ): Promise<PlanNotice> {
      const gradeClass = await requireGradeClass(actor, input.gradeClassId);
      const schoolId = gradeClass.school_id;
      const current = now();

      if (input.calendarEventId) {
        const event = await repo.findEvent(input.calendarEventId);
        if (
          !event ||
          event.school_id !== schoolId ||
          (event.grade_class_id && event.grade_class_id !== gradeClass.id)
        ) {
          throw new PlanBridgeError('BAD_REQUEST', 'That event does not belong to this class.');
        }
      }

      let requestedAt = input.sendAt ? new Date(input.sendAt) : current;
      if (requestedAt.getTime() < current.getTime() - PAST_TOLERANCE_MS) {
        throw new PlanBridgeError('BAD_REQUEST', 'That time has already passed.');
      }
      if (requestedAt < current) requestedAt = current;

      const modes = await loadModes(schoolId);
      const overridesUsedToday =
        input.timing === 'override'
          ? await repo.countOverridesSince(
              schoolId,
              actor.userId,
              new Date(current.getTime() - 86_400_000),
            )
          : 0;
      const decision = resolveSendTime({
        requestedAt,
        timezone: modes.timezone,
        policies: modes.policies,
        senderCapacity: actor.capacity,
        timing: input.timing,
        overrideReason: input.overrideReason,
        overridesUsedToday,
      });
      if (decision.ok === false) {
        const messages = {
          INSIDE_POLICY_WINDOW: `School quiet hours are on. Send at ${formatLocal(decision.nextAllowedAt, modes.timezone)}?`,
          OVERRIDE_NOT_ALLOWED: 'Your school has not enabled emergency sends for your role.',
          OVERRIDE_RATE_LIMITED: "You have used today's emergency sends. Ask the principal.",
          OVERRIDE_REASON_REQUIRED: 'Say why this cannot wait (at least 10 characters).',
        } as const;
        throw new PlanBridgeError('CONFLICT', messages[decision.code], {
          reason: decision.code,
          nextAllowedAt: decision.nextAllowedAt.toISOString(),
          nextAllowedLabel: formatLocal(decision.nextAllowedAt, modes.timezone),
        });
      }

      const write = {
        schoolId,
        gradeClassId: gradeClass.id,
        calendarEventId: input.calendarEventId ?? null,
        authorId: actor.userId,
        title: input.title.trim(),
        body: input.body.trim(),
        sendAt: decision.sendAt,
        draftedInQuietHours: decision.insideWindow,
        // Held = the window actually moved it (not: sent in a 'suggested' window or overridden).
        heldByMode:
          decision.insideWindow &&
          !decision.overridden &&
          decision.sendAt.getTime() > requestedAt.getTime()
            ? decision.modeKey
            : null,
        override: decision.overridden
          ? { reason: (input.overrideReason ?? '').trim(), by: actor.userId, at: current }
          : null,
      };

      let notice: NoticeRow;
      if (input.noticeId) {
        const existing = await repo.getNotice(input.noticeId);
        if (!existing || existing.school_id !== schoolId)
          throw new PlanBridgeError('NOT_FOUND', 'Notice not found.');
        if (existing.author_id !== actor.userId && !isLeader(actor.capacity)) {
          throw new PlanBridgeError(
            'FORBIDDEN',
            'Only the author or a school leader can change this notice.',
          );
        }
        if (existing.status !== 'scheduled') {
          throw new PlanBridgeError(
            'CONFLICT',
            'This notice has already gone out or was cancelled.',
          );
        }
        notice = await repo.rescheduleNotice(existing.id, write);
        await repo.logNoticeEvent({
          noticeId: notice.id,
          schoolId,
          actorId: actor.userId,
          event: 'rescheduled',
          detail: { version: notice.schedule_version },
        });
      } else {
        notice = await repo.insertNotice(write);
        await repo.logNoticeEvent({
          noticeId: notice.id,
          schoolId,
          actorId: actor.userId,
          event: 'created',
        });
      }
      if (write.override) {
        await repo.logNoticeEvent({
          noticeId: notice.id,
          schoolId,
          actorId: actor.userId,
          event: 'override',
          detail: {
            reason: write.override.reason,
            capacity: actor.capacity ?? null,
            mode_key: decision.modeKey,
            would_have_sent_at: decision.nextAllowedAt.toISOString(),
          },
        });
      }
      await repo.logNoticeEvent({
        noticeId: notice.id,
        schoolId,
        actorId: actor.userId,
        event: 'scheduled',
        detail: {
          send_at: decision.sendAt.toISOString(),
          timing: input.timing,
          inside_window: decision.insideWindow,
          held_by_mode: write.heldByMode,
        },
      });

      if (decision.modeKey) {
        await usage(
          schoolId,
          decision.modeKey,
          decision.overridden ? 'override' : write.heldByMode ? 'held' : 'sent_in_window',
          actor.capacity,
        );
      }

      const version = Number(notice.schedule_version ?? 0);
      if (decision.sendAt.getTime() <= current.getTime() + IMMEDIATE_WINDOW_MS) {
        await repo.releaseNotice(notice.id, version, current);
        notice = (await repo.getNotice(notice.id)) ?? notice;
      } else {
        try {
          await scheduler.noticeScheduled({
            noticeId: notice.id,
            schoolId,
            version,
            sendAt: decision.sendAt,
          });
        } catch (error) {
          // The sweep (Inngest cron + pg_cron) still releases it.
          log('plan_bridge.schedule_event_failed', { noticeId: notice.id, error: String(error) });
        }
      }
      return toNotice(notice);
    },

    async cancelNotice(actor: PlanBridgeActor, noticeId: string): Promise<PlanNotice> {
      const schoolId = schoolOf(actor);
      const existing = await repo.getNotice(noticeId);
      if (!existing || existing.school_id !== schoolId)
        throw new PlanBridgeError('NOT_FOUND', 'Notice not found.');
      if (existing.author_id !== actor.userId && !isLeader(actor.capacity)) {
        throw new PlanBridgeError(
          'FORBIDDEN',
          'Only the author or a school leader can cancel this notice.',
        );
      }
      const cancelled = await repo.cancelNotice(noticeId);
      if (!cancelled)
        throw new PlanBridgeError('CONFLICT', 'Only a scheduled notice can be cancelled.');
      await repo.logNoticeEvent({ noticeId, schoolId, actorId: actor.userId, event: 'cancelled' });
      try {
        await scheduler.noticeCancelled({ noticeId, schoolId });
      } catch (error) {
        log('plan_bridge.cancel_event_failed', { noticeId, error: String(error) });
      }
      return toNotice(cancelled);
    },

    async listNotices(
      actor: PlanBridgeActor,
      input: { gradeClassId?: string },
    ): Promise<PlanNotice[]> {
      const schoolId = schoolOf(actor);
      if (input.gradeClassId) {
        await requireGradeClass(actor, input.gradeClassId);
        return (await repo.listNotices(schoolId, [input.gradeClassId], null)).map(toNotice);
      }
      const ids = await visibleGradeClassIds(actor);
      return (await repo.listNotices(schoolId, ids, ids === null ? null : actor.userId)).map(
        toNotice,
      );
    },

    async verifyGuardianLink(
      actor: PlanBridgeActor,
      input: { relationshipId: string; decision: 'verified' | 'revoked' },
    ) {
      const schoolId = schoolOf(actor);
      if (!GUARDIAN_VERIFIERS.includes(actor.capacity ?? '')) {
        throw new PlanBridgeError(
          'FORBIDDEN',
          'Only the principal or an admin can verify guardians.',
        );
      }
      const link = await repo.findGuardianLink(input.relationshipId);
      if (!link || !(link.student_school_ids ?? []).includes(schoolId)) {
        throw new PlanBridgeError(
          'NOT_FOUND',
          'Guardian link not found for a student in this school.',
        );
      }
      if (link.guardian_id === actor.userId) {
        throw new PlanBridgeError('FORBIDDEN', 'You cannot verify your own guardian link.');
      }
      await repo.setGuardianLinkStatus(link.id, input.decision, actor.userId);
      return { id: link.id, verification_status: input.decision };
    },

    /** Worker entry points (Inngest + sweep). */
    releaseNotice: (noticeId: string, version: number | null) =>
      repo.releaseNotice(noticeId, version, now()),
    releaseDue: () => repo.releaseDue(now()),
  };
}

export type PlanBridgeService = ReturnType<typeof createPlanBridgeService>;
