import { describe, expect, it } from 'vitest';
import { getGuestLeaseStatus, GUEST_LEASE_DAYS } from '@repo/core/native/guestLease';

const startedAt = new Date('2026-09-01T00:00:00.000Z');
const lease = {
  startedAt: startedAt.toISOString(),
  expiresAt: new Date(startedAt.getTime() + GUEST_LEASE_DAYS * 24 * 60 * 60 * 1000).toISOString(),
  dismissedReminderDays: [],
};

describe('guest lease policy', () => {
  it.each([
    [1, 1],
    [3, 3],
    [6, 6],
    [10, 10],
    [15, 15],
  ])('notifies on day %i', (day, expectedReminderDay) => {
    const now = new Date(startedAt.getTime() + (day - 1) * 24 * 60 * 60 * 1000);
    expect(getGuestLeaseStatus(lease, now).reminderDay).toBe(expectedReminderDay);
  });

  it('does not notify between milestones and expires at the fifteen-day boundary', () => {
    const dayTwo = new Date(startedAt.getTime() + 24 * 60 * 60 * 1000);
    const expiresAt = new Date(lease.expiresAt);
    expect(getGuestLeaseStatus(lease, dayTwo).reminderDay).toBeNull();
    expect(getGuestLeaseStatus(lease, expiresAt).isExpired).toBe(true);
  });
});
