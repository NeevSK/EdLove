import type { TemporalIntent } from '../../types/Workbench';

export interface TemporalDaySlot {
  readonly date: string;
  readonly dayNumber: number;
  readonly weekdayShort: string;
  readonly isToday: boolean;
  readonly isSelected: boolean;
  readonly intent: TemporalIntent;
}

export interface DomainTemporalCoordinates {
  readonly date: string;
  readonly scale: string;
  readonly intent: TemporalIntent;
  readonly isToday: boolean;
  readonly isPast: boolean;
  readonly isFuture: boolean;
  readonly dateLabel: string;
  readonly orientationLabel: string;
  readonly slots: readonly TemporalDaySlot[];
}

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

function pad(num: number): string {
  return String(num).padStart(2, '0');
}

export function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseCivilDate(dateStr: string): Date {
  const parts = dateStr.slice(0, 10).split('-');
  if (parts.length === 3) {
    const year = Number.parseInt(parts[0]!, 10);
    const month = Number.parseInt(parts[1]!, 10) - 1;
    const day = Number.parseInt(parts[2]!, 10);
    if (!Number.isNaN(year) && !Number.isNaN(month) && !Number.isNaN(day)) {
      return new Date(year, month, day, 12, 0, 0, 0);
    }
  }
  return new Date();
}

export function shiftCivilDate(dateStr: string, days: number): string {
  const date = parseCivilDate(dateStr);
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
}

export function formatCivilDateLabel(dateStr: string): string {
  const date = parseCivilDate(dateStr);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function resolveTemporalIntent(dateStr: string, todayStr: string): TemporalIntent {
  if (dateStr === todayStr) return 'current';
  return dateStr < todayStr ? 'review' : 'plan';
}

export function getDomainOrientationCopy(domain: string, intent: TemporalIntent): string {
  switch (domain) {
    case 'self':
      switch (intent) {
        case 'current':
          return 'Today’s quiet sanctuary orientation. Living reflection and active practice.';
        case 'review':
          return 'Archival sanctuary reflection. Revisiting past moments and burned embers.';
        case 'plan':
          return 'Future intentional horizon. Preparing mindful intentions and quiet space.';
      }
      break;
    case 'workspace':
      switch (intent) {
        case 'current':
          return 'Active school day. Live attendance registers, period pulse, and classroom flow.';
        case 'review':
          return 'Certified institutional records. Historical attendance audit and longitudinal trends.';
        case 'plan':
          return 'Curriculum horizon. Upcoming lesson schedules, timetables, and resource bookings.';
      }
      break;
    case 'community':
      switch (intent) {
        case 'current':
          return 'Live hearth. Real-time dialogue, presence pulses, and open circles.';
        case 'review':
          return 'Echoes of wisdom. Concluded gatherings, recordings, and shared community archives.';
        case 'plan':
          return 'Upcoming vigils. Communal assemblies and scheduled inquiry circles.';
      }
      break;
    case 'library':
      switch (intent) {
        case 'current':
          return 'Desk open. Active reading volume and in-progress annotations.';
        case 'review':
          return 'Reading trail. Historical manuscripts, explored concepts, and marginalia.';
        case 'plan':
          return 'Reading queue. Upcoming study cycles and seasonal research inquiries.';
      }
      break;
    default:
      switch (intent) {
        case 'current':
          return 'Present moment. Active operations and real-time synchronization.';
        case 'review':
          return 'Historical review. Immutable records and archival audit.';
        case 'plan':
          return 'Projected plan. Intentions and forward scheduling.';
      }
  }
}

export interface ResolveTemporalOptions {
  readonly scale?: string;
  readonly domain?: string;
  readonly referenceNow?: Date;
  readonly windowRadius?: number; // e.g. 3 days before and 3 days after = 7 slots total
}

export function resolveTemporalCoordinates(
  anchorDate: string,
  options: ResolveTemporalOptions = {},
): DomainTemporalCoordinates {
  const {
    scale = 'day',
    domain = 'self',
    referenceNow = new Date(),
    windowRadius = 3,
  } = options;

  const todayStr = toIsoDate(referenceNow);
  const normalizedAnchor = anchorDate ? anchorDate.slice(0, 10) : todayStr;
  const intent = resolveTemporalIntent(normalizedAnchor, todayStr);

  const slots: TemporalDaySlot[] = [];
  for (let offset = -windowRadius; offset <= windowRadius; offset++) {
    const slotDateStr = shiftCivilDate(normalizedAnchor, offset);
    const slotDate = parseCivilDate(slotDateStr);
    const slotIntent = resolveTemporalIntent(slotDateStr, todayStr);

    slots.push({
      date: slotDateStr,
      dayNumber: slotDate.getDate(),
      weekdayShort: WEEKDAY_NAMES[slotDate.getDay()] ?? 'Day',
      isToday: slotDateStr === todayStr,
      isSelected: slotDateStr === normalizedAnchor,
      intent: slotIntent,
    });
  }

  return {
    date: normalizedAnchor,
    scale,
    intent,
    isToday: intent === 'current',
    isPast: intent === 'review',
    isFuture: intent === 'plan',
    dateLabel: formatCivilDateLabel(normalizedAnchor),
    orientationLabel: getDomainOrientationCopy(domain, intent),
    slots,
  };
}

export interface MonthGridDay {
  readonly date: string;
  readonly dayNumber: number;
  readonly isCurrentMonth: boolean;
  readonly isToday: boolean;
  readonly intent: TemporalIntent;
}

export interface MonthGridCoordinates {
  readonly year: number;
  readonly month: number;
  readonly monthLabel: string;
  readonly days: readonly MonthGridDay[];
}

export function resolveMonthGrid(
  year: number,
  month: number,
  referenceNow: Date = new Date(),
): MonthGridCoordinates {
  const todayStr = toIsoDate(referenceNow);
  const firstOfMonth = new Date(year, month, 1, 12, 0, 0, 0);
  const lastOfMonth = new Date(year, month + 1, 0, 12, 0, 0, 0);
  const totalDays = lastOfMonth.getDate();
  const startDayOfWeek = firstOfMonth.getDay(); // 0 = Sun

  const days: MonthGridDay[] = [];

  // Previous month padding
  const lastOfPrevMonth = new Date(year, month, 0, 12, 0, 0, 0);
  const prevMonthTotalDays = lastOfPrevMonth.getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const dayNum = prevMonthTotalDays - i;
    const padDate = new Date(year, month - 1, dayNum, 12, 0, 0, 0);
    const dateStr = toIsoDate(padDate);
    days.push({
      date: dateStr,
      dayNumber: dayNum,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      intent: resolveTemporalIntent(dateStr, todayStr),
    });
  }

  // Current month days
  for (let dayNum = 1; dayNum <= totalDays; dayNum++) {
    const currDate = new Date(year, month, dayNum, 12, 0, 0, 0);
    const dateStr = toIsoDate(currDate);
    days.push({
      date: dateStr,
      dayNumber: dayNum,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      intent: resolveTemporalIntent(dateStr, todayStr),
    });
  }

  // Trailing next month padding to complete row
  const trailingCount = (7 - (days.length % 7)) % 7;
  for (let dayNum = 1; dayNum <= trailingCount; dayNum++) {
    const nextDate = new Date(year, month + 1, dayNum, 12, 0, 0, 0);
    const dateStr = toIsoDate(nextDate);
    days.push({
      date: dateStr,
      dayNumber: dayNum,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      intent: resolveTemporalIntent(dateStr, todayStr),
    });
  }

  const monthLabel = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(firstOfMonth);

  return {
    year,
    month,
    monthLabel,
    days,
  };
}
