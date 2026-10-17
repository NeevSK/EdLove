/**
 * Mode schedules: weekly wall-clock windows in a school's IANA timezone.
 *
 * Pure and dependency-free, so sanctuary-api (authoritative) and the client
 * (preview, offline gates) compute the same answer. An interval whose end is
 * earlier than its start crosses midnight ("20:00"-"06:30").
 *
 * Stored shape (school_mode_policies.schedule), after the Novu/Knock/cal.com
 * schedule idea (ideas only, no code copied):
 *   { "weekly": [{ "days": ["mon", ...], "start": "20:00", "end": "06:30" }],
 *     "date_overrides": [] }
 * date_overrides is reserved for Rest day / exam weeks and not evaluated yet.
 */

export const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
export type DayKey = (typeof DAY_KEYS)[number];
export type WindowInterval = { start: string; end: string };
export type WeeklySchedule = Partial<Record<DayKey, WindowInterval[]>>;

export type ScheduleRule = { days: DayKey[]; start: string; end: string };
export type ModeSchedule = { weekly: ScheduleRule[]; date_overrides?: unknown[] };

export const DEFAULT_SCHOOL_TIMEZONE = 'Asia/Colombo';
export const DEFAULT_QUIET_HOURS_INTERVAL: WindowInterval = { start: '20:00', end: '06:30' };

const HHMM = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function everyDay(interval: WindowInterval): WeeklySchedule {
  return Object.fromEntries(DAY_KEYS.map((day) => [day, [{ ...interval }]])) as WeeklySchedule;
}

export const DEFAULT_QUIET_HOURS: WeeklySchedule = everyDay(DEFAULT_QUIET_HOURS_INTERVAL);

/** Stored rule list -> per-weekday intervals. */
export function toWeekly(schedule: ModeSchedule | null | undefined): WeeklySchedule {
  const weekly: WeeklySchedule = {};
  for (const rule of schedule?.weekly ?? []) {
    for (const day of rule.days) {
      (weekly[day] ??= []).push({ start: rule.start, end: rule.end });
    }
  }
  return weekly;
}

export function everyDaySchedule(interval: WindowInterval): ModeSchedule {
  return {
    weekly: [{ days: [...DAY_KEYS], start: interval.start, end: interval.end }],
    date_overrides: [],
  };
}

/** The single interval if every day shares one, else null (for simple editors). */
export function sharedDailyInterval(
  schedule: ModeSchedule | null | undefined,
): WindowInterval | null {
  const rules = schedule?.weekly ?? [];
  if (rules.length !== 1) return null;
  const [rule] = rules;
  if (!rule || DAY_KEYS.some((day) => !rule.days.includes(day))) return null;
  return { start: rule.start, end: rule.end };
}

export function assertModeSchedule(schedule: unknown): asserts schedule is ModeSchedule {
  const weekly = (schedule as ModeSchedule | null)?.weekly;
  if (!Array.isArray(weekly)) throw new Error('Schedule needs a weekly rule list.');
  for (const rule of weekly) {
    if (!Array.isArray(rule?.days) || rule.days.length === 0)
      throw new Error('Each rule needs weekdays.');
  }
  assertWeeklySchedule(toWeekly(schedule as ModeSchedule));
}

export function isValidTime(value: string): boolean {
  return HHMM.test(value);
}

export function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone }).format(new Date(0));
    return true;
  } catch {
    return false;
  }
}

/** Throws a readable error for a malformed schedule. */
export function assertWeeklySchedule(weekly: unknown): asserts weekly is WeeklySchedule {
  if (!weekly || typeof weekly !== 'object' || Array.isArray(weekly)) {
    throw new Error('Weekly schedule must be an object keyed by weekday.');
  }
  for (const [day, intervals] of Object.entries(weekly as Record<string, unknown>)) {
    if (!(DAY_KEYS as readonly string[]).includes(day))
      throw new Error(`Unknown weekday "${day}".`);
    if (!Array.isArray(intervals)) throw new Error(`Intervals for ${day} must be a list.`);
    for (const interval of intervals) {
      const { start, end } = (interval ?? {}) as WindowInterval;
      if (!isValidTime(start) || !isValidTime(end)) {
        throw new Error(`Interval on ${day} must use HH:MM times.`);
      }
      if (start === end) throw new Error(`Interval on ${day} is empty.`);
    }
  }
}

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
};

type LocalParts = { year: number; month: number; day: number; minutes: number; weekday: number };

const partsFormatter = new Map<string, Intl.DateTimeFormat>();
function formatterFor(timeZone: string) {
  let formatter = partsFormatter.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    partsFormatter.set(timeZone, formatter);
  }
  return formatter;
}

export function localParts(instant: Date, timeZone: string): LocalParts {
  const parts = Object.fromEntries(
    formatterFor(timeZone)
      .formatToParts(instant)
      .map((part) => [part.type, part.value]),
  );
  const year = Number(parts.year);
  const month = Number(parts.month);
  const day = Number(parts.day);
  const minutes = Number(parts.hour) * 60 + Number(parts.minute);
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return { year, month, day, minutes, weekday };
}

function offsetMs(instant: Date, timeZone: string): number {
  const p = localParts(instant, timeZone);
  const seconds = instant.getUTCSeconds();
  const asUtc = Date.UTC(
    p.year,
    p.month - 1,
    p.day,
    Math.floor(p.minutes / 60),
    p.minutes % 60,
    seconds,
  );
  return asUtc - (instant.getTime() - instant.getUTCMilliseconds());
}

/** The instant at which the wall clock in `timeZone` reads the given time. */
export function zonedTimeToInstant(
  year: number,
  month: number,
  day: number,
  minutes: number,
  timeZone: string,
): Date {
  const naive = Date.UTC(year, month - 1, day, Math.floor(minutes / 60), minutes % 60);
  let guess = naive - offsetMs(new Date(naive), timeZone);
  // Second pass settles DST transitions.
  guess = naive - offsetMs(new Date(guess), timeZone);
  return new Date(guess);
}

function shiftDay(p: Pick<LocalParts, 'year' | 'month' | 'day'>, delta: number) {
  const d = new Date(Date.UTC(p.year, p.month - 1, p.day + delta));
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
    weekday: d.getUTCDay(),
  };
}

export type WindowCheck =
  | { inside: false }
  | { inside: true; endsAt: Date; interval: WindowInterval };

/** Is `instant` inside the weekly window? If so, when does that interval end? */
export function checkWindow(instant: Date, weekly: WeeklySchedule, timeZone: string): WindowCheck {
  const now = localParts(instant, timeZone);
  const today = DAY_KEYS[now.weekday]!;
  for (const interval of weekly[today] ?? []) {
    const start = toMinutes(interval.start);
    const end = toMinutes(interval.end);
    if (start < end && now.minutes >= start && now.minutes < end) {
      return {
        inside: true,
        interval,
        endsAt: zonedTimeToInstant(now.year, now.month, now.day, end, timeZone),
      };
    }
    if (start > end && now.minutes >= start) {
      const next = shiftDay(now, 1);
      return {
        inside: true,
        interval,
        endsAt: zonedTimeToInstant(next.year, next.month, next.day, end, timeZone),
      };
    }
  }
  const prev = shiftDay(now, -1);
  for (const interval of weekly[DAY_KEYS[prev.weekday]!] ?? []) {
    const start = toMinutes(interval.start);
    const end = toMinutes(interval.end);
    if (start > end && now.minutes < end) {
      return {
        inside: true,
        interval,
        endsAt: zonedTimeToInstant(now.year, now.month, now.day, end, timeZone),
      };
    }
  }
  return { inside: false };
}

/** The first instant at or after `instant` that is outside every interval. */
export function nextAllowedInstant(instant: Date, weekly: WeeklySchedule, timeZone: string): Date {
  let cursor = instant;
  for (let hops = 0; hops < 16; hops += 1) {
    const check = checkWindow(cursor, weekly, timeZone);
    if (!check.inside) return cursor;
    cursor = check.endsAt;
  }
  throw new Error('The policy window never opens. Check the weekly schedule.');
}

export type SchedulePlan = {
  requestedAt: Date;
  inPolicyWindow: boolean;
  /** Equal to requestedAt when no window applies. */
  suggestedAt: Date;
  window?: WindowInterval;
};

export function planRelease(
  requestedAt: Date,
  weekly: WeeklySchedule,
  timeZone: string,
): SchedulePlan {
  const check = checkWindow(requestedAt, weekly, timeZone);
  if (!check.inside) return { requestedAt, inPolicyWindow: false, suggestedAt: requestedAt };
  return {
    requestedAt,
    inPolicyWindow: true,
    suggestedAt: nextAllowedInstant(requestedAt, weekly, timeZone),
    window: check.interval,
  };
}

/** "Sat 18 Oct, 6:30 AM" in the school's timezone. */
export function formatLocal(instant: Date, timeZone: string, locale = 'en-GB'): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(instant);
}

/** "6:30 AM" style label for an HH:MM value. */
export function formatClock(hhmm: string): string {
  const minutes = toMinutes(hhmm);
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const suffix = h < 12 ? 'AM' : 'PM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${suffix}`;
}
