'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  parseCivilDate,
  resolveMonthGrid,
  shiftCivilDate,
  toIsoDate,
} from '@repo/core/logic/workbench';
import type { TemporalDaySlot, TemporalIntent } from '@repo/core/logic/workbench';
import styles from './workbench.module.css';

export type TemporalHorizonProps = Readonly<{
  dateLabel: string;
  compact?: boolean;
  orientation?: string;
  intent?: TemporalIntent;
  slots?: readonly TemporalDaySlot[];
  activityDensity?: Readonly<Record<string, number>>;
  onSelectDate?: (date: string) => void;
  onPrevious?: () => void;
  onToday?: () => void;
  onNext?: () => void;
  onChooseDate?: () => void;
  previousDisabled?: boolean;
  nextDisabled?: boolean;
}>;

function getRelativePhaseLabel(activeDate: string, todayIso: string, intent: TemporalIntent): string {
  if (activeDate === todayIso) return 'Today';
  const dActive = new Date(activeDate + 'T12:00:00');
  const dToday = new Date(todayIso + 'T12:00:00');
  const diffDays = Math.round((dActive.getTime() - dToday.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === -1) return 'Yesterday';
  if (diffDays === 1) return 'Tomorrow';

  if (diffDays < 0) {
    const daysAgo = Math.abs(diffDays);
    if (daysAgo < 7) return `${daysAgo} days ago`;
    if (daysAgo >= 7 && daysAgo <= 10) return 'A week ago';
    if (daysAgo > 10 && daysAgo < 25) {
      const weeks = Math.round(daysAgo / 7);
      return `${weeks} weeks ago`;
    }
    if (daysAgo >= 25 && daysAgo <= 45) return 'A month ago';
    if (daysAgo > 45 && daysAgo < 320) {
      const months = Math.round(daysAgo / 30);
      return `${months} months ago`;
    }
    if (daysAgo >= 320 && daysAgo <= 540) return 'A year ago';
    const years = Math.round(daysAgo / 365);
    return `${years} years ago`;
  }

  // Future horizons
  if (diffDays < 7) return `In ${diffDays} days`;
  if (diffDays >= 7 && diffDays <= 10) return 'In a week';
  if (diffDays > 10 && diffDays < 25) {
    const weeks = Math.round(diffDays / 7);
    return `In ${weeks} weeks`;
  }
  if (diffDays >= 25 && diffDays <= 45) return 'In a month';
  if (diffDays > 45 && diffDays < 320) {
    const months = Math.round(diffDays / 30);
    return `In ${months} months`;
  }
  if (diffDays >= 320 && diffDays <= 540) return 'In a year';
  const years = Math.round(diffDays / 365);
  return `In ${years} years`;
}

const WEEKDAY_HEADERS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const;

/** Compact date navigation keeps full calendar details available on demand. */
export function TemporalHorizon({
  dateLabel,
  compact = false,
  intent = 'current',
  slots,
  activityDensity,
  onSelectDate,
  onPrevious,
  onToday,
  onNext,
  onChooseDate,
  previousDisabled = false,
  nextDisabled = false,
}: TemporalHorizonProps) {
  const isPast = intent === 'review';
  const isFuture = intent === 'plan';

  const selectedSlot = slots?.find((s) => s.isSelected);
  const activeDate = selectedSlot?.date ?? toIsoDate(new Date());
  const todayIso = useMemo(() => toIsoDate(new Date()), []);
  const isActiveDateToday = activeDate === todayIso;

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarIntent, setCalendarIntent] = useState<'review' | 'plan' | null>(null);
  const [viewYear, setViewYear] = useState(() => Number.parseInt(activeDate.slice(0, 4), 10));
  const [viewMonth, setViewMonth] = useState(() => Number.parseInt(activeDate.slice(5, 7), 10) - 1);
  const calendarRef = useRef<HTMLDialogElement>(null);
  const dateButtonRef = useRef<HTMLButtonElement>(null);

  // Sync calendar month when selected date changes externally
  useEffect(() => {
    if (activeDate) {
      setViewYear(Number.parseInt(activeDate.slice(0, 4), 10));
      setViewMonth(Number.parseInt(activeDate.slice(5, 7), 10) - 1);
    }
  }, [activeDate]);

  useEffect(() => {
    const dialog = calendarRef.current;
    if (isCalendarOpen && dialog && !dialog.open) dialog.showModal();
    return () => {
      if (dialog?.open) dialog.close();
    };
  }, [isCalendarOpen]);

  useEffect(() => {
    if (!isCalendarOpen) dateButtonRef.current?.focus({ preventScroll: true });
  }, [isCalendarOpen]);

  const monthGrid = useMemo(() => {
    return resolveMonthGrid(viewYear, viewMonth);
  }, [viewYear, viewMonth]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleDateClick = (targetDate: string) => {
    onSelectDate?.(targetDate);
    setIsCalendarOpen(false);
    setCalendarIntent(null);
  };

  const openDateMode = (mode: 'review' | 'plan') => {
    setCalendarIntent(mode);
    const currentMatchesMode = mode === 'review' ? activeDate < todayIso : activeDate > todayIso;
    if (!currentMatchesMode) {
      const today = parseCivilDate(todayIso);
      setViewYear(today.getFullYear());
      setViewMonth(today.getMonth());
    }
    setIsCalendarOpen(true);
  };

  const selectMode = (mode: 'current' | 'review' | 'plan') => {
    if (mode === 'current') {
      if (onToday) onToday();
      else onSelectDate?.(todayIso);
      return;
    }
    openDateMode(mode);
  };

  const handleStepPrev = () => {
    if (onSelectDate) {
      onSelectDate(shiftCivilDate(activeDate, -1));
    } else if (onPrevious) {
      onPrevious();
    }
  };

  const handleStepNext = () => {
    if (onSelectDate) {
      onSelectDate(shiftCivilDate(activeDate, 1));
    } else if (onNext) {
      onNext();
    }
  };

  const relativeLabel = getRelativePhaseLabel(activeDate, todayIso, intent);
  const yesterdayIso = shiftCivilDate(todayIso, -1);
  const weekAgoIso = shiftCivilDate(todayIso, -7);
  const tomorrowIso = shiftCivilDate(todayIso, 1);
  const weekAheadIso = shiftCivilDate(todayIso, 7);

  // Format short day representation (e.g. "Oct 18")
  const activeCivilDate = parseCivilDate(activeDate);
  const shortDate = new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    ...(activeDate.slice(0, 4) !== todayIso.slice(0, 4) ? { year: 'numeric' as const } : {}),
  }).format(activeCivilDate);

  const activityCount = activityDensity?.[activeDate] ?? 0;

  return (
    <section aria-label="Time context" className={styles.temporalBoxSection} data-compact={compact}>
      <div className={styles.temporalBox} data-intent={intent}>
        <div
          aria-label="Choose time period"
          className={styles.temporalModes}
          data-phase={isActiveDateToday ? 'current' : isPast ? 'review' : isFuture ? 'plan' : 'current'}
          role="group"
        >
          <span aria-hidden="true" className={styles.temporalModePaper} />
          <button
            aria-pressed={isActiveDateToday}
            className={styles.temporalModeButton}
            onClick={() => selectMode('current')}
            type="button"
          >
            <span>Today</span><small>Alive</small>
          </button>
          <button
            aria-pressed={isPast}
            className={styles.temporalModeButton}
            onClick={() => selectMode('review')}
            type="button"
          >
            <span>Past</span><small>Revise</small>
          </button>
          <button
            aria-pressed={isFuture}
            className={styles.temporalModeButton}
            onClick={() => selectMode('plan')}
            type="button"
          >
            <span>Future</span><small>Plan</small>
          </button>
        </div>
        <button
          ref={dateButtonRef}
          type="button"
          className={styles.activeDayPill}
          aria-label={`Choose date, ${dateLabel}`}
          aria-haspopup="dialog"
          aria-expanded={isCalendarOpen}
          onClick={() => {
            if (onChooseDate) onChooseDate();
            else setIsCalendarOpen(true);
          }}
        >
          <span>{shortDate}</span>
          <span aria-hidden="true" className={styles.calendarMark}>🗓️</span>
        </button>
        {!isActiveDateToday ? (
          <span className={styles.boxRelativeLabel} aria-live="polite">
            {relativeLabel}
          </span>
        ) : null}
        <div className={styles.boxControlRow}>
          <button
            type="button"
            className={styles.stepperArrow}
            disabled={previousDisabled}
            onClick={handleStepPrev}
            aria-label="Previous day"
            title="Previous day"
          >‹</button>
          <button
            type="button"
            className={styles.stepperArrow}
            disabled={nextDisabled}
            onClick={handleStepNext}
            aria-label="Next day"
            title="Next day"
          >›</button>
        </div>
        {activityCount > 0 ? (
          <span className={styles.activityCount} title={`${activityCount} records on this date`}>
            {activityCount} {activityCount === 1 ? 'item' : 'items'}
          </span>
        ) : null}
      </div>

      {isCalendarOpen ? (
        <dialog
          ref={calendarRef}
          className={styles.modalBackdrop}
          onClick={(event) => {
            if (event.target === event.currentTarget) setIsCalendarOpen(false);
          }}
          onClose={() => setIsCalendarOpen(false)}
        >
          <div
            className={styles.calendarModalContent}
          >
            <div className={styles.calendarNavRow}>
              <button
                type="button"
                className={styles.calendarNavBtn}
                onClick={handlePrevMonth}
                aria-label="Previous month"
                title="Previous month"
              >
                ‹
              </button>
              <span className={styles.calendarMonthTitle}>
                {monthGrid.monthLabel}
              </span>
              <button
                type="button"
                className={styles.calendarNavBtn}
                onClick={handleNextMonth}
                aria-label="Next month"
                title="Next month"
              >
                ›
              </button>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setIsCalendarOpen(false)}
                aria-label="Close calendar"
              >
                ✕
              </button>
            </div>

            <div className={styles.quickJumpRow}>
              <button
                type="button"
                className={styles.quickJumpPill}
                onClick={() => handleDateClick(todayIso)}
              >
                Today · Alive
              </button>
              <button
                type="button"
                className={styles.quickJumpPill}
                onClick={() => handleDateClick(calendarIntent === 'plan' ? tomorrowIso : yesterdayIso)}
              >
                {calendarIntent === 'plan' ? 'Tomorrow' : 'Yesterday'}
              </button>
              <button
                type="button"
                className={styles.quickJumpPill}
                onClick={() => handleDateClick(calendarIntent === 'plan' ? weekAheadIso : weekAgoIso)}
              >
                {calendarIntent === 'plan' ? 'In 7 days' : '7 days ago'}
              </button>
            </div>

            <div className={styles.calendarWeekdays} aria-hidden="true">
              {WEEKDAY_HEADERS.map((h) => (
                <span key={h} className={styles.calendarWeekdayHeader}>
                  {h}
                </span>
              ))}
            </div>

            <div className={styles.calendarGrid} role="grid">
              {monthGrid.days.map((day) => {
                const count = activityDensity?.[day.date] ?? 0;
                const hasActivity = count > 0;
                const isSelected = day.date === activeDate;

                return (
                  <button
                    key={day.date}
                    disabled={calendarIntent === 'review' ? day.date >= todayIso : calendarIntent === 'plan' ? day.date <= todayIso : false}
                    type="button"
                    className={styles.calendarDayCell}
                    data-current-month={day.isCurrentMonth}
                    data-is-today={day.isToday}
                    data-is-selected={isSelected}
                    data-intent={day.intent}
                    onClick={() => handleDateClick(day.date)}
                    aria-label={`${day.date}${day.isToday ? ' (Today)' : ''}${
                      hasActivity ? ` - ${count} activities` : ''
                    }`}
                  >
                    <span className={styles.calendarDayNum}>{day.dayNumber}</span>
                    <span
                      className={styles.calendarDayBloom}
                      data-has-activity={hasActivity}
                    >
                      {hasActivity ? '•' : ''}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className={styles.calendarDirectJump}>
              <label htmlFor="direct-date-input" className={styles.directJumpLabel}>
                Jump to specific date:
              </label>
              <input
                id="direct-date-input"
                type="date"
                className={styles.directDateInput}
                min={calendarIntent === 'plan' ? tomorrowIso : undefined}
                max={calendarIntent === 'review' ? yesterdayIso : undefined}
                value={activeDate}
                onChange={(e) => {
                  if (e.target.value) {
                    handleDateClick(e.target.value);
                  }
                }}
              />
            </div>
          </div>
        </dialog>
      ) : null}
    </section>
  );
}
