/**
 * PROVISIONAL DEFAULTS. Placeholders, not decisions.
 *
 * Principle (Naveen, 2026-10-17): configurable over closed decisions; real
 * usage decides defaults. Every value here applies only when a school has no
 * row in school_mode_policies, is surfaced to clients as `provisional: true`,
 * and is meant to be revisited once (opt-in, aggregate) usage data exists.
 * Code paths must read these through resolveSchoolModePolicy(), never inline.
 */
import type { SchoolModePolicy } from './catalog';
import { DEFAULT_QUIET_HOURS_INTERVAL, everyDaySchedule } from './schedule';

export const PROVISIONAL_MODE_DEFAULTS = {
  good_night: {
    modeKey: 'good_night',
    // PROVISIONAL: 'suggested' nudges but never blocks; a school can lock it.
    lock: 'suggested',
    // PROVISIONAL: 20:00-06:30 every day, school timezone.
    schedule: everyDaySchedule(DEFAULT_QUIET_HOURS_INTERVAL),
    effects: { holdStaffNotices: true, inboxAlways: true, deferPush: true },
    // PROVISIONAL: who may use the logged emergency lane while locked.
    overrideRoles: ['principal', 'assistant_principal', 'admin'],
    // PROVISIONAL: emergency sends per person per rolling 24 h.
    overrideRateLimitPerDay: 3,
    isDefault: true,
  },
  rest_day: {
    modeKey: 'rest_day',
    // PROVISIONAL: 'off' by default until configured by the school.
    lock: 'off',
    schedule: {
      weekly: [{ days: ['sun'], start: '00:00', end: '23:59' }],
      date_overrides: [],
    },
    effects: { holdStaffNotices: true, inboxAlways: true, deferPush: true },
    overrideRoles: ['principal', 'assistant_principal', 'admin'],
    overrideRateLimitPerDay: 3,
    isDefault: true,
  },
} as const satisfies Record<'good_night' | 'rest_day', SchoolModePolicy>;
