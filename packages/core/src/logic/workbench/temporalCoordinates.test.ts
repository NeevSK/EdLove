import { describe, expect, it } from 'vitest';
import {
  formatCivilDateLabel,
  parseCivilDate,
  resolveMonthGrid,
  resolveTemporalCoordinates,
  resolveTemporalIntent,
  shiftCivilDate,
  toIsoDate,
} from './temporalCoordinates';

describe('temporalCoordinates', () => {
  const fixedNow = new Date(2026, 9, 18, 12, 0, 0); // 2026-10-18
  const todayStr = '2026-10-18';

  it('correctly calculates today as current intent', () => {
    const coords = resolveTemporalCoordinates(todayStr, {
      domain: 'self',
      referenceNow: fixedNow,
    });

    expect(coords.date).toBe('2026-10-18');
    expect(coords.intent).toBe('current');
    expect(coords.isToday).toBe(true);
    expect(coords.isPast).toBe(false);
    expect(coords.isFuture).toBe(false);
    expect(coords.orientationLabel).toContain('Today’s quiet sanctuary orientation');
  });

  it('correctly calculates yesterday as review/past intent', () => {
    const yesterdayStr = '2026-10-17';
    const coords = resolveTemporalCoordinates(yesterdayStr, {
      domain: 'self',
      referenceNow: fixedNow,
    });

    expect(coords.date).toBe(yesterdayStr);
    expect(coords.intent).toBe('review');
    expect(coords.isToday).toBe(false);
    expect(coords.isPast).toBe(true);
    expect(coords.isFuture).toBe(false);
    expect(coords.orientationLabel).toContain('Archival sanctuary reflection');
  });

  it('correctly calculates tomorrow as plan/future intent', () => {
    const tomorrowStr = '2026-10-19';
    const coords = resolveTemporalCoordinates(tomorrowStr, {
      domain: 'workspace',
      referenceNow: fixedNow,
    });

    expect(coords.date).toBe(tomorrowStr);
    expect(coords.intent).toBe('plan');
    expect(coords.isToday).toBe(false);
    expect(coords.isPast).toBe(false);
    expect(coords.isFuture).toBe(true);
    expect(coords.orientationLabel).toContain('Curriculum horizon');
  });

  it('generates a 7-day ribbon window centered on the anchor date', () => {
    const coords = resolveTemporalCoordinates(todayStr, {
      referenceNow: fixedNow,
      windowRadius: 3,
    });

    expect(coords.slots).toHaveLength(7);
    expect(coords.slots[0]?.date).toBe('2026-10-15');
    expect(coords.slots[3]?.date).toBe('2026-10-18');
    expect(coords.slots[3]?.isSelected).toBe(true);
    expect(coords.slots[3]?.isToday).toBe(true);
    expect(coords.slots[6]?.date).toBe('2026-10-21');
  });

  it('shifts dates cleanly across month boundaries', () => {
    const shifted = shiftCivilDate('2026-10-01', -2);
    expect(shifted).toBe('2026-09-29');

    const shiftedForward = shiftCivilDate('2026-10-31', 1);
    expect(shiftedForward).toBe('2026-11-01');
  });

  it('formats human readable date label accurately', () => {
    const label = formatCivilDateLabel('2026-10-18');
    expect(label).toContain('October 18, 2026');
  });

  it('generates a full month grid with correct day count and alignment', () => {
    // October 2026 (month index 9) has 31 days. Oct 1, 2026 is a Thursday (index 4).
    const grid = resolveMonthGrid(2026, 9, fixedNow);

    expect(grid.year).toBe(2026);
    expect(grid.month).toBe(9);
    expect(grid.monthLabel).toContain('October 2026');

    // Total days must be a multiple of 7
    expect(grid.days.length % 7).toBe(0);

    // Filter to current month days
    const currentMonthDays = grid.days.filter((d) => d.isCurrentMonth);
    expect(currentMonthDays).toHaveLength(31);

    // Verify today's flag
    const todayCell = grid.days.find((d) => d.date === '2026-10-18');
    expect(todayCell).toBeDefined();
    expect(todayCell?.isToday).toBe(true);
    expect(todayCell?.intent).toBe('current');

    // Verify a past cell
    const pastCell = grid.days.find((d) => d.date === '2026-10-05');
    expect(pastCell?.intent).toBe('review');

    // Verify a future cell
    const futureCell = grid.days.find((d) => d.date === '2026-10-25');
    expect(futureCell?.intent).toBe('plan');
  });
});
