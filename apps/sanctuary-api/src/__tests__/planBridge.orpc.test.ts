import './setup';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setPlanBridgeServiceFactoryForTests } from '../core/planBridge/runtime';
import { PlanBridgeError, type PlanBridgeService } from '../core/planBridge/service';
import { createTestORPCClient } from './orpc-client';
import { setMockActiveBond, setMockZenStackDbAvailable } from './setup';

const userId = '123e4567-e89b-12d3-a456-426614174000';
const schoolId = '923e4567-e89b-12d3-a456-426614174000';
const gradeClassId = '33333333-3333-4333-8333-333333333333';
const headers = { Authorization: `Bearer ${userId}` };

function asCapacity(capacity: string) {
  setMockActiveBond({
    id: `bond-${capacity}`,
    user_id: userId,
    entity_id: schoolId,
    entity_type: 'SCHOOL',
    capacity,
    status: 'active',
  });
}

const settings = {
  school_id: schoolId,
  timezone: 'Asia/Colombo',
  good_night: {
    mode_key: 'good_night' as const,
    lock: 'locked' as const,
    schedule: { weekly: [{ days: ['mon'], start: '20:00', end: '06:30' }] },
    everyday: { start: '20:00', end: '06:30' },
    override_roles: ['principal'],
    override_rate_limit_per_day: 3,
    provisional: false,
  },
  usage_signal_opt_in: false,
  can_edit: true,
  can_override: true,
};

describe('Sanctuary API: planBridge via native oRPC', () => {
  const service = {
    listMyGradeClasses: vi.fn(async () => [
      {
        id: gradeClassId,
        name: 'Grade 6 A',
        school_id: schoolId,
        enrolled_count: 30,
        verified_guardian_count: 12,
      },
    ]),
    updateGoodNight: vi.fn(async () => settings),
    scheduleNotice: vi.fn(async () => {
      throw new PlanBridgeError(
        'CONFLICT',
        'School quiet hours are on. Send at Sun 18 Oct, 6:30 am?',
        {
          reason: 'INSIDE_POLICY_WINDOW',
          nextAllowedAt: '2026-10-18T01:00:00.000Z',
        },
      );
    }),
  };

  beforeEach(() => {
    setMockZenStackDbAvailable(true);
    setPlanBridgeServiceFactoryForTests(() => service as unknown as PlanBridgeService);
  });
  afterEach(() => setPlanBridgeServiceFactoryForTests(null));

  it('passes the server-derived actor to the service', async () => {
    asCapacity('teacher');
    const rows = await createTestORPCClient(headers).planBridge.listMyGradeClasses({});
    expect(rows).toHaveLength(1);
    expect(service.listMyGradeClasses).toHaveBeenCalledWith({
      userId,
      schoolId,
      capacity: 'teacher',
    });
  });

  it('maps a quiet-hours refusal to CONFLICT with the suggested time', async () => {
    asCapacity('teacher');
    const error = await createTestORPCClient(headers)
      .planBridge.scheduleNotice({
        body: {
          gradeClassId,
          title: 'Sports day',
          body: 'White shoes on Friday',
          timing: 'as_requested',
        },
      })
      .catch((e: any) => e);
    expect(error.code).toBe('CONFLICT');
    expect(error.data).toMatchObject({
      reason: 'INSIDE_POLICY_WINDOW',
      nextAllowedAt: '2026-10-18T01:00:00.000Z',
    });
  });

  it('denies parents at the policy gate before the service runs', async () => {
    asCapacity('parent');
    service.scheduleNotice.mockClear();
    await expect(
      createTestORPCClient(headers).planBridge.scheduleNotice({
        body: { gradeClassId, title: 'Hello', body: 'Not allowed', timing: 'as_requested' },
      }),
    ).rejects.toBeTruthy();
    expect(service.scheduleNotice).not.toHaveBeenCalled();
  });

  it('denies teachers from changing school quiet hours at the policy gate', async () => {
    asCapacity('teacher');
    service.updateGoodNight.mockClear();
    await expect(
      createTestORPCClient(headers).planBridge.updateQuietHours({
        body: { start: '21:00', end: '06:00' },
      }),
    ).rejects.toBeTruthy();
    expect(service.updateGoodNight).not.toHaveBeenCalled();
  });

  it('lets a principal change school quiet hours', async () => {
    asCapacity('principal');
    await expect(
      createTestORPCClient(headers).planBridge.updateQuietHours({
        body: { start: '21:00', end: '06:00' },
      }),
    ).resolves.toMatchObject({ timezone: 'Asia/Colombo' });
  });

  it('rejects malformed times at the contract boundary', async () => {
    asCapacity('principal');
    await expect(
      createTestORPCClient(headers).planBridge.updateQuietHours({
        body: { start: '8pm', end: '06:00' },
      }),
    ).rejects.toBeTruthy();
  });
});
