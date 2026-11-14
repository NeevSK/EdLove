/**
 * The data budget's accounting (playbook B3): this app's bytes against a daily allowance.
 * Pure: the host samples the platform's counters (Android `TrafficStats` per-UID bytes since
 * boot) and keeps the ledger in verger's store. Counters reset at reboot, so a total that goes
 * down is a new boot: what it shows is new traffic, never a negative. The day is the user's
 * local calendar day (the offset is passed in: Sri Lanka is +330 minutes).
 */

export interface DataLedger {
  /** Local calendar day the bytes belong to, `YYYY-MM-DD`. */
  readonly day: string;
  /** Bytes this app moved today. */
  readonly usedBytes: number;
  /** The counter's last total since boot, to take the next difference from. */
  readonly lastTotal: number;
}

export interface DataSample {
  readonly atWallMs: number;
  /** Bytes received and sent since boot; negative means the platform does not count them. */
  readonly totalBytes: number;
}

export type DataBudgetState = 'within' | 'spent' | 'unknown';

const MINUTE_MS = 60_000;

/** The local calendar day of a wall time, for a fixed offset from UTC in minutes. */
export function localDay(atWallMs: number, utcOffsetMinutes: number): string {
  return new Date(atWallMs + utcOffsetMinutes * MINUTE_MS).toISOString().slice(0, 10);
}

/**
 * Folds one sample into the ledger. A new day starts from zero; a total below the last one is a
 * reboot, so the whole new total is today's new traffic. An unsupported counter changes nothing.
 */
export function foldDataSample(
  ledger: DataLedger | null,
  sample: DataSample,
  utcOffsetMinutes: number,
): DataLedger | null {
  if (!Number.isFinite(sample.totalBytes) || sample.totalBytes < 0) return ledger;
  const day = localDay(sample.atWallMs, utcOffsetMinutes);
  if (ledger === null) return { day, usedBytes: 0, lastTotal: sample.totalBytes };
  const moved =
    sample.totalBytes >= ledger.lastTotal ? sample.totalBytes - ledger.lastTotal : sample.totalBytes;
  return {
    day,
    usedBytes: (day === ledger.day ? ledger.usedBytes : 0) + moved,
    lastTotal: sample.totalBytes,
  };
}

/** Whether today's allowance is spent. No ledger, or one from another day, is unknown or fresh. */
export function dataBudgetState(
  ledger: DataLedger | null,
  allowanceBytes: number,
  atWallMs: number,
  utcOffsetMinutes: number,
): DataBudgetState {
  if (ledger === null) return 'unknown';
  if (ledger.day !== localDay(atWallMs, utcOffsetMinutes)) return 'within';
  return ledger.usedBytes >= allowanceBytes ? 'spent' : 'within';
}

/**
 * Whether a local time falls in a daily window given in minutes after midnight, `[start, end)`.
 * A window may wrap midnight (a night window from 23:00 to 06:00 is `start 1380, end 360`);
 * equal ends mean no window.
 */
export function inDailyWindow(
  atWallMs: number,
  utcOffsetMinutes: number,
  startMinute: number,
  endMinute: number,
): boolean {
  const local = new Date(atWallMs + utcOffsetMinutes * MINUTE_MS);
  const minute = local.getUTCHours() * 60 + local.getUTCMinutes();
  if (startMinute === endMinute) return false;
  return startMinute < endMinute
    ? minute >= startMinute && minute < endMinute
    : minute >= startMinute || minute < endMinute;
}

const DAY = /^\d{4}-\d{2}-\d{2}$/;

/** A stored ledger, checked strictly: anything malformed is no ledger (unknown, never spent). */
export function parseDataLedger(text: string | null): DataLedger | null {
  if (text === null) return null;
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    return null;
  }
  if (typeof value !== 'object' || value === null) return null;
  const { day, usedBytes, lastTotal } = value as Record<string, unknown>;
  const count = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n) && n >= 0;
  if (typeof day !== 'string' || !DAY.test(day) || !count(usedBytes) || !count(lastTotal)) return null;
  return { day, usedBytes, lastTotal };
}
