import { describe, expect, it } from 'vitest';
import { dataBudgetState, foldDataSample, inDailyWindow, localDay } from './dataBudget';

const LK = 330; // Sri Lanka, UTC+05:30
const MB = 1024 * 1024;
// 2026-10-24 10:00 in Colombo.
const MORNING = Date.UTC(2026, 9, 24, 4, 30);

describe('the data budget ledger', () => {
  it('counts the difference between samples within a day', () => {
    let ledger = foldDataSample(null, { atWallMs: MORNING, totalBytes: 500 * MB }, LK);
    ledger = foldDataSample(ledger, { atWallMs: MORNING + 60_000, totalBytes: 530 * MB }, LK);
    expect(ledger).toEqual({ day: '2026-10-24', usedBytes: 30 * MB, lastTotal: 530 * MB });
  });

  it('a reboot (the total goes down) counts the new total as new traffic, never negative', () => {
    let ledger = foldDataSample(null, { atWallMs: MORNING, totalBytes: 500 * MB }, LK);
    ledger = foldDataSample(ledger, { atWallMs: MORNING + 60_000, totalBytes: 4 * MB }, LK);
    expect(ledger?.usedBytes).toBe(4 * MB);
  });

  it('starts each local day from zero, at local midnight, not UTC midnight', () => {
    const beforeMidnight = Date.UTC(2026, 9, 24, 18, 29); // 23:59 in Colombo
    const afterMidnight = Date.UTC(2026, 9, 24, 18, 31); // 00:01 next day in Colombo
    expect(localDay(afterMidnight, LK)).toBe('2026-10-25');
    let ledger = foldDataSample(null, { atWallMs: beforeMidnight, totalBytes: 100 * MB }, LK);
    ledger = foldDataSample(ledger, { atWallMs: beforeMidnight + 30_000, totalBytes: 150 * MB }, LK);
    ledger = foldDataSample(ledger, { atWallMs: afterMidnight, totalBytes: 160 * MB }, LK);
    expect(ledger).toEqual({ day: '2026-10-25', usedBytes: 10 * MB, lastTotal: 160 * MB });
  });

  it('an unsupported counter changes nothing; no reading is unknown, never spent', () => {
    expect(foldDataSample(null, { atWallMs: MORNING, totalBytes: -1 }, LK)).toBeNull();
    expect(dataBudgetState(null, 50 * MB, MORNING, LK)).toBe('unknown');
  });

  it('is spent at the allowance, and fresh again the next day', () => {
    const ledger = { day: '2026-10-24', usedBytes: 50 * MB, lastTotal: 0 };
    expect(dataBudgetState(ledger, 50 * MB, MORNING, LK)).toBe('spent');
    expect(dataBudgetState(ledger, 60 * MB, MORNING, LK)).toBe('within');
    expect(dataBudgetState(ledger, 50 * MB, MORNING + 24 * 3_600_000, LK)).toBe('within');
  });
});

describe('daily windows (a cheap night window)', () => {
  it('handles a window that wraps midnight, in local time', () => {
    const at = (h: number, m: number) => Date.UTC(2026, 9, 24, h, m) - LK * 60_000;
    expect(inDailyWindow(at(23, 30), LK, 23 * 60, 6 * 60)).toBe(true);
    expect(inDailyWindow(at(5, 59), LK, 23 * 60, 6 * 60)).toBe(true);
    expect(inDailyWindow(at(6, 0), LK, 23 * 60, 6 * 60)).toBe(false);
    expect(inDailyWindow(at(12, 0), LK, 23 * 60, 6 * 60)).toBe(false);
    expect(inDailyWindow(at(12, 0), LK, 9 * 60, 17 * 60)).toBe(true);
    expect(inDailyWindow(at(12, 0), LK, 300, 300)).toBe(false);
  });
});
