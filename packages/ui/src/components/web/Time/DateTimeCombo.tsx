'use client';

import React, { useState, useEffect } from 'react';
import type { DateTimeComboContract } from '../../../theme/contracts';
import { Date, type DateProps } from './Date';
import { RealTimeClockIcon, Time } from './Clock';
import { CircadianClockDial } from './CircadianClockDial';

const styles = new Proxy({}, {
  get: (_, prop: string) => `gd-combo-${prop}`,
}) as Record<string, string>;

export interface DateTimeComboProps extends DateProps {
  /** Controlled time string (HH:mm). If omitted or undefined, live system time is used */
  time?: string;
  /** Whether to sync with live real-world clock automatically (defaults to true if time is not controlled) */
  live?: boolean;
  /** Initial time format: '24h' or '12h' */
  initialFormat?: '24h' | '12h';
  timeFormat?: '24h' | '12h';
  /** Form factor: nano (ultra-compact badge), compact, medium, full, auto, expandable */
  formFactor?: 'nano' | 'compact' | 'medium' | 'full' | 'auto' | 'expandable';
  /** Allow dismissing/removing the clock dial or date horizon */
  allowDismiss?: boolean;
  /** Presentation mode for time: 'digital-bar' (above date) | 'visual-dial' (side card) */
  timeStyle?: 'digital-bar' | 'visual-dial';
  onTimeChange?: (time: string) => void;
  className?: string;
  style?: React.CSSProperties;
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
 * DateTimeCombo:
 * Unifies Date Horizon and Time into a bounded, responsive component.
 * Features:
 * - Strict container containment with zero overflow or wrapping.
 * - Minimalist, real-time ticking clock.
 * - 12h / 24h format chooser.
 * - Live dynamic analog clock SVG icon.
 * - In-situ expandable Circadian solar dial drawer.
 */
export function DateTimeCombo({
  time,
  live = true,
  initialFormat = '24h',
  timeFormat: explicitTimeFormat,
  allowDismiss = true,
  timeStyle = 'digital-bar',
  onTimeChange,
  className = '',
  style,
  ...horizonProps
}: DateTimeComboProps) {
  const [showClock, setShowClock] = useState(true);
  const [showDate, setShowDate] = useState(true);
  const [isVisualDialOpen, setIsVisualDialOpen] = useState(false);
  const [timeFormat, setTimeFormat] = useState<'24h' | '12h'>(explicitTimeFormat ?? initialFormat);

  const getSystemTimeStr = () => {
    const now = new globalThis.Date();
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

  useEffect(() => {
    if (explicitTimeFormat) {
      setTimeFormat(explicitTimeFormat);
    }
  }, [explicitTimeFormat]);

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

  // NANO & AUTO ADAPTIVE MODE: Ultra-compact unified horizontal pill with Clock on left, Date on right
  if (activeFormFactor === 'nano' || activeFormFactor === 'auto') {
    return (
      <div className={`${styles.nanoComboTile} ${className}`} style={style}>
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
          <Date
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
      <div className={`${styles.compactComboStack} ${className}`} style={style}>
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
            <Date
              {...horizonProps}
              formFactor="compact"
              date={horizonProps.date}
            />
          </div>
        )}
      </div>
    );
  }

  // MEDIUM & FULL FORM FACTORS: Rich Stacks
  return (
    <div className={`${styles.fullComboStack} ${className}`} style={style}>
      {showClock && (
        <div className={styles.fullTimeHeader}>
          <div className={styles.fullClockCluster}>
            <button
              type="button"
              className={styles.clockIconBtn}
              onClick={() => setIsVisualDialOpen((v) => !v)}
              title="Toggle visual solar dial"
            >
              <RealTimeClockIcon hours={parsedHours} minutes={parsedMinutes} />
            </button>
            <span className={styles.fullClockTime}>{formattedTime}</span>
            {period && <span className={styles.periodBadge}>{period}</span>}
          </div>

          <div className={styles.formatChooserPill}>
            <button
              type="button"
              className={styles.formatChooserBtn}
              data-active={timeFormat === '24h'}
              onClick={() => setTimeFormat('24h')}
            >
              24h
            </button>
            <button
              type="button"
              className={styles.formatChooserBtn}
              data-active={timeFormat === '12h'}
              onClick={() => setTimeFormat('12h')}
            >
              12h
            </button>
          </div>
        </div>
      )}

      {/* Circadian Dial Drawer */}
      {isVisualDialOpen && (
        <div className={styles.visualDialDrawer}>
          <CircadianClockDial
            time={internalTime}
            size={120}
            interactive={true}
            onTimeChange={handleTimeChange}
          />
        </div>
      )}

      {/* Date Horizon Component */}
      {showDate && (
        <Date
          {...horizonProps}
          formFactor={activeFormFactor}
        />
      )}
    </div>
  );
}
