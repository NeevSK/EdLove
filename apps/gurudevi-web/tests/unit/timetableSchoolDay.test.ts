import { describe, expect, it } from 'vitest';
import { schoolDayFor } from '../../app/(sanctuary)/workspace/timetable/TimetableFloor';

// Local-time constructor: getDay() reads the visitor's own weekday.
const on = (isoDay: string) => {
  const [year, month, day] = isoDay.split('-').map(Number) as [number, number, number];
  return new Date(year, month - 1, day);
};

describe('schoolDayFor', () => {
  it('opens on the current weekday', () => {
    expect(schoolDayFor(on('2026-10-19'))).toBe('Monday');
    expect(schoolDayFor(on('2026-10-20'))).toBe('Tuesday');
    expect(schoolDayFor(on('2026-10-23'))).toBe('Friday');
  });

  it('falls back to Monday on weekends', () => {
    expect(schoolDayFor(on('2026-10-24'))).toBe('Monday');
    expect(schoolDayFor(on('2026-10-25'))).toBe('Monday');
  });
});
