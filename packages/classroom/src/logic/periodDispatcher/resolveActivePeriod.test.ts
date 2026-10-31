import { describe, expect, it } from 'vitest';
import {
  type PeriodSlotInput,
  parseTimeToMinutes,
  resolveActivePeriod,
} from './resolveActivePeriod';

describe('parseTimeToMinutes', () => {
  it('parses 24-hour formats', () => {
    expect(parseTimeToMinutes('08:00')).toBe(480);
    expect(parseTimeToMinutes('09:45')).toBe(585);
    expect(parseTimeToMinutes('13:30')).toBe(810);
  });

  it('parses 12-hour AM/PM formats', () => {
    expect(parseTimeToMinutes('8:00 AM')).toBe(480);
    expect(parseTimeToMinutes('12:00 PM')).toBe(720);
    expect(parseTimeToMinutes('1:15 PM')).toBe(795);
    expect(parseTimeToMinutes('12:15 AM')).toBe(15);
  });
});

describe('resolveActivePeriod', () => {
  const mockSchedule: PeriodSlotInput[] = [
    {
      periodNumber: 1,
      startTime: '08:00',
      endTime: '08:45',
      subject: 'Mathematics',
      className: 'Grade 10-A',
      roomVenue: 'Room 12',
    },
    {
      periodNumber: 2,
      startTime: '08:50',
      endTime: '09:35',
      subject: 'Science',
      className: 'Grade 10-B',
      roomVenue: 'Lab 2',
    },
    {
      periodNumber: 3,
      startTime: '09:50',
      endTime: '10:35',
      subject: 'Physics',
      className: 'Grade 11-A',
      roomVenue: 'Lab 1',
    },
  ];

  it('detects before_school when time is earlier than first period', () => {
    const result = resolveActivePeriod(mockSchedule, '07:30');
    expect(result.status).toBe('before_school');
    expect(result.currentSlot).toBeNull();
    expect(result.nextSlot).not.toBeNull();
    expect(result.nextSlot?.periodNumber).toBe(1);
    expect(result.nextSlot?.startsInMinutes).toBe(30); // 8:00 - 7:30 = 30m
  });

  it('detects in_period with remaining minutes', () => {
    const result = resolveActivePeriod(mockSchedule, '08:15');
    expect(result.status).toBe('in_period');
    expect(result.currentSlot).not.toBeNull();
    expect(result.currentSlot?.periodNumber).toBe(1);
    expect(result.currentSlot?.subject).toBe('Mathematics');
    expect(result.currentSlot?.remainingMinutes).toBe(30); // 8:45 - 8:15 = 30m
    expect(result.nextSlot?.periodNumber).toBe(2);
  });

  it('detects interval between periods', () => {
    const result = resolveActivePeriod(mockSchedule, '08:47');
    expect(result.status).toBe('interval');
    expect(result.currentSlot).toBeNull();
    expect(result.nextSlot).not.toBeNull();
    expect(result.nextSlot?.periodNumber).toBe(2);
    expect(result.nextSlot?.startsInMinutes).toBe(3); // 8:50 - 8:47 = 3m
  });

  it('detects after_school when time is past the last period', () => {
    const result = resolveActivePeriod(mockSchedule, '11:00');
    expect(result.status).toBe('after_school');
    expect(result.currentSlot).toBeNull();
    expect(result.nextSlot).toBeNull();
  });

  it('handles empty schedules safely', () => {
    const result = resolveActivePeriod([], '09:00');
    expect(result.status).toBe('free_period');
    expect(result.currentSlot).toBeNull();
    expect(result.nextSlot).toBeNull();
  });
});

