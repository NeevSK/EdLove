import { describe, expect, it } from 'vitest';
import {
  assertWeeklySchedule,
  checkWindow,
  DEFAULT_QUIET_HOURS,
  everyDay,
  formatClock,
  formatLocal,
  nextAllowedInstant,
  planRelease,
  zonedTimeToInstant,
} from './schedule';

const TZ = 'Asia/Colombo'; // UTC+05:30, no DST
const at = (iso: string) => new Date(iso);

describe('school policy window (quiet hours)', () => {
  it('maps Colombo wall-clock time to the right instant', () => {
    expect(zonedTimeToInstant(2026, 10, 18, 6 * 60 + 30, TZ).toISOString()).toBe(
      '2026-10-18T01:00:00.000Z',
    );
  });

  it('treats 21:40 as inside 20:00-06:30 and snaps to 06:30 next morning', () => {
    const plan = planRelease(at('2026-10-17T16:10:00Z'), DEFAULT_QUIET_HOURS, TZ); // 21:40 local
    expect(plan.inPolicyWindow).toBe(true);
    expect(plan.suggestedAt.toISOString()).toBe('2026-10-18T01:00:00.000Z'); // 06:30 local
    expect(formatLocal(plan.suggestedAt, TZ)).toMatch(/6:30/);
  });

  it('treats 05:00 (after midnight) as inside the previous evening window', () => {
    const check = checkWindow(at('2026-10-17T23:30:00Z'), DEFAULT_QUIET_HOURS, TZ); // 05:00 Sun
    expect(check.inside).toBe(true);
    if (check.inside) expect(check.endsAt.toISOString()).toBe('2026-10-18T01:00:00.000Z');
  });

  it('leaves daytime untouched and treats the boundary minute as open', () => {
    expect(planRelease(at('2026-10-17T05:00:00Z'), DEFAULT_QUIET_HOURS, TZ).inPolicyWindow).toBe(
      false,
    ); // 10:30
    expect(checkWindow(at('2026-10-18T01:00:00Z'), DEFAULT_QUIET_HOURS, TZ).inside).toBe(false); // 06:30 exactly
    expect(checkWindow(at('2026-10-17T14:30:00Z'), DEFAULT_QUIET_HOURS, TZ).inside).toBe(true); // 20:00 exactly
  });

  it('chains adjacent windows (weekend-long quiet) to the first open minute', () => {
    const weekly = {
      ...everyDay({ start: '20:00', end: '06:30' }),
      sat: [{ start: '00:00', end: '23:59' }],
    };
    // Fri 21:00 local -> Sat 06:30 lands inside Saturday's all-day window -> Sat 23:59.
    const next = nextAllowedInstant(at('2026-10-16T15:30:00Z'), weekly, TZ);
    expect(next.toISOString()).toBe('2026-10-17T18:29:00.000Z');
    // Saturday's own list replaced the evening interval, so 23:59 is open.
    expect(checkWindow(next, weekly, TZ).inside).toBe(false);
  });

  it('rejects malformed schedules', () => {
    expect(() => assertWeeklySchedule({ mon: [{ start: '8pm', end: '06:30' }] })).toThrow();
    expect(() => assertWeeklySchedule({ funday: [] })).toThrow();
    expect(() => assertWeeklySchedule({ mon: [{ start: '07:00', end: '07:00' }] })).toThrow();
    expect(() => assertWeeklySchedule(DEFAULT_QUIET_HOURS)).not.toThrow();
  });

  it('formats clock labels', () => {
    expect(formatClock('06:30')).toBe('6:30 AM');
    expect(formatClock('20:00')).toBe('8:00 PM');
    expect(formatClock('00:05')).toBe('12:05 AM');
  });
});
