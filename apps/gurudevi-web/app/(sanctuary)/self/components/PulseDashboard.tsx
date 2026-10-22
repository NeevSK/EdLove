'use client';

import { usePendingActions } from '@repo/core/hooks';
import { BookOpen, Calendar, CircleCheck, Clock, Sparkles } from '@repo/ui/icons';
import styles from './pulse-dashboard.module.css';

interface PulseDashboardProps {
  userId?: string;
  onClose?: () => void;
}

export function PulseDashboard({ userId, onClose }: PulseDashboardProps) {
  const { data: pendingActions = [] } = usePendingActions(userId ?? 'guest');

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
            <span className={styles.pulseLabel}>Vitality Status</span>
            <span className={styles.pulseValue}>Level 4 (High Flow)</span>
          </div>
        </div>

        <div className={styles.pulseCard}>
          <div className={styles.iconCircle}>📋</div>
          <div className={styles.pulseInfo}>
            <span className={styles.pulseLabel}>Pending Commitments</span>
            <span className={styles.pulseValue}>
              {pendingActions.length > 0 ? `${pendingActions.length} Actions due today` : 'Runway clear'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
