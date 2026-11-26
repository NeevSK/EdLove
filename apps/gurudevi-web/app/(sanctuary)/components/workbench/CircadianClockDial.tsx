import React, { useId, useMemo } from 'react';
import { phaseOfMinute } from '@repo/ui/theme/scene';
import type { Phase } from '@repo/ui/theme';
import styles from './circadian-clock-dial.module.css';

export interface CircadianClockDialProps {
  /** Time string in HH:mm or HH:mm:ss format, or Date object */
  time?: string | Date;
  /** Size in pixels (default 120) */
  size?: number;
  /** Whether to show digital readout below the dial */
  showDigital?: boolean;
  /** Whether to show circadian phase label (e.g. Dawn, Midday, Dusk) */
  showPhase?: boolean;
  /** Interactive step buttons (+15m, -15m) */
  interactive?: boolean;
  /** Callback on time change (HH:mm) */
  onTimeChange?: (time: string) => void;
  className?: string;
}

export interface DiurnalPhaseInfo {
  phase: Phase;
  name: string;
  energy: string;
  icon: string;
}

const PHASE_METADATA: Record<Phase, { name: string; energy: string; icon: string }> = {
  predawn: { name: 'Brahma Muhūrta', energy: 'Still Ether', icon: '✦' },
  dawn: { name: 'Dawn Awakening', energy: 'Ascending Fire', icon: '☼' },
  morning: { name: 'Solar Zenith', energy: 'Radiant Mind', icon: '☀' },
  afternoon: { name: 'Afternoon Guild', energy: 'Sustained Flow', icon: '◒' },
  dusk: { name: 'Twilight Sandhyā', energy: 'Golden Dissolution', icon: '☽' },
  night: { name: 'Deep Night Silence', energy: 'Restful Void', icon: '●' },
};

export function getDiurnalPhase(totalMinutes: number): DiurnalPhaseInfo {
  const phase = phaseOfMinute(totalMinutes);
  const meta = PHASE_METADATA[phase];
  return {
    phase,
    name: meta.name,
    energy: meta.energy,
    icon: meta.icon,
  };
}

export function CircadianClockDial({
  time = '10:30',
  size = 130,
  showDigital = true,
  showPhase = true,
  interactive = false,
  onTimeChange,
  className = '',
}: CircadianClockDialProps) {
  const gradientId = useId();

  // Parse hours and minutes
  const { hours, minutes, totalMinutes } = useMemo(() => {
    if (time instanceof Date) {
      const h = time.getHours();
      const m = time.getMinutes();
      return { hours: h, minutes: m, totalMinutes: h * 60 + m };
    }
    const parts = (typeof time === 'string' ? time : '12:00').split(':');
    const h = Number.parseInt(parts[0] ?? '12', 10) || 0;
    const m = Number.parseInt(parts[1] ?? '0', 10) || 0;
    return { hours: h, minutes: m, totalMinutes: h * 60 + m };
  }, [time]);

  const diurnal = useMemo(() => getDiurnalPhase(totalMinutes), [totalMinutes]);

  // Hand rotations: 12-hour analog and 24-hour sun position
  const hourAngle = ((hours % 12) + minutes / 60) * 30; // 360 / 12 = 30 deg
  const minuteAngle = (minutes / 60) * 360;
  // 24-hour solar sweep angle (top 12:00 is solar zenith)
  const solarAngle = (totalMinutes / (24 * 60)) * 360;

  const handleShiftMinutes = (delta: number) => {
    let next = totalMinutes + delta;
    if (next < 0) next += 24 * 60;
    next = next % (24 * 60);
    const nextH = Math.floor(next / 60);
    const nextM = next % 60;
    const formatted = `${String(nextH).padStart(2, '0')}:${String(nextM).padStart(2, '0')}`;
    onTimeChange?.(formatted);
  };

  const formattedDigital = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

  return (
    <div className={`${styles.clockContainer} ${className}`} style={{ width: size + 40 }}>
      {/* Dial SVG */}
      <div className={styles.dialFrame} style={{ width: size, height: size }}>
        <svg viewBox="0 0 100 100" className={styles.clockSvg}>
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--w-lamp)" />
              <stop offset="100%" stopColor="color-mix(in srgb, var(--w-lamp) 30%, transparent)" />
            </linearGradient>
          </defs>

          {/* Outer 24-hour Circadian Ring */}
          <circle cx="50" cy="50" r="46" className={styles.outerRim} />

          {/* Sun / Moon Solar Arc indicator on 24h rim */}
          <g transform={`rotate(${solarAngle} 50 50)`}>
            <circle cx="50" cy="4" r="3" className={styles.solarBead} />
          </g>

          {/* 12 Hour Ticks */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = i * 30;
            const isCardinal = i % 3 === 0;
            return (
              <line
                key={i}
                x1="50"
                y1={isCardinal ? '10' : '12'}
                x2="50"
                y2="15"
                transform={`rotate(${angle} 50 50)`}
                className={isCardinal ? styles.cardinalTick : styles.minorTick}
              />
            );
          })}

          {/* Hour Hand */}
          <line
            x1="50"
            y1="50"
            x2="50"
            y2="28"
            transform={`rotate(${hourAngle} 50 50)`}
            className={styles.hourHand}
          />

          {/* Minute Hand */}
          <line
            x1="50"
            y1="50"
            x2="50"
            y2="18"
            transform={`rotate(${minuteAngle} 50 50)`}
            className={styles.minuteHand}
          />

          {/* Center Jewel / Pivot */}
          <circle cx="50" cy="50" r="3.5" className={styles.centerPivot} />
          <circle cx="50" cy="50" r="1.5" fill="var(--w-lamp)" />
        </svg>
      </div>

      {/* Digital Readout & Circadian Phase */}
      {showDigital && (
        <div className={styles.readoutGroup}>
          <span className={styles.digitalTime}>{formattedDigital}</span>
          {showPhase && (
            <span className={styles.phaseLabel}>
              <span>{diurnal.icon}</span>
              <span>{diurnal.name}</span>
            </span>
          )}
        </div>
      )}

      {/* Interactive Micro Steppers */}
      {interactive && (
        <div className={styles.stepperRow}>
          <button
            type="button"
            className={styles.stepBtn}
            onClick={() => handleShiftMinutes(-15)}
            title="Step back 15 minutes"
          >
            -15m
          </button>
          <button
            type="button"
            className={styles.stepBtn}
            onClick={() => handleShiftMinutes(-5)}
            title="Step back 5 minutes"
          >
            -5m
          </button>
          <button
            type="button"
            className={styles.stepBtn}
            onClick={() => handleShiftMinutes(5)}
            title="Step forward 5 minutes"
          >
            +5m
          </button>
          <button
            type="button"
            className={styles.stepBtn}
            onClick={() => handleShiftMinutes(15)}
            title="Step forward 15 minutes"
          >
            +15m
          </button>
        </div>
      )}
    </div>
  );
}
