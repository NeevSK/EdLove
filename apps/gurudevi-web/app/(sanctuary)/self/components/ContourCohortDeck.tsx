'use client';

import React from 'react';
import type { SelfFeatureManifestItem } from '@repo/self/features/catalog';
import styles from '../self-floor.module.css';

/**
 * Splits items into balanced rows with a maximum of `maxPerRow` (default 3 for asymmetric bento columns).
 * Prevents awkward single orphan items by balancing row distributions:
 * - 4 items => 2 on row 1, 2 on row 2 (instead of 3-1)
 * - 5 items => 3 on row 1, 2 on row 2 (instead of 4-1 or 3-1-1)
 * - 6 items => 3 on row 1, 3 on row 2 (instead of 4-2)
 * - 7 items => 3 on row 1, 2 on row 2, 2 on row 3
 * - 8 items => 3 on row 1, 3 on row 2, 2 on row 3 (clean 3-3-2)
 */
export function balancePebbleRows<T>(items: readonly T[], maxPerRow = 3): T[][] {
  const n = items.length;
  if (n <= maxPerRow) {
    return [items as T[]];
  }
  if (n === 4) {
    return [items.slice(0, 2) as T[], items.slice(2) as T[]];
  }
  if (n === 5) {
    return [items.slice(0, 3) as T[], items.slice(3) as T[]];
  }
  if (n === 6) {
    return [items.slice(0, 3) as T[], items.slice(3) as T[]];
  }
  if (n === 7) {
    return [items.slice(0, 3) as T[], items.slice(3, 5) as T[], items.slice(5) as T[]];
  }
  if (n === 8) {
    return [items.slice(0, 3) as T[], items.slice(3, 6) as T[], items.slice(6) as T[]];
  }

  // General balanced distribution for larger N:
  const rowCount = Math.ceil(n / maxPerRow);
  const baseSize = Math.floor(n / rowCount);
  const remainder = n % rowCount;
  const rows: T[][] = [];
  let startIndex = 0;
  for (let i = 0; i < rowCount; i++) {
    const size = baseSize + (i < remainder ? 1 : 0);
    rows.push(items.slice(startIndex, startIndex + size) as T[]);
    startIndex += size;
  }
  return rows;
}

export interface ContourCohortDeckProps {
  id: string;
  icon: string;
  title: string;
  meta?: string;
  maxPerRow?: number;
  features: readonly SelfFeatureManifestItem[];
  renderItem: (feature: SelfFeatureManifestItem) => React.ReactNode;
}

export function ContourCohortDeck({
  id,
  icon,
  title,
  meta,
  maxPerRow = 3,
  features,
  renderItem,
}: Readonly<ContourCohortDeckProps>) {
  if (features.length === 0) return null;

  const rows = balancePebbleRows(features, maxPerRow);

  return (
    <section aria-labelledby={`cohort-${id}`} className={styles.contourCohort}>
      <div className={styles.cohortHeader}>
        <h4 id={`cohort-${id}`} className={styles.cohortTitle}>
          <span aria-hidden="true" style={{ marginRight: '0.4rem' }}>{icon}</span>
          {title}
        </h4>
        {meta ? <span className={styles.cohortMeta}>{meta}</span> : null}
      </div>
      <div className={styles.cohortRowsContainer}>
        {rows.map((row, rowIndex) => (
          <div key={`cohort-${id}-row-${rowIndex}`} className={styles.cohortPebbleRow}>
            {row.map((feature) => (
              <div key={`cohort-${id}-${feature.id}`} className={styles.cohortPebbleCell}>
                {renderItem(feature)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
