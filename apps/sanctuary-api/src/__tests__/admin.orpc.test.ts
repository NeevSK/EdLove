import './setup';
import { beforeEach, describe, expect, it } from 'vitest';
import { createTestORPCClient } from './orpc-client';
import { setMockActiveBond, setMockZenStackDbAvailable } from './setup';

describe('Sanctuary API: admin via native oRPC', () => {
  const userId = '123e4567-e89b-8101-8000-426614174000';
  const schoolId = '123e4567-e89b-12d3-a456-426614174001';
  const headers = { Authorization: `Bearer ${userId}` };

  beforeEach(() => {
    setMockZenStackDbAvailable(true);
    setMockActiveBond({
      id: 'bond-admin',
      user_id: userId,
      entity_id: schoolId,
      entity_type: 'SCHOOL',
      capacity: 'admin',
      status: 'active',
    });
  });

  it('reads staff presence through the native procedure', async () => {
    const body = await createTestORPCClient(headers).admin.getStaffPresence({
      params: { schoolId },
      query: {},
    });
    expect(body).toEqual({ present: 0, absent: 0, onLeave: 0, total: 0 });
  });

  it('reads pending leaves through the typed DTO list', async () => {
    const body = await createTestORPCClient(headers).admin.getPendingLeaves({
      params: { schoolId },
    });
    expect(body).toEqual([]);
  });

  it('derives leave and calendar authorship from the authenticated context', async () => {
    const client = createTestORPCClient(headers).admin;
    expect(
      await client.submitLeave({
        body: {
          schoolId,
          leaveType: 'personal',
          startDate: '2026-07-30',
          endDate: '2026-07-31',
        },
      }),
    ).toEqual({ success: true });
    expect(
      await client.approveLeave({
        params: { leaveId: '223e4567-e89b-12d3-a456-426614174000' },
        body: { approved: true },
      }),
    ).toEqual({ success: true });
    expect(
      await client.createCalendarEvent({
        params: { schoolId },
        body: { event: { title: 'Assembly', type: 'school', start_date: '2026-08-01' } },
      }),
    ).toEqual({ success: true });
  });

  it('rejects malformed school identifiers through contract validation', async () => {
    await expect(
      createTestORPCClient(headers).admin.getSchool({ params: { id: 'not-a-uuid' } }),
    ).rejects.toMatchObject({ status: 400 });
  });

  it('rejects a school-scoped read outside the active bond', async () => {
    await expect(
      createTestORPCClient(headers).admin.getPendingLeaves({
        params: { schoolId: '223e4567-e89b-12d3-a456-426614174000' },
      }),
    ).rejects.toMatchObject({ status: 403 });
  });
});
