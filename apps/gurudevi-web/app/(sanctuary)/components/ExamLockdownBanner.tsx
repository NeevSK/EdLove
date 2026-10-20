'use client';

import { Shield, ShieldAlert } from 'lucide-react';
import styles from './exam-lockdown-banner.module.css';
import { useExamLockdown, type ExamViolation } from '@/lib/sanctuary/useExamLockdown';

interface ExamLockdownBannerProps {
  maxWarnings?: number;
  onWarningThresholdReached?: (violations: ExamViolation[]) => void;
}

export function ExamLockdownBanner({
  maxWarnings = 3,
  onWarningThresholdReached,
}: Readonly<ExamLockdownBannerProps>) {
  const {
    isFullscreen,
    warningCount,
    enterFullscreen,
  } = useExamLockdown({
    enabled: true,
    maxWarnings,
    onWarningThresholdReached,
  });

  const hasViolation = warningCount > 0;

  return (
    <div
      role="alert"
      className={`${styles.banner} ${hasViolation ? styles.bannerViolation : ''}`}
    >
      <div className={styles.leftSection}>
        {hasViolation ? <ShieldAlert size={18} /> : <Shield size={18} />}
        <span className={styles.statusText}>
          Exam Lockdown Active
        </span>
        <span className={styles.strikesBadge}>
          {warningCount} / {maxWarnings} Strikes
        </span>
      </div>

      <div>
        {!isFullscreen ? (
          <button
            className={styles.fullscreenBtn}
            type="button"
            onClick={() => void enterFullscreen()}
          >
            Enter Fullscreen Mode
          </button>
        ) : (
          <span style={{ fontSize: '12px', opacity: 0.9 }}>Fullscreen Locked</span>
        )}
      </div>
    </div>
  );
}
