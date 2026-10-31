export interface PeriodSlotInput {
  periodNumber: number;
  startTime: string;
  endTime: string;
  subject: string;
  className: string;
  classroomId?: string;
  roomVenue?: string;
  type?: string;
}

export type PeriodDispatchStatus =
  | 'in_period'
  | 'interval'
  | 'free_period'
  | 'before_school'
  | 'after_school';

export interface ActivePeriodSlot {
  periodNumber: number;
  startTime: string;
  endTime: string;
  remainingMinutes: number;
  subject: string;
  className: string;
  classroomId?: string;
  roomVenue?: string;
  type: string;
}

export interface UpcomingPeriodSlot {
  periodNumber: number;
  startTime: string;
  endTime: string;
  startsInMinutes: number;
  subject: string;
  className: string;
  classroomId?: string;
  roomVenue?: string;
  type: string;
}

export interface PeriodDispatchResult {
  status: PeriodDispatchStatus;
  currentSlot: ActivePeriodSlot | null;
  nextSlot: UpcomingPeriodSlot | null;
  dayMinutes: number;
}

/**
 * Parses time formats into minutes from midnight (0 - 1439).
 * Supports: "08:30", "8:30", "08:30:00", "8:30 AM", "1:15 PM", "12:00 PM", "12:30 AM"
 */
export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const trimmed = timeStr.trim();
  const isPm = /pm$/i.test(trimmed);
  const isAm = /am$/i.test(trimmed);
  const clean = trimmed.replace(/\s*(am|pm)$/i, '');
  const parts = clean.split(':').map((p) => Number.parseInt(p, 10));

  let hours = parts[0] ?? 0;
  const minutes = parts[1] ?? 0;

  if (isPm && hours < 12) hours += 12;
  if (isAm && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

/**
 * Resolves the active and upcoming timetable period relative to the given wall-clock time.
 */
export function resolveActivePeriod(
  periods: readonly PeriodSlotInput[],
  currentTime: Date | string = new Date(),
): PeriodDispatchResult {
  if (!periods || periods.length === 0) {
    return {
      status: 'free_period',
      currentSlot: null,
      nextSlot: null,
      dayMinutes: 0,
    };
  }

  const curMinutes =
    typeof currentTime === 'string'
      ? parseTimeToMinutes(currentTime)
      : currentTime.getHours() * 60 + currentTime.getMinutes();

  // Normalize, calculate minute spans, and sort periods by start time
  const normalized = periods
    .map((p) => ({
      ...p,
      type: p.type || 'subject',
      startMin: parseTimeToMinutes(p.startTime),
      endMin: parseTimeToMinutes(p.endTime),
    }))
    .filter((p) => !Number.isNaN(p.startMin) && !Number.isNaN(p.endMin) && p.endMin > p.startMin)
    .sort((a, b) => a.startMin - b.startMin);

  if (normalized.length === 0) {
    return {
      status: 'free_period',
      currentSlot: null,
      nextSlot: null,
      dayMinutes: curMinutes,
    };
  }

  const firstSlot = normalized[0]!;
  const lastSlot = normalized[normalized.length - 1]!;

  // 1. Before first period starts
  if (curMinutes < firstSlot.startMin) {
    return {
      status: 'before_school',
      currentSlot: null,
      nextSlot: {
        periodNumber: firstSlot.periodNumber,
        startTime: firstSlot.startTime,
        endTime: firstSlot.endTime,
        startsInMinutes: firstSlot.startMin - curMinutes,
        subject: firstSlot.subject,
        className: firstSlot.className,
        classroomId: firstSlot.classroomId,
        roomVenue: firstSlot.roomVenue,
        type: firstSlot.type,
      },
      dayMinutes: curMinutes,
    };
  }

  // 2. After last period ends
  if (curMinutes >= lastSlot.endMin) {
    return {
      status: 'after_school',
      currentSlot: null,
      nextSlot: null,
      dayMinutes: curMinutes,
    };
  }

  // 3. Check for active in-period slot
  for (let i = 0; i < normalized.length; i++) {
    const slot = normalized[i]!;
    if (curMinutes >= slot.startMin && curMinutes < slot.endMin) {
      const next = normalized[i + 1];
      return {
        status: 'in_period',
        currentSlot: {
          periodNumber: slot.periodNumber,
          startTime: slot.startTime,
          endTime: slot.endTime,
          remainingMinutes: slot.endMin - curMinutes,
          subject: slot.subject,
          className: slot.className,
          classroomId: slot.classroomId,
          roomVenue: slot.roomVenue,
          type: slot.type,
        },
        nextSlot: next
          ? {
              periodNumber: next.periodNumber,
              startTime: next.startTime,
              endTime: next.endTime,
              startsInMinutes: next.startMin - curMinutes,
              subject: next.subject,
              className: next.className,
              classroomId: next.classroomId,
              roomVenue: next.roomVenue,
              type: next.type,
            }
          : null,
        dayMinutes: curMinutes,
      };
    }
  }

  // 4. In between periods (interval / passing period / recess)
  const nextSlot = normalized.find((p) => p.startMin > curMinutes);
  return {
    status: 'interval',
    currentSlot: null,
    nextSlot: nextSlot
      ? {
          periodNumber: nextSlot.periodNumber,
          startTime: nextSlot.startTime,
          endTime: nextSlot.endTime,
          startsInMinutes: nextSlot.startMin - curMinutes,
          subject: nextSlot.subject,
          className: nextSlot.className,
          classroomId: nextSlot.classroomId,
          roomVenue: nextSlot.roomVenue,
          type: nextSlot.type,
        }
      : null,
    dayMinutes: curMinutes,
  };
}
