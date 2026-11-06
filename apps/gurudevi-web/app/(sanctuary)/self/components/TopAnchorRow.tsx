'use client';

import React from 'react';
import { Pebble } from '@repo/ui/components/web';
import type { SelfFeatureManifestItem } from '@repo/self/features/catalog';
import styles from '../self-floor.module.css';

export interface TopAnchorRowProps {
  displayName?: string;
  phase?: 'morning' | 'afternoon' | 'night';
  mindfulMinutesToday?: number;
  breathFeature?: SelfFeatureManifestItem;
  moodLotusFeature?: SelfFeatureManifestItem;
  onOpenFeature: (feature: SelfFeatureManifestItem) => void;
  temporalIntent?: 'current' | 'review' | 'plan';
  formattedDate?: string;
}

export function TopAnchorRow({
  breathFeature,
  moodLotusFeature,
  onOpenFeature,
}: Readonly<TopAnchorRowProps>) {
  if (!breathFeature && !moodLotusFeature) return null;

  return (
    <div className={styles.topAnchorRow}>
      {breathFeature && (
        <div className={styles.topPebbleItem}>
          <span className={styles.topPebbleLabel}>🌿 Somatic Anchor</span>
          <div className={styles.cohortPebbleCell}>
            <Pebble
              title={breathFeature.label}
              emoji={breathFeature.emoji}
              rhythm="3-min Vagal Reset"
              gear="auto"
              onPress={() => onOpenFeature(breathFeature)}
              titleAttr={`${breathFeature.label} · Take a calming breath`}
            />
          </div>
        </div>
      )}

      {moodLotusFeature && (
        <div className={styles.topPebbleItem}>
          <span className={styles.topPebbleLabel}>🪷 Inner Weather</span>
          <div className={styles.cohortPebbleCell}>
            <Pebble
              title={moodLotusFeature.label}
              emoji={moodLotusFeature.emoji}
              rhythm="Mood Lotus"
              gear="auto"
              onPress={() => onOpenFeature(moodLotusFeature)}
              titleAttr={`${moodLotusFeature.label} · Check inner weather`}
            />
          </div>
        </div>
      )}
    </div>
  );
}
