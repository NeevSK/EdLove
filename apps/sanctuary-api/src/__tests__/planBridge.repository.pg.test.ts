/**
 * Runs the real SQL repository against a throwaway Postgres that has the
 * migration chain (including 20261017210000) replayed. Skipped unless
 * PLAN_BRIDGE_TEST_DATABASE_URL is set. Every test runs inside a transaction
 * that is rolled back, on top of supabase/tests/plan_bridge_fixtures.sql.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import pg from 'pg';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createSqlPlanBridgeRepository } from '../core/planBridge/repository';
import { createPlanBridgeService } from '../core/planBridge/service';

const url = process.env.PLAN_BRIDGE_TEST_DATABASE_URL;
const fixtures = readFileSync(
  resolve(__dirname, '../../../gurudevi-mobile/supabase/tests/plan_bridge_fixtures.sql'),
  'utf8',
);

const SCHOOL = 'a0000000-0000-4000-8000-000000000001';
const CLASS_A = 'd0000000-0000-4000-8000-000000000001';
const CLASS_B = 'd0000000-0000-4000-8000-000000000002';
const TEACHER = 'b0000000-0000-4000-8000-0000000000a1';
const PRINCIPAL = 'b0000000-0000-4000-8000-0000000000a2';
const GB_LINK_GUARDIAN = 'b0000000-0000-4000-8000-0000000000c3';

describe.skipIf(!url)('plan-and-bridge SQL repository (throwaway Postgres)', () => {
  const client = new pg.Client({ connectionString: url });
  const sql = async <T>(query: string, params: readonly unknown[] = []) =>
    (await client.query(query, params as unknown[])).rows as T[];
  const repo = createSqlPlanBridgeRepository(sql);
  const scheduled: unknown[] = [];
  const service = (at: Date) =>
    createPlanBridgeService({
      repo,
      scheduler: {
        noticeScheduled: async (x) => void scheduled.push(x),
        noticeCancelled: async () => {},
      },
      now: () => at,
      log: () => {},
    });

  beforeAll(() => client.connect());
  afterAll(() => client.end());
  beforeEach(async () => {
    scheduled.length = 0;
    await client.query('BEGIN');
    await client.query(fixtures);
  });
  afterEach(() => client.query('ROLLBACK'));

  it('resolves classes and recipients through model A (verified guardians only)', async () => {
    const forTeacher = await repo.listGradeClasses(SCHOOL, TEACHER);
    expect(forTeacher.map((c) => c.id)).toEqual([CLASS_A]);
    expect(forTeacher[0]).toMatchObject({ enrolled_count: 2, verified_guardian_count: 2 });
    expect((await repo.listGradeClasses(SCHOOL, null)).map((c) => c.id).sort()).toEqual([
      CLASS_A,
      CLASS_B,
    ]);
    expect(await repo.countRecipients(CLASS_A)).toBe(2);
    expect(await repo.isAssignedTeacher(CLASS_B, TEACHER)).toBe(false);
  });

  it('stores quiet hours as a good_night mode policy and reads it back', async () => {
    const svc = service(new Date());
    const principal = { userId: PRINCIPAL, schoolId: SCHOOL, capacity: 'principal' };
    const settings = await svc.updateGoodNight(principal, {
      start: '21:00',
      end: '06:00',
      lock: 'suggested',
      overrideRoles: ['principal', 'teacher'],
      overrideRateLimitPerDay: 1,
    });
    expect(settings.good_night).toMatchObject({
      everyday: { start: '21:00', end: '06:00' },
      provisional: false,
      lock: 'suggested',
      override_roles: ['principal', 'teacher'],
      override_rate_limit_per_day: 1,
    });
    await svc.updateGoodNight(principal, { start: '20:30', end: '06:30' });
    const [row] = await sql<{ version: number; n: number }>(
      `SELECT version, (SELECT count(*)::int FROM public.school_mode_policies WHERE school_id = $1) AS n
         FROM public.school_mode_policies WHERE school_id = $1 AND mode_key = 'good_night'`,
      [SCHOOL],
    );
    // The fixture row is version 1; each update bumps it. Still one row per school x mode.
    expect(row).toEqual({ version: 3, n: 1 });
  });

  it('plans an event, holds a 21:40 notice to 06:30, and releases it once', async () => {
    const night = new Date('2030-03-04T16:10:00Z'); // Mon 21:40 Asia/Colombo
    const svc = service(night);
    const teacher = { userId: TEACHER, schoolId: SCHOOL, capacity: 'teacher' };
    const event = await svc.createEvent(teacher, {
      gradeClassId: CLASS_A,
      title: 'Science fair',
      type: 'event',
      startsAt: '2030-03-10T03:00:00Z',
      noticeLeadDays: 4,
    });
    const notice = await svc.scheduleNotice(teacher, {
      gradeClassId: CLASS_A,
      calendarEventId: event.id,
      title: 'Science fair on Monday',
      body: 'Projects due Friday.',
      timing: 'next_allowed',
    });
    expect(notice).toMatchObject({
      status: 'scheduled',
      send_at: '2030-03-05T01:00:00.000Z',
      held_by_mode: 'good_night',
    });
    expect(scheduled).toHaveLength(1);

    const early = await repo.releaseNotice(notice.id, 0, new Date('2030-03-05T00:59:00Z'));
    expect(early.outcome).toBe('not_due');
    const first = await repo.releaseNotice(notice.id, 0, new Date('2030-03-05T01:00:00Z'));
    expect(first).toEqual({ outcome: 'sent', recipients: 2 });
    const again = await repo.releaseNotice(notice.id, 0, new Date('2030-03-05T01:01:00Z'));
    expect(again.outcome).toBe('already_sent');

    const log = await sql<{ event: string }>(
      `SELECT event FROM public.school_notice_events WHERE notice_id = $1 ORDER BY created_at, event`,
      [notice.id],
    );
    expect(log.map((e) => e.event).sort()).toEqual(['created', 'released', 'scheduled']);
    const listed = await svc.listNotices(teacher, {});
    expect(listed.find((n) => n.id === notice.id)).toMatchObject({
      status: 'sent',
      recipient_count: 2,
      grade_class_name: '6 A',
    });
  });

  it('reschedules (version bump) and cancels', async () => {
    const svc = service(new Date('2030-03-04T05:00:00Z')); // 10:30 Colombo
    const teacher = { userId: TEACHER, schoolId: SCHOOL, capacity: 'teacher' };
    const notice = await svc.scheduleNotice(teacher, {
      gradeClassId: CLASS_A,
      title: 'Later today',
      body: 'Library visit.',
      sendAt: '2030-03-04T08:00:00Z',
      timing: 'as_requested',
    });
    const moved = await svc.scheduleNotice(teacher, {
      noticeId: notice.id,
      gradeClassId: CLASS_A,
      title: 'Later today (moved)',
      body: 'Library visit.',
      sendAt: '2030-03-04T09:00:00Z',
      timing: 'as_requested',
    });
    expect(moved.schedule_version).toBe(1);
    expect((await repo.releaseNotice(notice.id, 0, new Date('2030-03-04T10:00:00Z'))).outcome).toBe(
      'superseded',
    );
    expect((await svc.cancelNotice(teacher, notice.id)).status).toBe('cancelled');
  });

  it('counts emergency sends from the event log and records opt-in usage only', async () => {
    const night = new Date('2030-03-04T16:10:00Z');
    const svc = service(night);
    const principal = { userId: PRINCIPAL, schoolId: SCHOOL, capacity: 'principal' };
    await sql(`UPDATE public.schools SET usage_signal_opt_in = true WHERE id = $1`, [SCHOOL]);
    await svc.scheduleNotice(principal, {
      gradeClassId: CLASS_A,
      title: 'Closed tomorrow',
      body: 'Flooding on the main road.',
      timing: 'override',
      overrideReason: 'Flooding on the main road',
    });
    expect(
      await repo.countOverridesSince(SCHOOL, PRINCIPAL, new Date(Date.now() - 86_400_000)),
    ).toBe(1);
    const cells = await sql<{ event: string; capacity: string; count: number }>(
      `SELECT event, capacity, count FROM public.school_mode_usage_daily WHERE school_id = $1`,
      [SCHOOL],
    );
    expect(cells).toEqual([{ event: 'override', capacity: 'principal', count: 1 }]);
  });

  it('verifies a pending guardian link for a student in the school', async () => {
    const [link] = await sql<{ id: string }>(
      `SELECT id FROM public.student_guardian_relationships WHERE guardian_id = $1`,
      [GB_LINK_GUARDIAN],
    );
    const svc = service(new Date());
    await svc.verifyGuardianLink(
      { userId: PRINCIPAL, schoolId: SCHOOL, capacity: 'principal' },
      { relationshipId: link!.id, decision: 'verified' },
    );
    const [after] = await sql<{ verification_status: string; verified_by: string }>(
      `SELECT verification_status, verified_by FROM public.student_guardian_relationships WHERE id = $1`,
      [link!.id],
    );
    expect(after).toEqual({ verification_status: 'verified', verified_by: PRINCIPAL });
    expect(await repo.countRecipients(CLASS_A)).toBe(3);
  });
});
