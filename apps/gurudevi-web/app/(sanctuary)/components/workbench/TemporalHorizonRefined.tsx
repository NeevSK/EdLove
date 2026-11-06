'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  parseCivilDate,
  resolveMonthGrid,
  shiftCivilDate,
  toIsoDate,
} from '@repo/core/logic/workbench';
import type { TemporalIntent } from '@repo/core/logic/workbench';
import { ScrollArea } from '@repo/ui/components/web';
import styles from './temporal-horizon-refined.module.css';

export interface TemporalHorizonRefinedProps {
  /** Form factor: nano tile, micro compact pill, medium window bar, full floor bar, auto-stepping, or auto-expandable in-situ */
  formFactor?: 'nano' | 'compact' | 'medium' | 'full' | 'auto' | 'expandable';
  /** The ISO date string (YYYY-MM-DD) */
  date?: string;
  /** Explicit date label */
  dateLabel?: string;
  /** Temporal intent */
  intent?: TemporalIntent;
  /** Optional reference today date */
  today?: string;
  /** Activity density record per date (defaults to empty) */
  activityDensity?: Readonly<Record<string, number>>;
  /** Handlers */
  onSelectDate?: (date: string) => void;
  onPrevious?: () => void;
  onNext?: () => void;
  onToday?: () => void;
  previousDisabled?: boolean;
  nextDisabled?: boolean;
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const;

export function TemporalHorizonRefined({
  formFactor = 'full',
  date,
  dateLabel,
  intent = 'current',
  today,
  activityDensity,
  onSelectDate,
  onPrevious,
  onNext,
  onToday,
  previousDisabled = false,
  nextDisabled = false,
}: TemporalHorizonRefinedProps) {
  const todayIso = useMemo(() => today ?? toIsoDate(new Date()), [today]);
  const activeDate = date ?? todayIso;
  const isToday = activeDate === todayIso;
  const resolvedIntent: TemporalIntent =
    intent !== 'current'
      ? intent
      : activeDate < todayIso
      ? 'review'
      : activeDate > todayIso
      ? 'plan'
      : 'current';

  const [isTrayOpen, setIsTrayOpen] = useState(formFactor === 'expandable');
  const [isDirectTyping, setIsDirectTyping] = useState(false);
  const [directInputVal, setDirectInputVal] = useState(activeDate);

  // Calendar View month & year (auto-tracks activeDate when it moves across months)
  const [viewYear, setViewYear] = useState(() => Number.parseInt(activeDate.slice(0, 4), 10));
  const [viewMonth, setViewMonth] = useState(() => Number.parseInt(activeDate.slice(5, 7), 10) - 1);

  // Keep calendar page strictly synced when activeDate moves
  useEffect(() => {
    const y = Number.parseInt(activeDate.slice(0, 4), 10);
    const m = Number.parseInt(activeDate.slice(5, 7), 10) - 1;
    if (!Number.isNaN(y) && !Number.isNaN(m)) {
      setViewYear(y);
      setViewMonth(m);
    }
  }, [activeDate]);

  const monthGrid = useMemo(() => resolveMonthGrid(viewYear, viewMonth), [viewYear, viewMonth]);

  const shortDate = useMemo(() => {
    const d = parseCivilDate(activeDate);
    return new Intl.DateTimeFormat(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      ...(activeDate.slice(0, 4) !== todayIso.slice(0, 4) ? { year: 'numeric' } : {}),
    }).format(d);
  }, [activeDate, todayIso]);

  /**
   * Consolidated Goto Handler:
   * Sets target date and ensures calendar view aligns to that target's month.
   */
  const handleGoto = (targetDate: string, closeTrayOnSelect = false) => {
    onSelectDate?.(targetDate);
    const parsedYear = Number.parseInt(targetDate.slice(0, 4), 10);
    const parsedMonth = Number.parseInt(targetDate.slice(5, 7), 10) - 1;
    if (!Number.isNaN(parsedYear) && !Number.isNaN(parsedMonth)) {
      setViewYear(parsedYear);
      setViewMonth(parsedMonth);
    }
    if (closeTrayOnSelect && formFactor !== 'expandable') {
      setIsTrayOpen(false);
    }
  };

  const handleStep = (direction: -1 | 1) => {
    const nextDate = shiftCivilDate(activeDate, direction);
    if (onSelectDate) {
      handleGoto(nextDate);
    } else if (direction === -1) {
      onPrevious?.();
    } else {
      onNext?.();
    }
  };

  const handleDirectTypeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = directInputVal.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
      handleGoto(clean);
      setIsDirectTyping(false);
    }
  };

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

  /**
   * Contextual Leaps with Minimal Emojis:
   * Rendered only when Past or Future is active.
   */
  const contextualLeaps = useMemo(() => {
    if (resolvedIntent === 'review') {
      return [
        { label: 'Yesterday', emoji: '⏮️', target: shiftCivilDate(todayIso, -1), title: '1 day ago' },
        { label: '3d ago', emoji: '⏪', target: shiftCivilDate(todayIso, -3), title: '3 days ago' },
        { label: '1w ago', emoji: '📅', target: shiftCivilDate(todayIso, -7), title: '1 week ago' },
        { label: '2w ago', emoji: '🗓️', target: shiftCivilDate(todayIso, -14), title: '2 weeks ago' },
        { label: '1mo ago', emoji: '📜', target: shiftCivilDate(todayIso, -30), title: '1 month ago' },
      ];
    }
    if (resolvedIntent === 'plan') {
      return [
        { label: 'Tomorrow', emoji: '⏭️', target: shiftCivilDate(todayIso, 1), title: 'Tomorrow' },
        { label: 'In 3d', emoji: '⏩', target: shiftCivilDate(todayIso, 3), title: 'In 3 days' },
        { label: 'In 1w', emoji: '📅', target: shiftCivilDate(todayIso, 7), title: 'In 1 week' },
        { label: 'In 2w', emoji: '🗓️', target: shiftCivilDate(todayIso, 14), title: 'In 2 weeks' },
        { label: 'In 1mo', emoji: '🌱', target: shiftCivilDate(todayIso, 30), title: 'In 1 month' },
      ];
    }
    return [];
  }, [resolvedIntent, todayIso]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isDirectTyping) return;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handleStep(-1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleStep(1);
    } else if (e.key === 'Home' || (e.key === 't' && !e.ctrlKey && !e.metaKey)) {
      e.preventDefault();
      handleGoto(todayIso);
    }
  };

  return (
    <div
      className={styles.root}
      data-formfactor={formFactor}
      data-compact={formFactor === 'compact'}
      data-medium={formFactor === 'medium'}
      data-nano={formFactor === 'nano'}
      onKeyDown={handleKeyDown}
      tabIndex={formFactor === 'compact' || formFactor === 'nano' ? 0 : undefined}
      role={formFactor === 'compact' || formFactor === 'nano' ? 'region' : undefined}
      aria-label={formFactor === 'compact' || formFactor === 'nano' ? 'Date navigator. Use left/right arrow keys to change day, T for today.' : undefined}
    >
      {/* Screen Reader Live Region for dynamic date changes */}
      <div className={styles.srOnlyLive} aria-live="polite" aria-atomic="true">
        {`Selected date: ${shortDate}. Mode: ${resolvedIntent}.`}
      </div>

      {/* 0. FORM FACTOR: NANO TILE (When space cannot meaningfully hold text or chevrons) */}
      {formFactor === 'nano' && (
        <div className={styles.nanoContainer}>
          <button
            type="button"
            className={styles.nanoDayBadge}
            onClick={() => setIsTrayOpen((prev) => !prev)}
            aria-expanded={isTrayOpen}
            aria-label={`${shortDate}. Temporal mode: ${resolvedIntent}. Tap to open calendar`}
            title={`${shortDate} (${resolvedIntent.toUpperCase()}) - Tap to open calendar`}
          >
            {/* Day of week (e.g. "Tu", "Mo", "We") - primary anchor for teachers & timetables */}
            <span className={styles.nanoDayHeader} data-intent={resolvedIntent}>
              {new Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(parseCivilDate(activeDate)).slice(0, 2)}
            </span>
            <span className={styles.nanoDayNumber}>{activeDate.slice(8, 10)}</span>
          </button>
        </div>
      )}

      {/* 1. FORM FACTOR: MICRO COMPACT PILL (Ultra-compact, zero-slop) */}
      {formFactor === 'compact' && (
        <div className={styles.compactBar}>
          <button
            type="button"
            className={styles.chevronBtn}
            onClick={() => handleStep(-1)}
            disabled={previousDisabled}
            aria-label="Previous day"
          >
            ‹
          </button>
          <button
            type="button"
            className={styles.compactDateBtn}
            onClick={() => setIsTrayOpen((prev) => !prev)}
            aria-expanded={isTrayOpen}
          >
            <span className={styles.phasePip} data-intent={resolvedIntent} />
            <span>{shortDate}</span>
          </button>
          <button
            type="button"
            className={styles.chevronBtn}
            onClick={() => handleStep(1)}
            disabled={nextDisabled}
            aria-label="Next day"
          >
            ›
          </button>
        </div>
      )}

      {/* 2. FORM FACTOR: MEDIUM SINGLE-ROW ADAPTIVE BAR (For Minimized Windows / Narrow Sidebars) */}
      {formFactor === 'medium' && (
        <div className={styles.mediumBar}>
          <button
            type="button"
            className={styles.chevronBtn}
            onClick={() => handleStep(-1)}
            disabled={previousDisabled}
            aria-label="Previous day"
          >
            ‹
          </button>
          <button
            type="button"
            className={styles.mediumDateTrigger}
            onClick={() => setIsTrayOpen((prev) => !prev)}
            aria-expanded={isTrayOpen}
          >
            <span>{dateLabel ?? shortDate}</span>
          </button>
          {/* Mini Calendar-like Day Number Badge (e.g. 01, 23) with Phase Accent */}
          <button
            type="button"
            className={styles.mediumDayBadge}
            onClick={() => setIsTrayOpen((prev) => !prev)}
            title={`Day ${activeDate.slice(8, 10)} (${resolvedIntent.toUpperCase()}) - Click to view calendar`}
            aria-label={`Selected day ${activeDate.slice(8, 10)}`}
          >
            <span className={styles.mediumDayBadgeHeader} data-intent={resolvedIntent}>
              {new Intl.DateTimeFormat(undefined, { month: 'narrow' }).format(parseCivilDate(activeDate))}
            </span>
            <span className={styles.mediumDayBadgeNumber}>{activeDate.slice(8, 10)}</span>
          </button>
          <button
            type="button"
            className={styles.chevronBtn}
            onClick={() => handleStep(1)}
            disabled={nextDisabled}
            aria-label="Next day"
          >
            ›
          </button>
        </div>
      )}

      {/* 3 & 4. FULL & EXPANDABLE HORIZON STACK */}
      {(formFactor === 'full' || formFactor === 'expandable') && (
        <div className={styles.fullBarContainer}>
          {/* TOP ROW: Pure Date with Clickable Calendar Icon on the RIGHT */}
          <div className={styles.anchorTopRow}>
            {/* Left Stepper */}
            <button
              type="button"
              className={styles.stepperBtnFlank}
              onClick={() => handleStep(-1)}
              disabled={previousDisabled}
              aria-label="Previous day"
              title="Previous day"
            >
              ‹
            </button>

            {/* Center Anchor: Pure Date with Calendar Icon on the RIGHT */}
            <div className={styles.dateDisplayWrapper}>
              <span className={styles.pureDateHeading}>
                {dateLabel ?? shortDate}
              </span>

              {/* Clickable Calendar Icon Button (on the RIGHT) */}
              <button
                type="button"
                className={styles.calendarIconBtn}
                onClick={() => setIsTrayOpen((prev) => !prev)}
                aria-expanded={isTrayOpen}
                aria-label="Toggle calendar drawer"
                title="Tap calendar icon to open/close month grid"
              >
                <svg
                  className={styles.calendarSvg}
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                  <circle cx="8" cy="14" r="1" fill="currentColor" />
                  <circle cx="12" cy="14" r="1" fill="currentColor" />
                  <circle cx="16" cy="14" r="1" fill="currentColor" />
                  <circle cx="8" cy="18" r="1" fill="currentColor" />
                  <circle cx="12" cy="18" r="1" fill="currentColor" />
                </svg>
              </button>
            </div>

            {/* Right Stepper */}
            <button
              type="button"
              className={styles.stepperBtnFlank}
              onClick={() => handleStep(1)}
              disabled={nextDisabled}
              aria-label="Next day"
              title="Next day"
            >
              ›
            </button>
          </div>

          {/* BOTTOM ROW: Intent Switchboard (Past / Revise, Today / Alive, Future / Plan) + Pencil Date Picker */}
          <div className={styles.intentBottomRow}>
            {/* 3-Way Intent Slider with Proper Dual Labels */}
            <div
              className={styles.phaseTrack}
              data-phase={resolvedIntent}
              role="group"
              aria-label="Temporal Horizon Modes"
            >
              <span aria-hidden="true" className={styles.phaseSliderPaper} />
              <button
                type="button"
                className={styles.phaseBtn}
                aria-pressed={resolvedIntent === 'review'}
                onClick={() => {
                  if (activeDate >= todayIso) handleGoto(shiftCivilDate(todayIso, -1));
                }}
              >
                <div className={styles.phaseBtnContent}>
                  <div className={styles.phaseTitleRow}>
                    <svg
                      className={styles.phaseSvg}
                      data-intent="review"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <polygon points="11 19 2 12 11 5 11 19" />
                      <polygon points="22 19 13 12 22 5 22 19" />
                    </svg>
                    <span className={styles.phasePrimaryText}>Past</span>
                  </div>
                  <span className={styles.phaseSubText}>Revise</span>
                </div>
              </button>
              <button
                type="button"
                className={styles.phaseBtn}
                aria-pressed={resolvedIntent === 'current'}
                onClick={() => {
                  if (onToday) onToday();
                  else handleGoto(todayIso);
                }}
              >
                <div className={styles.phaseBtnContent}>
                  <div className={styles.phaseTitleRow}>
                    <svg
                      className={styles.phaseSvg}
                      data-intent="current"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="12" r="5" fill="currentColor" fillOpacity="0.3" />
                      <line x1="12" y1="1" x2="12" y2="3" />
                      <line x1="12" y1="21" x2="12" y2="23" />
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                      <line x1="1" y1="12" x2="3" y2="12" />
                      <line x1="21" y1="12" x2="23" y2="12" />
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                    </svg>
                    <span className={styles.phasePrimaryText}>Today</span>
                  </div>
                  <span className={styles.phaseSubText}>Alive</span>
                </div>
              </button>
              {/* 3. Future Button (Icon placed on the RIGHT for elegant spatial symmetry) */}
              <button
                type="button"
                className={styles.phaseBtn}
                aria-pressed={resolvedIntent === 'plan'}
                onClick={() => {
                  if (activeDate <= todayIso) handleGoto(shiftCivilDate(todayIso, 1));
                }}
              >
                <div className={styles.phaseBtnContent}>
                  <div className={styles.phaseTitleRow}>
                    <span className={styles.phasePrimaryText}>Future</span>
                    <svg
                      className={styles.phaseSvg}
                      data-intent="plan"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <polygon points="13 19 22 12 13 5 13 19" />
                      <polygon points="2 19 11 12 2 5 2 19" />
                    </svg>
                  </div>
                  <span className={styles.phaseSubText}>Plan</span>
                </div>
              </button>
            </div>

            {/* Icon-Only Custom Date Picker (Pencil) */}
            <div className={styles.pickerZone}>
              {isDirectTyping ? (
                <form onSubmit={handleDirectTypeSubmit} className={styles.dateDirectInputForm}>
                  <input
                    type="text"
                    className={styles.dateDirectInput}
                    value={directInputVal}
                    placeholder="YYYY-MM-DD"
                    autoFocus
                    onChange={(e) => setDirectInputVal(e.target.value)}
                    aria-label="Type date directly"
                  />
                  <button type="submit" className={styles.dateDirectConfirmBtn}>
                    Go
                  </button>
                  <button
                    type="button"
                    className={styles.dateDirectCancelBtn}
                    onClick={() => {
                      setDirectInputVal(activeDate);
                      setIsDirectTyping(false);
                    }}
                  >
                    ✕
                  </button>
                </form>
              ) : (
                <>
                  <button
                    type="button"
                    className={styles.datePickerIconBtn}
                    onClick={() => {
                      setDirectInputVal(activeDate);
                      setIsDirectTyping(true);
                    }}
                    title="Pick custom date"
                    aria-label="Pick custom date"
                  >
                    ✏️
                  </button>
                  <span className={styles.datePickerTooltip}>Pick date</span>
                </>
              )}
            </div>
          </div>

          {/* DYNAMIC THIRD ROW: REVEALS ONLY WHEN IN PAST OR FUTURE */}
          {contextualLeaps.length > 0 && (
            <div className={styles.dynamicLeapsRow}>
              <div className={styles.leapsScrollWrapper}>
                <ScrollArea showEdgeGradients={true}>
                  {contextualLeaps.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      className={styles.leapPillBtn}
                      data-active={activeDate === preset.target}
                      onClick={() => handleGoto(preset.target)}
                      title={preset.title}
                    >
                      <span className={styles.leapEmoji}>{preset.emoji}</span>
                      <span>{preset.label}</span>
                    </button>
                  ))}
                </ScrollArea>
              </div>
            </div>
          )}
        </div>
      )}

      {/* IN-SITU EXPANDABLE CALENDAR TRAY */}
      {isTrayOpen && (
        <div className={styles.calendarTray} role="region" aria-label="Interactive Calendar Drawer">
          <div className={styles.trayHeader}>
            <button
              type="button"
              className={styles.trayNavBtn}
              onClick={handlePrevMonth}
              aria-label="Previous month"
            >
              ‹
            </button>
            <span className={styles.monthTitle}>{monthGrid.monthLabel}</span>
            <button
              type="button"
              className={styles.trayNavBtn}
              onClick={handleNextMonth}
              aria-label="Next month"
            >
              ›
            </button>
          </div>

          {/* Weekday Labels */}
          <div className={styles.weekdaysGrid}>
            {WEEKDAYS.map((wd) => (
              <span key={wd} className={styles.weekdayLabel}>
                {wd}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className={styles.daysGrid} role="grid">
            {monthGrid.days.map((cell) => {
              const isSelected = cell.date === activeDate;
              const isTodayCell = cell.isToday;
              const hasActivity = (activityDensity?.[cell.date] ?? 0) > 0;

              return (
                <button
                  key={cell.date}
                  type="button"
                  className={styles.dayCell}
                  data-selected={isSelected}
                  data-today={isTodayCell}
                  data-outside={!cell.isCurrentMonth}
                  onClick={() => handleGoto(cell.date, true)}
                  aria-label={`${cell.dayNumber} ${!cell.isCurrentMonth ? '(outside month)' : ''}`}
                >
                  <span>{cell.dayNumber}</span>
                  {hasActivity && <span className={styles.dayPip} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
