'use client';

import type { WorkbenchTaskDescriptor } from '@repo/core/types';
import type { SelfFeatureManifestItem } from '@repo/self/features/catalog';
import type { useSelfCanvas } from '../../../../lib/canvas/useSelfCanvas';
import styles from '../self-floor.module.css';
import { categoryTitle } from './SelfOverview';

export function SelfCatalogRail({
  canvas,
  focusedTask,
  onOpenFeature,
  onReturnToOverview,
}: Readonly<{
  canvas: ReturnType<typeof useSelfCanvas>;
  focusedTask: WorkbenchTaskDescriptor | null;
  onOpenFeature: (feature: SelfFeatureManifestItem) => void;
  onReturnToOverview: () => void;
}>) {
  return (
    <aside aria-label="Self Practices" className={styles.catalogRail}>
      <div className={styles.catalogRailHeader}>
        <h3 className={styles.catalogRailTitle}>Self Practices</h3>
        <button className={styles.returnOverviewButton} onClick={onReturnToOverview} type="button">
          Full Overview
        </button>
      </div>

      {canvas.pinnedFeatures.length > 0 ? (
        <section aria-labelledby="rail-pinned-heading" className={styles.catalogRailSection}>
          <h4 id="rail-pinned-heading" className={styles.catalogRailSectionTitle}>
            Pinned
          </h4>
          <ul className={styles.catalogRailList}>
            {canvas.pinnedFeatures.map((f) => (
              <li key={f.id}>
                <div className={styles.catalogRailRow}>
                  <button
                    className={`${styles.catalogRailItem} ${
                      focusedTask?.featureId === f.id ? styles.catalogRailItemActive : ''
                    }`}
                    onClick={() => onOpenFeature(f)}
                    type="button"
                  >
                    <span className={styles.catalogRailItemEmoji}>{f.emoji}</span>
                    <span className={styles.catalogRailItemLabel}>{f.label}</span>
                  </button>
                  <button
                    aria-label={`Unpin ${f.label}`}
                    className={`${styles.catalogRailPinButton} ${styles.catalogRailPinButtonPinned}`}
                    onClick={() => canvas.togglePin(f.id)}
                    title="Unpin practice"
                    type="button"
                  >
                    📌
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section aria-labelledby="rail-catalog-heading" className={styles.catalogRailSection}>
        <h4 id="rail-catalog-heading" className={styles.catalogRailSectionTitle}>
          Practice Catalog
        </h4>
        {canvas.groupOrder.map((category) => {
          const categoryFeatures = canvas.featuresByCategory.get(category) ?? [];
          if (categoryFeatures.length === 0) return null;

          return (
            <div key={category} className={styles.catalogRailSection}>
              <span className={styles.catalogRailSectionTitle}>{categoryTitle(category)}</span>
              <ul className={styles.catalogRailList}>
                {categoryFeatures.map((f) => {
                  const isPinned = canvas.pinnedIds.includes(f.id);
                  const isCurrentActive = focusedTask?.featureId === f.id;
                  return (
                    <li key={f.id}>
                      <div className={styles.catalogRailRow}>
                        <button
                          className={`${styles.catalogRailItem} ${
                            isCurrentActive ? styles.catalogRailItemActive : ''
                          }`}
                          onClick={() => onOpenFeature(f)}
                          type="button"
                        >
                          <span className={styles.catalogRailItemEmoji}>{f.emoji}</span>
                          <span className={styles.catalogRailItemLabel}>{f.label}</span>
                        </button>
                        <button
                          aria-label={isPinned ? `Unpin ${f.label}` : `Pin ${f.label}`}
                          className={`${styles.catalogRailPinButton} ${
                            isPinned ? styles.catalogRailPinButtonPinned : ''
                          }`}
                          onClick={() => canvas.togglePin(f.id)}
                          title={isPinned ? 'Unpin practice' : 'Pin practice'}
                          type="button"
                        >
                          {isPinned ? '📌' : '📍'}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </section>
    </aside>
  );
}
