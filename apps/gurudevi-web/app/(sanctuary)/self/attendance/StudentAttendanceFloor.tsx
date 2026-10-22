'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { calculateAttendanceStreak } from '../../../../lib/workspace/attendanceInsights';
import styles from './studentAttendance.module.css';

type StudentAttendanceFloorProps = Readonly<{
  mode: 'account' | 'explore';
  displayName?: string;
  onReturnToOverview?: () => void;
}>;

type DayRecord = Readonly<{
  day: number;
  status: 'present' | 'late' | 'absent' | 'excused' | 'weekend';
}>;

function getDefaultAttendanceRhythm(): readonly ('present' | 'late' | 'absent' | 'excused')[] {
  return [
    'present',
    'present',
    'present',
    'present',
    'present',
    'present',
    'present',
    'present',
    'present',
    'present',
    'present',
    'late',
    'present',
    'present',
    'present',
    'present',
    'present',
    'present',
    'present',
    'present',
    'present',
    'present',
    'present',
    'present',
  ];
}

export function StudentAttendanceFloor({
  mode,
  displayName = 'Learner',
  onReturnToOverview,
}: StudentAttendanceFloorProps) {
  // Baseline attendance rhythm with local/explore mode support
  const [history, setHistory] = useState<readonly ('present' | 'late' | 'absent' | 'excused')[]>(
    getDefaultAttendanceRhythm,
  );

  const streak = useMemo(() => calculateAttendanceStreak(history), [history]);
  const presentCount = history.filter((s) => s === 'present' || s === 'late').length;
  const termPercent = Math.round((presentCount / history.length) * 100);

  // Generate 28 days for current month view
  const days: readonly DayRecord[] = useMemo(() => {
    return Array.from({ length: 28 }, (_, i) => {
      const dayNum = i + 1;
      const isWeekend = dayNum % 7 === 6 || dayNum % 7 === 0;
      if (isWeekend) return { day: dayNum, status: 'weekend' };
      const statusIndex = i % history.length;
      return { day: dayNum, status: history[statusIndex] ?? 'present' };
    });
  }, [history]);

  return (
    <article className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>My Attendance & Habits</h1>
          {onReturnToOverview ? (
            <button
              onClick={onReturnToOverview}
              className={styles.backLink}
              type="button"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', font: 'inherit' }}
            >
              ← Back to Quiet Journal
            </button>
          ) : (
            <Link href="/self" className={styles.backLink}>
              ← Back to Quiet Journal
            </Link>
          )}
        </div>
        <p className={styles.subtitle}>
          Learning is a daily rhythm. Track your consistency, celebrate milestones, and cultivate focused presence.
        </p>
      </header>

      <section className={styles.metricsRow} aria-label="Key attendance metrics">
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Current Streak</span>
            <span className={styles.metricIcon}>🔥</span>
          </div>
          <span className={styles.metricValue}>{streak} Days</span>
          <span className={styles.metricSubtext}>Consecutive classroom presence</span>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Term Consistency</span>
            <span className={styles.metricIcon}>🎯</span>
          </div>
          <span className={styles.metricValue}>{termPercent}%</span>
          <span className={styles.metricSubtext}>{presentCount} of {history.length} school days attended</span>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Roster Continuity</span>
            <span className={styles.metricIcon}>🏛️</span>
          </div>
          <span className={styles.metricValue}>Grade 1+</span>
          <span className={styles.metricSubtext}>Multi-year verified scholarly record</span>
        </div>
      </section>

      <section className={styles.calendarCard} aria-labelledby="calendar-title">
        <div className={styles.calendarHeader}>
          <h2 id="calendar-title" className={styles.calendarTitle}>
            Monthly Attendance Heatmap
          </h2>
          <div className={styles.legend}>
            <div className={styles.legendItem}>
              <span className={`${styles.dot} ${styles.dotPresent}`} /> Present
            </div>
            <div className={styles.legendItem}>
              <span className={`${styles.dot} ${styles.dotLate}`} /> Late
            </div>
            <div className={styles.legendItem}>
              <span className={`${styles.dot} ${styles.dotExcused}`} /> Excused
            </div>
            <div className={styles.legendItem}>
              <span className={`${styles.dot} ${styles.dotAbsent}`} /> Absent
            </div>
          </div>
        </div>

        <div className={styles.monthGrid}>
          {days.map((item) => {
            const statusDotClass =
              item.status === 'present'
                ? styles.dotPresent
                : item.status === 'late'
                  ? styles.dotLate
                  : item.status === 'excused'
                    ? styles.dotExcused
                    : item.status === 'absent'
                      ? styles.dotAbsent
                      : styles.dotWeekend;

            return (
              <div key={item.day} className={styles.dayCell} title={`Day ${item.day}: ${item.status}`}>
                <span className={styles.dayNumber}>{item.day}</span>
                <span className={`${styles.dot} ${statusDotClass}`} />
              </div>
            );
          })}
        </div>
      </section>

      <aside className={styles.pedagogyBanner}>
        <span style={{ fontSize: '1.75rem' }}>🌱</span>
        <div>
          <strong>Wisdom of Practice:</strong> Consistency is not rigid conformity—it is the quiet, reliable ground
          upon which deep inquiry, friendship, and genuine mastery blossom.
        </div>
      </aside>
    </article>
  );
}
