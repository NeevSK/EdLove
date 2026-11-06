'use client';

import React from 'react';
import styles from '../self-floor.module.css';

export interface SomaticTelemetryCardProps {
  mindfulMinutesToday: number;
  recoverySignal?: { level: string } | null;
  onTakeBreath: () => void;
  onOpenPulse: () => void;
  titleId?: string;
}

export function SomaticTelemetryCard({
  mindfulMinutesToday,
  recoverySignal,
  onTakeBreath,
  onOpenPulse,
  titleId = 'self-somatic-title',
}: Readonly<SomaticTelemetryCardProps>) {
  return (
    <div className={styles.somaticTelemetrySurface}>
      <div className={styles.hearthAnchorHeader}>
        <p className={styles.eyebrow} style={{ margin: 0 }}>
          Somatic Sanctuary &amp; Health Connect
        </p>
        <h2 id={titleId} className={styles.hearthAnchorTitle}>
          {mindfulMinutesToday > 0
            ? `${mindfulMinutesToday} mindful minutes anchored today`
            : 'Somatic health & calm breathing'}
        </h2>
        <p className={styles.hearthAnchorDesc}>
          Rhythm status:{' '}
          <strong style={{ color: 'var(--w-lamp)' }}>
            {recoverySignal?.level ?? 'serene'} flow
          </strong>{' '}
          · Sovereign Health Port active across browser storage and mobile Health Connect.
        </p>
      </div>
      <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          className={styles.burnButton}
          onClick={onTakeBreath}
          type="button"
          style={{ padding: '0.45rem 0.95rem', fontSize: '0.82rem' }}
        >
          🌿 Take 3-min Breath
        </button>
        <button
          className={styles.catalogOpen}
          onClick={onOpenPulse}
          type="button"
          style={{ borderBottom: '1px solid currentColor', fontSize: '0.8rem' }}
        >
          Open Somatic Pulse →
        </button>
      </div>
    </div>
  );
}
