import './setup';
import { beforeEach, describe, expect, it } from 'vitest';
import { createTestORPCClient } from './orpc-client';
import { setMockActiveBond, setMockZenStackDbAvailable } from './setup';

describe('Sanctuary API: admin via native oRPC', () => {
  const userId = '123e4567-e89b-12d3-a456-426614174000';
  const schoolId = '123e4567-e89b-12d3-a456-426614174001';
  const headers = { Authorization: `Bearer ${userId}` };

  beforeEach(() => {
    setMockZenStackDbAvailable(true);
    setMockActiveBond({ id: 'bond-admin', user_id: userId, entity_id: schoolId, entity_type: 'SCHOOL', capacity: 'admin', status: 'active' });
  });

  it('reads staff presence through the native procedure', async () => {
    const body = await createTestORPCClient(headers).admin.getStaffPresence({ schoolId });
    expect(body).toEqual({ present: 0, absent: 0, onLeave: 0, total: 0 });
  });

  it('reads pending leaves through the typed DTO list', async () => {
    const body = await createTestORPCClient(headers).admin.getPendingLeaves({ schoolId });
    expect(body).toEqual([]);
  });

  it('derives leave and calendar authorship from the authenticated context', async () => {
    const client = createTestORPCClient(headers).admin;
    expect(await client.submitLeave({ schoolId, leaveType: 'personal', startDate: '2026-07-30', endDate: '2026-07-31' })).toEqual({ success: true });
    expect(await client.approveLeave({ leaveId: '223e4567-e89b-12d3-a456-426614174000', approved: true })).toEqual({ success: true });
    expect(await client.createCalendarEvent({ schoolId, event: { title: 'Assembly', type: 'school', start_date: '2026-08-01' } })).toEqual({ success: true });
  });

  it('rejects malformed school identifiers through contract validation', async () => {
    await expect(createTestORPCClient(headers).admin.getSchool({ id: 'not-a-uuid' })).rejects.toMatchObject({ status: 400 });
  });
});
