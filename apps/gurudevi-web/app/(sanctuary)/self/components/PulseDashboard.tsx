'use client';

import { BookOpen, Calendar, CircleCheck, Clock, Sparkles } from 'lucide-react';
import { useSanctuaryHealth } from '../../../../lib/sanctuary/selfBrowserAdapters';
import styles from './pulse-dashboard.module.css';

interface PulseDashboardProps {
  userId?: string;
  onClose?: () => void;
}

export function PulseDashboard({ userId, onClose }: PulseDashboardProps) {
  const { mindfulMinutesToday, recoverySignal, recordSession } = useSanctuaryHealth(userId);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h2 className={styles.title}>Daily Pulse & Overview</h2>
          <p className={styles.subtitle}>
            Your living morning threshold: check commitments, energy anchors, and mindful pacing
          </p>
        </div>
      </div>

      <div className={styles.quickPills}>
        <div
          className={styles.pulseCard}
          style={{ cursor: 'pointer' }}
          role="button"
          tabIndex={0}
          onClick={() => {
            void recordSession(180, 'sanctuary_pulse');
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              void recordSession(180, 'sanctuary_pulse');
            }
          }}
          title="Click to anchor a 3-minute Sanctuary Breath"
        >
          <div className={styles.iconCircle}>🌿</div>
          <div className={styles.pulseInfo}>
            <span className={styles.pulseLabel}>Somatic Sanctuary</span>
            <span className={styles.pulseValue}>
              {mindfulMinutesToday} mindful min today • {recoverySignal?.level ?? 'serene'} flow
            </span>
          </div>
        </div>

        <div className={styles.pulseCard}>
          <div className={styles.iconCircle}>🪷</div>
          <div className={styles.pulseInfo}>
            <span className={styles.pulseLabel}>Inner Alignment</span>
            <span className={styles.pulseValue}>Mood Lotus Active</span>
          </div>
        </div>

        <div className={styles.pulseCard}>
          <div className={styles.iconCircle}>⚡</div>
          <div className={styles.pulseInfo}>
            <span className={styles.pulseLabel}>Vitality & Recovery</span>
            <span className={styles.pulseValue}>
              {recoverySignal?.level === 'serene'
                ? 'High Flow (Serene Reserve)'
                : recoverySignal?.level === 'moderate'
                  ? 'Balanced Pacing'
                  : 'Restorative Care Advised'}
              {recoverySignal?.sleepDurationHours
                ? ` · ${recoverySignal.sleepDurationHours}h sleep`
                : ''}
            </span>
          </div>
        </div>

        <div className={styles.pulseCard}>
          <div className={styles.iconCircle}>📋</div>
          <div className={styles.pulseInfo}>
            <span className={styles.pulseLabel}>Pending Commitments</span>
            <span className={styles.pulseValue}>Pending commitments are unavailable offline</span>
          </div>
        </div>
      </div>
    </div>
  );
}
