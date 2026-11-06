'use client';

import React, { useState, useEffect } from 'react';
import type { TimeContract } from '../../../theme/contracts';

const styles = new Proxy({}, {
  get: (_, prop: string) => `gd-time-${prop}`,
}) as Record<string, string>;

export interface TimeProps extends TimeContract {
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
 * Mini Real-Time Analog Clock SVG Icon
 * Dynamically renders hour and minute hands matching exact current hours and minutes.
 */
export function RealTimeClockIcon({ hours, minutes }: { hours: number; minutes: number }) {
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
      {/* Hour hand in glowing world lamp accent */}
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
      {/* Center jewel pin */}
      <circle cx="12" cy="12" r="1.2" fill="var(--w-lamp)" stroke="none" />
    </svg>
  );
}

/**
 * Time:
 * Clean, zero-drama time component with live ticking clock, 12h/24h toggle,
 * and dynamic SVG analog hands.
 */
export function Time({
  time,
  onChange,
  format = '24h',
  live = true,
  showAnalog = true,
  disabled = false,
  className = '',
  style,
}: TimeProps) {
  const getSystemTimeStr = () => {
    const now = new globalThis.Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  };

  const [internalTime, setInternalTime] = useState<string>(() => time ?? getSystemTimeStr());
  const [internalFormat, setInternalFormat] = useState<'12h' | '24h'>(format);

  // Sync internalTime with real-world clock every second if live and not controlled externally
  useEffect(() => {
    if (time !== undefined) {
      setInternalTime(time);
      return;
    }

    if (!live) return;

    setInternalTime(getSystemTimeStr());
    const interval = setInterval(() => {
      setInternalTime(getSystemTimeStr());
    }, 1000);

    return () => clearInterval(interval);
  }, [live, time]);

  // Sync format prop changes
  useEffect(() => {
    setInternalFormat(format);
  }, [format]);

  const activeTime = time ?? internalTime;
  const [hours, minutes] = activeTime.split(':').map((v) => Number.parseInt(v, 10) || 0) as [number, number];
  const { display, period } = formatTimeDisplay(activeTime, internalFormat);

  const toggleFormat = () => {
    if (disabled) return;
    const nextFormat = internalFormat === '24h' ? '12h' : '24h';
    setInternalFormat(nextFormat);
  };

  return (
    <div
      className={`${styles.timeRoot} ${className}`}
      style={style}
      role="group"
      aria-label={`Time: ${display} ${period ?? ''}`}
    >
      {showAnalog && (
        <span className={styles.analogWrapper} aria-hidden="true">
          <RealTimeClockIcon hours={hours} minutes={minutes} />
        </span>
      )}

      <button
        type="button"
        className={styles.timeDigitalBtn}
        onClick={toggleFormat}
        disabled={disabled}
        title="Tap to toggle 12-hour / 24-hour display"
        aria-label={`Current time ${display} ${period ?? ''}. Tap to toggle time format`}
      >
        <span className={styles.digitalNumbers}>{display}</span>
        {period && <span className={styles.periodBadge}>{period}</span>}
      </button>

      {/* Discrete 24H format tag indicator */}
      {internalFormat === '24h' && (
        <span className={styles.formatIndicator} aria-hidden="true">
          <span className={styles.formatTag}>24h</span>
        </span>
      )}
    </div>
  );
}
