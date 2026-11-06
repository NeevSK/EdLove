'use client';

import React, { useState, useEffect } from 'react';
import { TemporalHorizonRefined, type TemporalHorizonRefinedProps } from './TemporalHorizonRefined';
import { CircadianClockDial } from './CircadianClockDial';
import styles from './temporal-combo.module.css';

export interface TemporalComboProps extends TemporalHorizonRefinedProps {
  /** Controlled time string (HH:mm). If omitted or undefined, live system time is used */
  time?: string;
  /** Whether to sync with live real-world clock automatically (defaults to true if time is not controlled) */
  live?: boolean;
  /** Initial time format: '24h' or '12h' */
  initialFormat?: '24h' | '12h';
  /** Form factor: nano (ultra-compact badge), compact, medium, full, auto */
  formFactor?: 'nano' | 'compact' | 'medium' | 'full' | 'auto' | 'expandable';
  /** Allow dismissing/removing the clock dial or date horizon */
  allowDismiss?: boolean;
  /** Presentation mode for time: 'digital-bar' (above date) | 'visual-dial' (side card) */
  timeStyle?: 'digital-bar' | 'visual-dial';
  onTimeChange?: (time: string) => void;
  className?: string;
}

/**
 * Mini Real-Time Analog Clock SVG Icon
 * Dynamically renders hour and minute hands matching the exact time.
 */
function RealTimeClockIcon({ hours, minutes }: { hours: number; minutes: number }) {
  const minuteAngle = (minutes / 60) * 360;
  const hourAngle = ((hours % 12) / 12) * 360 + (minutes / 60) * 30;

  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={styles.liveClockSvg}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
      {/* Hour hand */}
      <line
        x1="12"
        y1="12"
        x2="12"
        y2="7"
        stroke="var(--w-lamp)"
        strokeWidth="2"
        transform={`rotate(${hourAngle} 12 12)`}
      />
      {/* Minute hand */}
      <line
        x1="12"
        y1="12"
        x2="12"
        y2="5"
        stroke="currentColor"
        strokeWidth="1.5"
        transform={`rotate(${minuteAngle} 12 12)`}
      />
      <circle cx="12" cy="12" r="1.2" fill="var(--w-lamp)" stroke="none" />
    </svg>
  );
}

/**
 * Format 24-hour HH:mm into 12h or 24h display
 */
function formatTimeDisplay(timeStr: string, format: '24h' | '12h'): { display: string; period?: string } {
  const [hStr, mStr] = timeStr.split(':');
  const h = Number.parseInt(hStr ?? '0', 10);
  const m = String(Number.parseInt(mStr ?? '0', 10)).padStart(2, '0');

  if (format === '24h') {
    return { display: `${String(h).padStart(2, '0')}:${m}` };
  }

  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return { display: `${String(h12).padStart(2, '0')}:${m}`, period };
}

/**
 * TemporalCombo:
 * Unifies Date Horizon and Time into a bounded, responsive component.
 * Features:
 * - Strict container containment with zero overflow or wrapping.
 * - Minimalist, real-time ticking clock.
 * - 12h / 24h format chooser.
 * - Live dynamic analog clock SVG icon.
 */
export function TemporalCombo({
  time,
  live = true,
  initialFormat = '24h',
  allowDismiss = true,
  timeStyle = 'digital-bar',
  onTimeChange,
  className = '',
  ...horizonProps
}: TemporalComboProps) {
  const [showClock, setShowClock] = useState(true);
  const [showDate, setShowDate] = useState(true);
  const [isVisualDialOpen, setIsVisualDialOpen] = useState(false);
  const [timeFormat, setTimeFormat] = useState<'24h' | '12h'>(initialFormat);

  const getSystemTimeStr = () => {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  };

  const [internalTime, setInternalTime] = useState<string>(() => time ?? '12:00');
  const [clockReady, setClockReady] = useState(time !== undefined);

  // Real-time ticking effect: updates every second when live is true and time isn't explicitly fixed
  useEffect(() => {
    if (time !== undefined) {
      setInternalTime(time);
      setClockReady(true);
      return;
    }

    const updateTime = () => {
      setInternalTime(getSystemTimeStr());
      setClockReady(true);
    };
    updateTime();
    if (!live) return;

    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [live, time]);

  // Sync if prop changes externally
  useEffect(() => {
    if (time !== undefined) {
      setInternalTime(time);
    }
  }, [time]);

  const handleTimeChange = (nextTime: string) => {
    setInternalTime(nextTime);
    onTimeChange?.(nextTime);
  };

  const [parsedHours, parsedMinutes] = internalTime.split(':').map((v) => Number.parseInt(v, 10) || 0) as [number, number];
  const { display: currentTimeDisplay, period: currentTimePeriod } = formatTimeDisplay(
    internalTime,
    timeFormat,
  );
  const formattedTime = clockReady ? currentTimeDisplay : '--:--';
  const period = clockReady ? currentTimePeriod : undefined;
  const activeFormFactor = horizonProps.formFactor ?? 'compact';

  // Render helpers for Nano and Compact sub-views (reusable in auto mode)
  const renderNanoPill = () => (
    <div className={styles.nanoComboTile}>
      {/* Left: Clock Nano Icon Button */}
      {showClock && (
        <button
          type="button"
          className={styles.nanoClockBtn}
          onClick={() => setTimeFormat((f) => (f === '24h' ? '12h' : '24h'))}
          title={`Current Time: ${formattedTime} ${period ?? ''} (Tap to toggle 12h/24h)`}
          aria-label={`Current Time: ${formattedTime} ${period ?? ''}`}
        >
          <RealTimeClockIcon hours={parsedHours} minutes={parsedMinutes} />
          <span className={styles.nanoClockTime}>{formattedTime}</span>
        </button>
      )}
      {/* Right: Date Nano Badge */}
      {showDate && (
        <TemporalHorizonRefined
          {...horizonProps}
          formFactor="nano"
          date={horizonProps.date}
        />
      )}
    </div>
  );

  const renderCompactStack = () => (
    <div className={styles.compactComboStack}>
      {/* ROW 1: Minimal Time Readout + SVG clock */}
      {showClock && (
        <div className={styles.compactTimeRow}>
          <button
            type="button"
            className={styles.clockIconBtn}
            onClick={() => setIsVisualDialOpen((v) => !v)}
            title="Tap to toggle analog 24h solar dial"
            aria-expanded={isVisualDialOpen}
          >
            <RealTimeClockIcon hours={parsedHours} minutes={parsedMinutes} />
          </button>
          <button
            type="button"
            className={styles.digitalNumbersBtn}
            onClick={() => setTimeFormat((f) => (f === '24h' ? '12h' : '24h'))}
            title="Click to toggle 12h / 24h format"
          >
            <span className={styles.digitalNumbers} style={{ fontSize: '0.85rem' }}>{formattedTime}</span>
            {period && <span className={styles.periodBadge}>{period}</span>}
          </button>
        </div>
      )}

      {/* Visual Circadian Dial (Reveals when toggled) */}
      {isVisualDialOpen && (
        <div className={styles.visualDialDrawer}>
          <CircadianClockDial
            time={internalTime}
            size={110}
            interactive={true}
            showDigital={false}
            showPhase={false}
            onTimeChange={handleTimeChange}
          />
        </div>
      )}

      {/* ROW 2: Minimal Date with Chevrons (compact pill) */}
      {showDate && (
        <div className={styles.compactDateRow}>
          <TemporalHorizonRefined
            {...horizonProps}
            formFactor="compact"
            date={horizonProps.date}
          />
        </div>
      )}
    </div>
  );

  // NANO & AUTO ADAPTIVE MODE: Ultra-compact unified horizontal pill with Clock on left, Date on right
  if (activeFormFactor === 'nano' || activeFormFactor === 'auto') {
    return (
      <div className={`${styles.nanoComboTile} ${className}`}>
        {/* Left: Clock Nano Icon Button */}
        {showClock && (
          <button
            type="button"
            className={styles.nanoClockBtn}
            onClick={() => setTimeFormat((f) => (f === '24h' ? '12h' : '24h'))}
            title={`Current Time: ${formattedTime} ${period ?? ''} (Tap to toggle 12h/24h)`}
            aria-label={`Current Time: ${formattedTime} ${period ?? ''}`}
          >
            <RealTimeClockIcon hours={parsedHours} minutes={parsedMinutes} />
            <span className={styles.nanoClockTime}>{formattedTime}</span>
          </button>
        )}
        {/* Right: Date Nano Badge */}
        {showDate && (
          <TemporalHorizonRefined
            {...horizonProps}
            formFactor="nano"
            date={horizonProps.date}
          />
        )}
      </div>
    );
  }

  // COMPACT MODE: Two-row minimal quiet stack (Row 1: Minimal Time, Row 2: Minimal Date with Chevrons)
  if (activeFormFactor === 'compact') {
    return (
      <div className={`${styles.compactComboStack} ${className}`}>
        {/* ROW 1: Minimal Time Readout + SVG clock */}
        {showClock && (
          <div className={styles.compactTimeRow}>
            <button
              type="button"
              className={styles.clockIconBtn}
              onClick={() => setIsVisualDialOpen((v) => !v)}
              title="Tap to toggle analog 24h solar dial"
              aria-expanded={isVisualDialOpen}
            >
              <RealTimeClockIcon hours={parsedHours} minutes={parsedMinutes} />
            </button>
            <button
              type="button"
              className={styles.digitalNumbersBtn}
              onClick={() => setTimeFormat((f) => (f === '24h' ? '12h' : '24h'))}
              title="Click to toggle 12h / 24h format"
            >
              <span className={styles.digitalNumbers} style={{ fontSize: '0.85rem' }}>{formattedTime}</span>
              {period && <span className={styles.periodBadge}>{period}</span>}
            </button>
          </div>
        )}

        {/* Visual Circadian Dial (Reveals when toggled) */}
        {isVisualDialOpen && (
          <div className={styles.visualDialDrawer}>
            <CircadianClockDial
              time={internalTime}
              size={110}
              interactive={true}
              showDigital={false}
              showPhase={false}
              onTimeChange={handleTimeChange}
            />
          </div>
        )}

        {/* ROW 2: Minimal Date with Chevrons (compact pill) */}
        {showDate && (
          <div className={styles.compactDateRow}>
            <TemporalHorizonRefined
              {...horizonProps}
              formFactor="compact"
              date={horizonProps.date}
            />
          </div>
        )}
      </div>
    );
  }


  return (
    <div className={`${styles.comboContainer} ${className}`}>
      {/* Top Utility Header with Decoupled Toggle Pills */}
      {allowDismiss && (
        <div className={styles.comboToggleBar}>
          <div className={styles.comboTitleRow}>
            <span className={styles.comboTitle}>Temporal Matrix</span>
          </div>

          <div className={styles.togglePillsGroup}>
            <button
              type="button"
              className={styles.togglePill}
              data-active={showDate}
              onClick={() => setShowDate((v) => !v)}
              title="Toggle Date Horizon"
            >
              Date {showDate ? '✓' : '+'}
            </button>
            <button
              type="button"
              className={styles.togglePill}
              data-active={showClock}
              onClick={() => setShowClock((v) => !v)}
              title="Toggle Time Readout"
            >
              Time {showClock ? '✓' : '+'}
            </button>
            <button
              type="button"
              className={styles.togglePill}
              data-active={isVisualDialOpen}
              onClick={() => setIsVisualDialOpen((v) => !v)}
              title="Toggle 24h Solar Dial"
            >
              Dial {isVisualDialOpen ? '✓' : '+'}
            </button>
          </div>
        </div>
      )}

      {/* Main Integrated Body */}
      <div className={styles.comboCardStack}>
        {/* TIME BAR: Elegant, Minimalist, Real-Time aligned directly ABOVE the Date */}
        {showClock && (
          <div className={styles.timeTopBar}>
            <div className={styles.timeReadoutGroup}>
              {/* Live Analog Clock SVG Button (toggles visual dial) */}
              <button
                type="button"
                className={styles.clockIconBtn}
                onClick={() => setIsVisualDialOpen((v) => !v)}
                title="Tap to toggle analog 24h solar dial"
                aria-expanded={isVisualDialOpen}
              >
                <RealTimeClockIcon hours={parsedHours} minutes={parsedMinutes} />
              </button>

              {/* Digital Time Numbers (click to toggle 12h/24h) */}
              <button
                type="button"
                className={styles.digitalNumbersBtn}
                onClick={() => setTimeFormat((f) => (f === '24h' ? '12h' : '24h'))}
                title="Click to toggle 12h / 24h format"
              >
                <span className={styles.digitalNumbers}>{formattedTime}</span>
                {period && <span className={styles.periodBadge}>{period}</span>}
              </button>
            </div>

            {/* Minimalist 12h / 24h Format Switcher */}
            <div className={styles.formatSwitch}>
              <button
                type="button"
                className={styles.formatBtn}
                data-active={timeFormat === '12h'}
                onClick={() => setTimeFormat('12h')}
                title="Switch to 12-hour clock (AM/PM)"
              >
                12h
              </button>
              <span className={styles.formatDivider}>/</span>
              <button
                type="button"
                className={styles.formatBtn}
                data-active={timeFormat === '24h'}
                onClick={() => setTimeFormat('24h')}
                title="Switch to 24-hour clock"
              >
                24h
              </button>
            </div>
          </div>
        )}

        {/* Visual Circadian Dial (Reveals when toggled) */}
        {isVisualDialOpen && (
          <div className={styles.visualDialDrawer}>
            <CircadianClockDial
              time={internalTime}
              size={120}
              interactive={true}
              showDigital={false}
              showPhase={false}
              onTimeChange={handleTimeChange}
            />
          </div>
        )}

        {/* DATE HORIZON: Positioned directly BELOW the Time Bar */}
        {showDate && (
          <div className={styles.dateBottomSection}>
            <TemporalHorizonRefined {...horizonProps} />
          </div>
        )}
      </div>
    </div>
  );
}
