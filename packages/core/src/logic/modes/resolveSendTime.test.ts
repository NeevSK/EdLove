import { describe, expect, it } from 'vitest';
import type { SchoolModePolicy } from './catalog';
import { PROVISIONAL_MODE_DEFAULTS } from './provisionalDefaults';
import { resolveSendTime } from './resolveSendTime';

const TZ = 'Asia/Colombo';
// Tests pin their own policy so they do not depend on provisional values.
const locked: SchoolModePolicy = {
  ...PROVISIONAL_MODE_DEFAULTS.good_night,
  lock: 'locked',
  overrideRoles: ['principal'],
  overrideRateLimitPerDay: 2,
  isDefault: false,
};
const at2140 = new Date('2026-10-17T16:10:00Z'); // 21:40 local
const at1030 = new Date('2026-10-17T05:00:00Z'); // 10:30 local
const next0630 = '2026-10-18T01:00:00.000Z';
const base = { timezone: TZ, policies: [locked], senderCapacity: 'teacher' };

describe('resolveSendTime (single send-time resolver)', () => {
  it('sends daytime notices as requested', () => {
    const d = resolveSendTime({ ...base, requestedAt: at1030, timing: 'as_requested' });
    expect(d).toMatchObject({ ok: true, insideWindow: false, overridden: false });
    if (d.ok) expect(d.sendAt).toEqual(at1030);
  });

  it('locked: refuses a 21:40 send and names the next allowed time', () => {
    const d = resolveSendTime({ ...base, requestedAt: at2140, timing: 'as_requested' });
    expect(d).toMatchObject({ ok: false, code: 'INSIDE_POLICY_WINDOW', modeKey: 'good_night' });
    expect(d.nextAllowedAt.toISOString()).toBe(next0630);
  });

  it('snaps to 06:30 when the sender accepts the suggestion', () => {
    const d = resolveSendTime({ ...base, requestedAt: at2140, timing: 'next_allowed' });
    expect(d.ok && d.sendAt.toISOString()).toBe(next0630);
  });

  it('suggested: nudges but lets the sender send as asked', () => {
    const d = resolveSendTime({
      ...base,
      policies: [{ ...locked, lock: 'suggested' }],
      requestedAt: at2140,
      timing: 'as_requested',
    });
    expect(d).toMatchObject({ ok: true, insideWindow: true, overridden: false });
  });

  it('off: ignores the window', () => {
    const d = resolveSendTime({
      ...base,
      policies: [{ ...locked, lock: 'off' }],
      requestedAt: at2140,
      timing: 'as_requested',
    });
    expect(d).toMatchObject({ ok: true, insideWindow: false });
  });

  it('override: role from the school policy, reason required, rate-limited', () => {
    const principal = {
      ...base,
      senderCapacity: 'principal',
      requestedAt: at2140,
      timing: 'override' as const,
    };
    expect(resolveSendTime({ ...principal, overrideReason: 'short' })).toMatchObject({
      ok: false,
      code: 'OVERRIDE_REASON_REQUIRED',
    });
    const reason = 'School closed tomorrow: flooding';
    const d = resolveSendTime({ ...principal, overrideReason: reason, overridesUsedToday: 1 });
    expect(d).toMatchObject({ ok: true, overridden: true });
    expect(
      resolveSendTime({ ...principal, overrideReason: reason, overridesUsedToday: 2 }),
    ).toMatchObject({
      ok: false,
      code: 'OVERRIDE_RATE_LIMITED',
    });
    expect(
      resolveSendTime({
        ...principal,
        policies: [{ ...locked, overrideRateLimitPerDay: null }],
        overrideReason: reason,
        overridesUsedToday: 99,
      }),
    ).toMatchObject({ ok: true });
  });

  it('keeps roles outside the policy out of the emergency lane', () => {
    const req = {
      ...base,
      requestedAt: at2140,
      timing: 'override' as const,
      overrideReason: 'Bus breakdown, late pickup',
    };
    expect(resolveSendTime(req)).toMatchObject({ ok: false, code: 'OVERRIDE_NOT_ALLOWED' });
    expect(
      resolveSendTime({
        ...req,
        policies: [{ ...locked, overrideRoles: ['principal', 'teacher'] }],
      }),
    ).toMatchObject({ ok: true, overridden: true });
  });

  it('marks the provisional default as a default', () => {
    expect(PROVISIONAL_MODE_DEFAULTS.good_night).toMatchObject({ isDefault: true });
  });
});
