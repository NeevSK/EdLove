/**
 * Modes catalog (v0): which mode keys exist and what shape a school policy has.
 * Values (windows, locks, roles, limits) are configuration: per school in
 * school_mode_policies, else PROVISIONAL_MODE_DEFAULTS. This slice evaluates
 * `good_night` for staff -> family notice release; other keys are reserved so
 * the table and resolver keep their shape (ADR 2026-10-17 plan-and-bridge).
 */
import type { ModeSchedule } from './schedule';

export const MODE_KEYS = [
  'good_night',
  'rest_day',
  'school_day',
  'office_hours',
  'teaching',
  'exam',
] as const;
export type ModeKey = (typeof MODE_KEYS)[number];

/**
 * locked: inside the window staff sends wait (only the logged emergency lane bypasses).
 * suggested: the composer nudges ("send at 6:30 AM?") but the sender may send as asked.
 * off: the window is ignored.
 */
export const MODE_LOCKS = ['locked', 'suggested', 'off'] as const;
export type ModeLock = (typeof MODE_LOCKS)[number];

export type ModeEffects = {
  /** Sender side: hold staff -> family notices until the window ends. */
  holdStaffNotices?: boolean;
  /** Recipient side: the in-app inbox always receives; push may wait (PB8d). */
  inboxAlways?: boolean;
  deferPush?: boolean;
};

export type SchoolModePolicy = {
  modeKey: ModeKey;
  lock: ModeLock;
  schedule: ModeSchedule;
  effects: ModeEffects;
  /** Capacities allowed to use the emergency lane for this mode. */
  overrideRoles: readonly string[];
  /** Emergency sends per person per rolling 24 h; null = no limit. */
  overrideRateLimitPerDay: number | null;
  /** true when the provisional default applies (no school row). */
  isDefault: boolean;
};
