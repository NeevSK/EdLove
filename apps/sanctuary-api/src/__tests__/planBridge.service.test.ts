import { describe, expect, it, vi } from 'vitest';
import type { ModePolicyRow, NoticeRow, PlanBridgeRepository } from '../core/planBridge/repository';
import {
  createPlanBridgeService,
  type PlanBridgeActor,
  PlanBridgeError,
} from '../core/planBridge/service';

const SCHOOL = '11111111-1111-4111-8111-111111111111';
const OTHER_SCHOOL = '22222222-2222-4222-8222-222222222222';
const CLASS = '33333333-3333-4333-8333-333333333333';
const OTHER_CLASS = '44444444-4444-4444-8444-444444444444';
const TEACHER = '55555555-5555-4555-8555-555555555555';
const PRINCIPAL = '66666666-6666-4666-8666-666666666666';
const teacher: PlanBridgeActor = { userId: TEACHER, schoolId: SCHOOL, capacity: 'teacher' };
const principal: PlanBridgeActor = { userId: PRINCIPAL, schoolId: SCHOOL, capacity: 'principal' };

// Sat 17 Oct 2026, 21:40 Asia/Colombo
const NIGHT = new Date('2026-10-17T16:10:00Z');
const NEXT_MORNING = '2026-10-18T01:00:00.000Z';
// Sat 17 Oct 2026, 10:30 Asia/Colombo
const DAY = new Date('2026-10-17T05:00:00Z');

const BASE_GOOD_NIGHT_POLICY: ModePolicyRow = {
  mode_key: 'good_night',
  lock: 'locked',
  schedule: {
    weekly: [
      {
        days: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
        start: '20:00',
        end: '06:30',
      },
    ],
  },
  effects: { holdStaffNotices: true },
  override_roles: ['principal', 'admin'],
  override_rate_limit_per_day: 2,
  version: 1,
};

function memoryRepo(overrides: Partial<PlanBridgeRepository> = {}, withSchoolRow = true) {
  const notices = new Map<string, NoticeRow>();
  const events: {
    noticeId: string;
    event: string;
    detail?: Record<string, unknown>;
    actorId: string | null;
  }[] = [];
  // Tests pin a school row so they never depend on provisional defaults.
  const modePolicies: ModePolicyRow[] = withSchoolRow ? [BASE_GOOD_NIGHT_POLICY] : [];
  const usage: { event: string; capacity: string | null }[] = [];
  let overridesToday = 0;
  let seq = 0;
  const gradeClasses: Record<
    string,
    { id: string; school_id: string; name: string; status: string }
  > = {
    [CLASS]: { id: CLASS, school_id: SCHOOL, name: 'Grade 6 A', status: 'active' },
    [OTHER_CLASS]: {
      id: OTHER_CLASS,
      school_id: OTHER_SCHOOL,
      name: 'Grade 6 B',
      status: 'active',
    },
  };
  const released: { id: string; version: number | null }[] = [];
  const repo: PlanBridgeRepository = {
    listGradeClasses: async (_s, teacherId) =>
      teacherId === TEACHER || teacherId === null
        ? [
            {
              id: CLASS,
              name: 'Grade 6 A',
              school_id: SCHOOL,
              enrolled_count: 30,
              verified_guardian_count: 12,
            },
          ]
        : [],
    isAssignedTeacher: async (gc, t) => gc === CLASS && t === TEACHER,
    findGradeClass: async (id) => gradeClasses[id] ?? null,
    countRecipients: async () => 12,
    getSchool: async (id) =>
      id === SCHOOL
        ? { school_id: SCHOOL, timezone: 'Asia/Colombo', usage_signal_opt_in: true }
        : null,
    countOverridesSince: async () => overridesToday,
    bumpUsage: async (u) => {
      usage.push({ event: u.event, capacity: u.capacity });
    },
    listModePolicies: async () => modePolicies,
    upsertModePolicy: async (input) => {
      const row: ModePolicyRow = {
        mode_key: input.modeKey,
        lock: input.lock,
        schedule: input.schedule,
        effects: input.effects,
        override_roles: [...input.overrideRoles],
        override_rate_limit_per_day: input.overrideRateLimitPerDay,
        version: 1,
      };
      modePolicies.splice(0, modePolicies.length, row);
    },
    setSchoolTimezone: async () => {},
    insertEvent: async (input) => ({
      id: '77777777-7777-4777-8777-777777777777',
      school_id: input.schoolId,
      grade_class_id: input.gradeClassId,
      title: input.title,
      type: input.type,
      description: input.description,
      start_date: input.startsAt,
      end_date: input.endsAt,
      notice_lead_days: input.noticeLeadDays,
      created_by: input.createdBy,
    }),
    listEvents: async () => [],
    findEvent: async () => null,
    getNotice: async (id) => notices.get(id) ?? null,
    insertNotice: async (input) => {
      seq += 1;
      const id = `88888888-8888-4888-8888-${String(seq).padStart(12, '0')}`;
      const row: NoticeRow = {
        id,
        school_id: input.schoolId,
        grade_class_id: input.gradeClassId,
        grade_class_name: 'Grade 6 A',
        calendar_event_id: input.calendarEventId,
        author_id: input.authorId,
        title: input.title,
        content: input.body,
        status: 'scheduled',
        send_at: input.sendAt,
        sent_at: null,
        recipient_count: null,
        drafted_in_quiet_hours: input.draftedInQuietHours,
        held_by_mode: input.heldByMode,
        override_reason: input.override?.reason ?? null,
        overridden_by: input.override?.by ?? null,
        schedule_version: 0,
        created_at: new Date(),
      };
      notices.set(id, row);
      return row;
    },
    rescheduleNotice: async (id, input) => {
      const row = notices.get(id)!;
      const next = {
        ...row,
        send_at: input.sendAt,
        title: input.title,
        schedule_version: row.schedule_version + 1,
      };
      notices.set(id, next);
      return next;
    },
    cancelNotice: async (id) => {
      const row = notices.get(id);
      if (!row || row.status !== 'scheduled') return null;
      const next = {
        ...row,
        status: 'cancelled' as const,
        schedule_version: row.schedule_version + 1,
      };
      notices.set(id, next);
      return next;
    },
    listNotices: async () => [...notices.values()],
    logNoticeEvent: async (e) => {
      if (e.event === 'override') overridesToday += 1;
      events.push({ noticeId: e.noticeId, event: e.event, detail: e.detail, actorId: e.actorId });
    },
    releaseNotice: async (id, version) => {
      released.push({ id, version });
      const row = notices.get(id);
      if (row)
        notices.set(id, { ...row, status: 'sent', sent_at: new Date(), recipient_count: 12 });
      return { outcome: 'sent', recipients: 12 };
    },
    releaseDue: async () => 0,
    findGuardianLink: async () => null,
    listGuardianLinks: async () => [],
    setGuardianLinkStatus: async () => {},
    ...overrides,
  };
  return { repo, notices, events, released, modePolicies, usage };
}

function setup(at: Date, overrides: Partial<PlanBridgeRepository> = {}, withSchoolRow = true) {
  const mem = memoryRepo(overrides, withSchoolRow);
  const scheduler = {
    noticeScheduled: vi.fn(async () => {}),
    noticeCancelled: vi.fn(async () => {}),
  };
  const service = createPlanBridgeService({
    repo: mem.repo,
    scheduler,
    now: () => at,
    log: () => {},
  });
  return { ...mem, scheduler, service };
}

const compose = {
  gradeClassId: CLASS,
  title: 'Sports day kit',
  body: 'Please send white shoes and a water bottle on Friday.',
};

async function expectCode(promise: Promise<unknown>, code: string, reason?: string) {
  const error = await promise.then(
    () => null,
    (e) => e,
  );
  expect(error).toBeInstanceOf(PlanBridgeError);
  expect(error.code).toBe(code);
  if (reason) expect(error.data?.reason).toBe(reason);
  return error as PlanBridgeError;
}

describe('plan-and-bridge service', () => {
  describe('audience scoping (model A grade classes)', () => {
    it('lets an assigned teacher create an event with notice lead days', async () => {
      const { service } = setup(DAY);
      const event = await service.createEvent(teacher, {
        gradeClassId: CLASS,
        title: 'Sports day',
        type: 'sports',
        startsAt: '2026-10-23T03:00:00Z',
        noticeLeadDays: 3,
      });
      expect(event).toMatchObject({
        grade_class_id: CLASS,
        notice_lead_days: 3,
        notice_due_at: '2026-10-20T03:00:00.000Z',
      });
    });

    it('hides grade classes from another school and refuses unassigned teachers', async () => {
      const { service } = setup(DAY, { isAssignedTeacher: async () => false });
      await expectCode(
        service.createEvent(teacher, {
          ...compose,
          type: 'event',
          startsAt: DAY.toISOString(),
          gradeClassId: OTHER_CLASS,
        }),
        'NOT_FOUND',
      );
      await expectCode(
        service.scheduleNotice(teacher, { ...compose, timing: 'as_requested' }),
        'FORBIDDEN',
      );
    });

    it('keeps parents and students out of planning', async () => {
      const { service } = setup(DAY);
      await expectCode(
        service.listMyGradeClasses({ userId: 'p', schoolId: SCHOOL, capacity: 'parent' }),
        'FORBIDDEN',
      );
      await expectCode(
        service.scheduleNotice(
          { userId: 'p', schoolId: SCHOOL, capacity: 'student' },
          { ...compose, timing: 'as_requested' },
        ),
        'FORBIDDEN',
      );
    });
  });

  describe('quiet hours (good_night mode, school policy)', () => {
    it('previews the 06:30 suggestion and recipient count at 21:40', async () => {
      const { service } = setup(NIGHT);
      const preview = await service.previewNotice(teacher, { gradeClassId: CLASS });
      expect(preview).toMatchObject({
        in_quiet_hours: true,
        suggested_at: NEXT_MORNING,
        mode_key: 'good_night',
        lock: 'locked',
        can_override: false,
        recipient_count: 12,
      });
      expect(preview.suggested_label).toMatch(/6:30/);
    });

    it('refuses an as-requested send at 21:40 and names the next allowed time', async () => {
      const { service, notices } = setup(NIGHT);
      const error = await expectCode(
        service.scheduleNotice(teacher, { ...compose, timing: 'as_requested' }),
        'CONFLICT',
        'INSIDE_POLICY_WINDOW',
      );
      expect(error.data?.nextAllowedAt).toBe(NEXT_MORNING);
      expect(notices.size).toBe(0);
    });

    it('queues for 06:30 when the teacher accepts, and hands it to the scheduler', async () => {
      const { service, scheduler, events, released, usage } = setup(NIGHT);
      const notice = await service.scheduleNotice(teacher, { ...compose, timing: 'next_allowed' });
      expect(notice).toMatchObject({
        status: 'scheduled',
        send_at: NEXT_MORNING,
        held_by_mode: 'good_night',
        drafted_in_quiet_hours: true,
      });
      expect(scheduler.noticeScheduled).toHaveBeenCalledWith(
        expect.objectContaining({
          noticeId: notice.id,
          version: 0,
          sendAt: new Date(NEXT_MORNING),
        }),
      );
      expect(released).toEqual([]);
      expect(events.map((e) => e.event)).toEqual(['created', 'scheduled']);
      expect(usage).toEqual([{ event: 'held', capacity: 'teacher' }]);
    });

    it('uses provisional defaults (suggested, not locked) when the school has no row', async () => {
      const { service } = setup(NIGHT, {}, false);
      const settings = await service.getSettings(teacher);
      expect(settings.good_night).toMatchObject({ provisional: true, lock: 'suggested' });
      const notice = await service.scheduleNotice(teacher, { ...compose, timing: 'as_requested' });
      expect(notice).toMatchObject({
        status: 'sent',
        drafted_in_quiet_hours: true,
        held_by_mode: null,
      });
    });

    it('sends daytime notices at once through the idempotent release', async () => {
      const { service, scheduler, released } = setup(DAY);
      const notice = await service.scheduleNotice(teacher, { ...compose, timing: 'as_requested' });
      expect(notice.status).toBe('sent');
      expect(released).toHaveLength(1);
      expect(scheduler.noticeScheduled).not.toHaveBeenCalled();
    });

    it('rejects send times in the past', async () => {
      const { service } = setup(DAY);
      await expectCode(
        service.scheduleNotice(teacher, {
          ...compose,
          timing: 'as_requested',
          sendAt: '2026-10-16T05:00:00Z',
        }),
        'BAD_REQUEST',
      );
    });
  });

  describe('emergency override', () => {
    it('rate-limits emergency sends per person per day (school-configured)', async () => {
      const { service } = setup(NIGHT);
      const urgent = {
        ...compose,
        timing: 'override' as const,
        overrideReason: 'School closed tomorrow: flooding',
      };
      await service.scheduleNotice(principal, urgent);
      await service.scheduleNotice(principal, urgent);
      await expectCode(
        service.scheduleNotice(principal, urgent),
        'CONFLICT',
        'OVERRIDE_RATE_LIMITED',
      );
    });

    it('denies teachers unless the school allows it', async () => {
      const { service } = setup(NIGHT);
      await expectCode(
        service.scheduleNotice(teacher, {
          ...compose,
          timing: 'override',
          overrideReason: 'Bus breakdown tomorrow',
        }),
        'CONFLICT',
        'OVERRIDE_NOT_ALLOWED',
      );
    });

    it('requires a reason, then sends now and logs who, why and what it skipped', async () => {
      const { service, events } = setup(NIGHT);
      await expectCode(
        service.scheduleNotice(principal, { ...compose, timing: 'override' }),
        'CONFLICT',
        'OVERRIDE_REASON_REQUIRED',
      );
      const notice = await service.scheduleNotice(principal, {
        ...compose,
        timing: 'override',
        overrideReason: 'School closed tomorrow: flooding',
      });
      expect(notice).toMatchObject({
        status: 'sent',
        override_reason: 'School closed tomorrow: flooding',
        overridden_by: PRINCIPAL,
        held_by_mode: null,
      });
      const override = events.find((e) => e.event === 'override');
      expect(override).toMatchObject({
        actorId: PRINCIPAL,
        detail: {
          reason: 'School closed tomorrow: flooding',
          capacity: 'principal',
          mode_key: 'good_night',
          would_have_sent_at: NEXT_MORNING,
        },
      });
    });

    it('lets a teacher override when the school turned that on', async () => {
      const { service } = setup(NIGHT);
      await service.updateGoodNight(principal, {
        start: '20:00',
        end: '06:30',
        overrideRoles: ['principal', 'teacher'],
      });
      const notice = await service.scheduleNotice(teacher, {
        ...compose,
        timing: 'override',
        overrideReason: 'Bus breakdown tomorrow',
      });
      expect(notice.status).toBe('sent');
    });
  });

  describe('edits and cancellation', () => {
    it('reschedules by bumping the version (stale runs release nothing)', async () => {
      const { service, scheduler } = setup(NIGHT);
      const first = await service.scheduleNotice(teacher, { ...compose, timing: 'next_allowed' });
      const second = await service.scheduleNotice(teacher, {
        ...compose,
        noticeId: first.id,
        title: 'Sports day kit (updated)',
        timing: 'as_requested',
        sendAt: '2026-10-18T04:00:00Z',
      });
      expect(second.schedule_version).toBe(1);
      expect(scheduler.noticeScheduled).toHaveBeenLastCalledWith(
        expect.objectContaining({ version: 1 }),
      );
    });

    it('cancels only scheduled notices and tells the scheduler', async () => {
      const { service, scheduler } = setup(NIGHT);
      const notice = await service.scheduleNotice(teacher, { ...compose, timing: 'next_allowed' });
      expect((await service.cancelNotice(teacher, notice.id)).status).toBe('cancelled');
      expect(scheduler.noticeCancelled).toHaveBeenCalledOnce();
      await expectCode(service.cancelNotice(teacher, notice.id), 'CONFLICT');
    });

    it('keeps the notice when the scheduler is down (the sweep releases it)', async () => {
      const { service, scheduler } = setup(NIGHT);
      scheduler.noticeScheduled.mockRejectedValueOnce(new Error('inngest down'));
      const notice = await service.scheduleNotice(teacher, { ...compose, timing: 'next_allowed' });
      expect(notice.status).toBe('scheduled');
    });
  });

  describe('school settings', () => {
    it('lets only principal/admin change quiet hours, and validates the timezone', async () => {
      const { service } = setup(DAY);
      await expectCode(
        service.updateGoodNight(teacher, { start: '21:00', end: '06:00' }),
        'FORBIDDEN',
      );
      await expectCode(
        service.updateGoodNight(principal, { start: '21:00', end: '06:00', timezone: 'Mars/Base' }),
        'BAD_REQUEST',
      );
      const settings = await service.updateGoodNight(principal, { start: '21:00', end: '06:00' });
      expect(settings.good_night).toMatchObject({
        everyday: { start: '21:00', end: '06:00' },
        provisional: false,
        lock: 'locked',
      });
      const relaxed = await service.updateGoodNight(principal, {
        start: '21:00',
        end: '06:00',
        lock: 'suggested',
        overrideRateLimitPerDay: null,
      });
      expect(relaxed.good_night).toMatchObject({
        lock: 'suggested',
        override_rate_limit_per_day: null,
      });
    });

    it('falls back to the provisional default (20:00-06:30) when no row exists', async () => {
      const { service } = setup(DAY, {}, false);
      const settings = await service.getSettings(teacher);
      expect(settings).toMatchObject({
        timezone: 'Asia/Colombo',
        can_edit: false,
        good_night: { everyday: { start: '20:00', end: '06:30' }, provisional: true },
      });
    });
  });

  describe('guardian verification', () => {
    const link = {
      id: '99999999-9999-4999-8999-999999999999',
      student_id: 's',
      guardian_id: 'g',
      verification_status: 'pending' as const,
      student_school_ids: [SCHOOL],
    };

    it('lets a principal verify a guardian of a student in their school', async () => {
      const setStatus = vi.fn(async () => {});
      const { service } = setup(DAY, {
        findGuardianLink: async () => link,
        setGuardianLinkStatus: setStatus,
      });
      expect(
        await service.verifyGuardianLink(principal, {
          relationshipId: link.id,
          decision: 'verified',
        }),
      ).toEqual({
        id: link.id,
        verification_status: 'verified',
      });
      expect(setStatus).toHaveBeenCalledWith(link.id, 'verified', PRINCIPAL);
    });

    it('refuses teachers, other schools, and self-verification', async () => {
      const { service } = setup(DAY, { findGuardianLink: async () => link });
      await expectCode(
        service.verifyGuardianLink(teacher, { relationshipId: link.id, decision: 'verified' }),
        'FORBIDDEN',
      );
      await expectCode(
        service.verifyGuardianLink(
          { ...principal, schoolId: OTHER_SCHOOL },
          { relationshipId: link.id, decision: 'verified' },
        ),
        'NOT_FOUND',
      );
      const self = setup(DAY, {
        findGuardianLink: async () => ({ ...link, guardian_id: PRINCIPAL }),
      }).service;
      await expectCode(
        self.verifyGuardianLink(principal, { relationshipId: link.id, decision: 'verified' }),
        'FORBIDDEN',
      );
    });

    it('lists guardian links for leaders and filters by status', async () => {
      const mockLinks = [
        {
          id: '99999999-9999-4999-8999-999999999999',
          student_id: '123e4567-e89b-12d3-a456-426614174000',
          student_name: 'Student One',
          guardian_id: '123e4567-e89b-12d3-a456-426614174001',
          guardian_name: 'Guardian One',
          relationship_type: 'father',
          verification_status: 'pending' as const,
          created_at: new Date('2026-10-15T10:00:00Z'),
        },
      ];
      const { service } = setup(DAY, { listGuardianLinks: async () => mockLinks });
      const result = await service.listGuardianLinks(principal, { status: 'pending' });
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: mockLinks[0].id,
        student_name: 'Student One',
        guardian_name: 'Guardian One',
        verification_status: 'pending',
      });

      await expectCode(service.listGuardianLinks(teacher), 'FORBIDDEN');
    });
  });

  describe('multi-mode policy (rest_day + good_night)', () => {
    it('holds Saturday night notice until Monday morning when rest_day is locked', async () => {
      const restDayRow: ModePolicyRow = {
        mode_key: 'rest_day',
        lock: 'locked',
        schedule: {
          weekly: [{ days: ['sun'], start: '00:00', end: '23:59' }],
        },
        effects: { holdStaffNotices: true },
        override_roles: ['principal', 'admin'],
        override_rate_limit_per_day: 2,
        version: 1,
      };
      const { service } = setup(NIGHT, {
        listModePolicies: async () => [BASE_GOOD_NIGHT_POLICY, restDayRow],
      });

      const preview = await service.previewNotice(teacher, { gradeClassId: CLASS });
      expect(preview).toMatchObject({
        in_quiet_hours: true,
        // Saturday night walks past Sunday rest day to Monday morning 06:30 Asia/Colombo
        suggested_at: '2026-10-19T01:00:00.000Z',
      });
    });

    it('allows principal to update rest_day policy', async () => {
      const { service, modePolicies } = setup(DAY);
      const updated = await service.updateModePolicy(principal, {
        modeKey: 'rest_day',
        lock: 'suggested',
        start: '00:00',
        end: '23:59',
        days: ['sun'],
      });
      expect(updated.rest_day).toBeDefined();
      expect(updated.rest_day?.lock).toBe('suggested');
      expect(modePolicies.some((p) => p.mode_key === 'rest_day')).toBe(true);
    });
  });
});
