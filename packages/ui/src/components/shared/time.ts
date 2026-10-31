/**
 * Platform-neutral rules for the time pieces. Days are civil dates
 * (`YYYY-MM-DD`) and times are wall-clock (`HH:MM`), the same model as
 * `@repo/core/logic/workbench`, whose day helpers these build on; words come
 * from `Intl` in the reader's language.
 */
import {
  parseCivilDate,
  resolveMonthGrid,
  resolveTemporalIntent,
  shiftCivilDate,
  toIsoDate,
} from '@repo/core/logic/workbench/temporalCoordinates';
import type { TimeIntent, TimeLabels } from '../../theme/contracts';
import type { WorldLanguage } from '../../theme/types';

export { parseCivilDate, resolveMonthGrid, shiftCivilDate, toIsoDate };

export const TIME_ENGLISH: TimeLabels = {
  today: 'Today',
  now: 'Now',
  review: 'Looking back',
  current: 'Today',
  plan: 'Planning ahead',
  previousDay: 'Previous day',
  nextDay: 'Next day',
  previousWeek: 'Previous week',
  nextWeek: 'Next week',
  previousMonth: 'Previous month',
  nextMonth: 'Next month',
  chooseDate: 'Choose date',
  chooseTime: 'Choose time',
  hour: 'Hour',
  minute: 'Minute',
  earlier: 'Earlier',
  later: 'Later',
  done: 'Done',
  clear: 'Clear',
  busy: 'Has activity',
  unavailable: 'Not available',
  noDate: 'No date',
  noTime: 'No time',
};

/** The reader's locale for a world language; Sri Lankan conventions for all three. */
export function localeOf(language: WorldLanguage): string {
  return language === 'si' ? 'si-LK' : language === 'ta' ? 'ta-LK' : 'en-LK';
}

/** Past, today or ahead, for a civil day against today. */
export function dayIntent(date: string, now: Date = new Date()): TimeIntent {
  return resolveTemporalIntent(date, toIsoDate(now));
}

/** Past, now or ahead for an exact moment: within a minute is now. */
export function momentIntent(at: Date, now: Date = new Date()): TimeIntent {
  const delta = at.getTime() - now.getTime();
  if (Math.abs(delta) < 60_000) return 'current';
  return delta < 0 ? 'review' : 'plan';
}

/** `HH:MM` to minutes after midnight, or null when it is not a time. */
export function parseTime(value: string | null | undefined): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(value ?? '');
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  return h < 24 && min < 60 ? h * 60 + min : null;
}

/** Minutes after midnight to `HH:MM`, wrapping round the day. */
export function toTime(minutes: number): string {
  const day = 24 * 60;
  const m = ((Math.round(minutes) % day) + day) % day;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

/** A time moved by some minutes, landing on the step ("09:10" + 15 on 15 → "09:15"). */
export function shiftTime(value: string, minutes: number, step = 1): string {
  const start = parseTime(value) ?? 0;
  const moved = start + minutes;
  return toTime(step > 1 ? Math.round(moved / step) * step : moved);
}

/** A day and a wall-clock time as one local moment. */
export function momentOf(date: string, time?: string | null): Date {
  const d = parseCivilDate(date);
  const minutes = parseTime(time);
  if (minutes !== null) d.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
  return d;
}

export function formatDay(
  date: string,
  locale: string,
  style: 'long' | 'medium' | 'short' = 'medium',
): string {
  const options: Intl.DateTimeFormatOptions =
    style === 'long'
      ? { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
      : style === 'medium'
        ? { weekday: 'short', day: 'numeric', month: 'short' }
        : { day: 'numeric', month: 'short' };
  return new Intl.DateTimeFormat(locale, options).format(parseCivilDate(date));
}

/** A wall-clock time in the reader's own clock (12 or 24 hours, as their locale keeps it). */
export function formatTime(value: string, locale: string): string {
  const minutes = parseTime(value);
  if (minutes === null) return value;
  const d = new Date(2000, 0, 1, Math.floor(minutes / 60), minutes % 60);
  return new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit' }).format(d);
}

/** Month title, "October 2026". `month` is zero-based, as in `Date`. */
export function formatMonth(year: number, month: number, locale: string): string {
  return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(
    new Date(year, month, 1, 12),
  );
}

/** Weekday names from Sunday, matching the month grid's columns. */
export function weekdayNames(locale: string, width: 'narrow' | 'short' | 'long' = 'short') {
  const f = new Intl.DateTimeFormat(locale, { weekday: width });
  // 2026-10-04 is a Sunday.
  return Array.from({ length: 7 }, (_, i) => f.format(new Date(2026, 9, 4 + i, 12)));
}

/** The month a step away from a day's month, as [year, month]. */
export function shiftMonth(year: number, month: number, by: number): [number, number] {
  const d = new Date(year, month + by, 1, 12);
  return [d.getFullYear(), d.getMonth()];
}

const UNITS: readonly [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 86_400],
  ['month', 30 * 86_400],
  ['week', 7 * 86_400],
];

/**
 * "now", "5 minutes ago", "yesterday", "in 3 weeks". Within the same day
 * (or six hours) it counts minutes and hours; across days it counts calendar
 * days, so 5 pm seen at 9 am next morning is "yesterday", not "16 hours ago".
 */
export function relativeTime(at: Date, now: Date, locale: string): string {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const seconds = (at.getTime() - now.getTime()) / 1000;
  const abs = Math.abs(seconds);
  if (abs < 45) return rtf.format(0, 'second');
  if (abs < 45 * 60) return rtf.format(Math.round(seconds / 60), 'minute');
  const days = Math.round(
    (parseCivilDate(toIsoDate(at)).getTime() - parseCivilDate(toIsoDate(now)).getTime()) /
      86_400_000,
  );
  if (days === 0 || abs < 6 * 3600) return rtf.format(Math.round(seconds / 3600), 'hour');
  if (Math.abs(days) < 7) return rtf.format(days, 'day');
  for (const [unit, size] of UNITS)
    if (abs >= size) return rtf.format(Math.round(seconds / size), unit);
  return rtf.format(days, 'day');
}

/** How soon a relative time needs saying again: often near now, rarely far away. */
export function refreshAfter(at: Date, now: Date): number {
  const abs = Math.abs(at.getTime() - now.getTime());
  if (abs < 60 * 60_000) return 30_000;
  if (abs < 24 * 3_600_000) return 5 * 60_000;
  return 60 * 60_000;
}

/** Whether a day may be chosen, given optional `min` and `max` days. */
export function withinRange(date: string, min?: string, max?: string): boolean {
  return (!min || date >= min) && (!max || date <= max);
}

export interface TimelineGroup<T> {
  key: string;
  date: string;
  intent: TimeIntent;
  items: T[];
}

/**
 * Items in time order, grouped by day, oldest first, so the past reads down
 * into now and on into the future. Moments that cannot be read are left out.
 */
export function timelineGroups<T extends { at: string | Date }>(
  items: readonly T[],
  now: Date = new Date(),
): TimelineGroup<T>[] {
  const valid = items
    .map((item) => ({ item, at: new Date(item.at) }))
    .filter((x) => !Number.isNaN(x.at.getTime()))
    .sort((a, b) => a.at.getTime() - b.at.getTime());
  const groups: TimelineGroup<T>[] = [];
  for (const { item, at } of valid) {
    const date = toIsoDate(at);
    const last = groups[groups.length - 1];
    if (last && last.date === date) last.items.push(item);
    else groups.push({ key: date, date, intent: dayIntent(date, now), items: [item] });
  }
  return groups;
}

/** Index of the first item still ahead of now, where the now line goes (-1 if none). */
export function nowIndex<T extends { at: string | Date }>(items: readonly T[], now: Date): number {
  return items.findIndex((item) => new Date(item.at).getTime() > now.getTime());
}

/** The hour as the reader's clock says it ("9" or "09" or "21"). */
export function hourWords(value: string, locale: string): string {
  const minutes = parseTime(value) ?? 0;
  const d = new Date(2000, 0, 1, Math.floor(minutes / 60), minutes % 60);
  const parts = new Intl.DateTimeFormat(locale, { hour: 'numeric' }).formatToParts(d);
  return parts.find((p) => p.type === 'hour')?.value ?? String(d.getHours());
}

/** Words that open a line start with a capital where the script has one ("yesterday" → "Yesterday"). */
export function sentence(words: string): string {
  return words.charAt(0).toLocaleUpperCase() + words.slice(1);
}
