'use client';

import type { SelfFeatureManifestItem } from '@repo/self/features/catalog';
import type { SelfCategory } from '../../../../lib/canvas/useSelfCanvas';
import { LivingCard } from '../../components/LivingCard';
import { isBrowserSelfFeatureDelivered } from '../browserFeatureRegistry';
import styles from '../self-floor.module.css';

type SelfGroup = SelfFeatureManifestItem['category'];

export function categoryTitle(category: SelfGroup): string {
  const labels: Record<SelfGroup, string> = {
    identity: 'Identity',
    wellbeing: 'Wellbeing',
    growth: 'Growth',
    practice: 'Practice & rhythm',
    professional: 'Professional',
  };
  return labels[category] ?? category;
}

export function featureDescription(
  feature: SelfFeatureManifestItem,
  fireJournalId = 'fire_journal',
): string {
  if (feature.id === fireJournalId)
    return 'Release a private reflection. Only a short preview and the day remain in history.';
  return `${feature.category} practice · ${feature.timing?.preferredPhase ?? 'any time'}`;
}

export function FeatureCatalogCard({
  feature,
  onOpen,
  fireJournalId = 'fire_journal',
}: Readonly<{
  feature: SelfFeatureManifestItem;
  onOpen: () => void;
  fireJournalId?: string;
}>) {
  const runnable = isBrowserSelfFeatureDelivered(feature.id);
  const status = runnable
    ? feature.availability === 'authorization-unresolved'
      ? 'Available after secure check'
      : 'Open practice'
    : 'Not yet delivered in browser';

  return (
    <LivingCard
      as="article"
      className={styles.catalogItem}
      variant={
        feature.id === 'mood_lotus' ? 'lotus' : feature.id === fireJournalId ? 'ember' : 'vellum'
      }
      elevation="floating"
      data-runnable={runnable}
    >
      <p aria-hidden="true" className={styles.catalogEmoji}>
        {feature.emoji}
      </p>
      <h4>{feature.label}</h4>
      <p>{featureDescription(feature, fireJournalId)}</p>
      {runnable ? (
        <button className={styles.catalogOpen} onClick={onOpen} type="button">
          {status}
        </button>
      ) : (
        <span className={styles.catalogStatus}>{status}</span>
      )}
    </LivingCard>
  );
}

export function SelfOverview({
  displayName,
  groupOrder,
  manifestAll,
  onOpenFeature,
  onOpenFireJournal,
  pinnedFeatures,
  fireJournalId = 'fire_journal',
}: Readonly<{
  displayName: string;
  groupOrder: readonly SelfCategory[];
  manifestAll: readonly SelfFeatureManifestItem[];
  onOpenFeature: (feature: SelfFeatureManifestItem) => void;
  onOpenFireJournal: () => void;
  pinnedFeatures: readonly SelfFeatureManifestItem[];
  fireJournalId?: string;
}>) {
  const byCategory = manifestAll.reduce<Record<SelfCategory, SelfFeatureManifestItem[]>>(
    (groups, feature) => {
      (groups[feature.category] ??= []).push(feature);
      return groups;
    },
    {
      identity: [],
      wellbeing: [],
      growth: [],
      practice: [],
      professional: [],
    },
  );

  const primaryPinned = pinnedFeatures[0];

  return (
    <>
      <header className={styles.arrival}>
        <p className={styles.eyebrow}>Self · Overview</p>
        <h1 id="self-floor-title">A place to notice what is asking for your care.</h1>
        <p>
          {displayName}, this is your orientation floor. Open a practice when it is useful, then
          return here without losing your place.
        </p>
      </header>

      <section aria-labelledby="self-pinned-title">
        <LivingCard
          variant={primaryPinned?.id === 'mood_lotus' ? 'lotus' : 'ember'}
          elevation="floating"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) auto',
            gap: '1.25rem 2rem',
            padding: 'clamp(1.25rem, 3vw, 2rem)',
            alignItems: 'center',
          }}
        >
          <div>
            <p className={styles.eyebrow}>Pinned practice</p>
            <h2
              id="self-pinned-title"
              style={{
                fontFamily: 'Georgia, serif',
                fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
                margin: '0.45rem 0',
              }}
            >
              {primaryPinned?.label ?? 'Fire Journal'}
            </h2>
            <p style={{ margin: 0, color: 'var(--ink-soft)', lineHeight: 1.55 }}>
              {primaryPinned && primaryPinned.id !== fireJournalId
                ? featureDescription(primaryPinned, fireJournalId)
                : 'Release a private reflection. Only a short preview and the day remain in your history.'}
            </p>
          </div>
          <button
            className={styles.burnButton}
            onClick={() => {
              if (!primaryPinned || primaryPinned.id === fireJournalId) {
                onOpenFireJournal();
              } else {
                onOpenFeature(primaryPinned);
              }
            }}
            type="button"
          >
            Open {primaryPinned?.label ?? 'Fire Journal'}
          </button>
        </LivingCard>
      </section>
      <section aria-labelledby="self-catalog-title" className={styles.catalog}>
        <p className={styles.eyebrow}>Practice catalog</p>
        <h2 id="self-catalog-title">Practices, held in one place</h2>
        <p className={styles.catalogIntroduction}>
          This catalog is the shared Self inventory. A practice opens only when its browser delivery
          is real; the rest remain visible without pretending to be ready.
        </p>
        <div className={styles.catalogZones}>
          {groupOrder.map((zone) => (
            <section
              aria-labelledby={`self-category-${zone}`}
              className={styles.catalogZone}
              key={zone}
            >
              <h3 id={`self-category-${zone}`}>{categoryTitle(zone)}</h3>
              <div className={styles.catalogGrid}>
                {(byCategory[zone] ?? []).map((feature) => (
                  <FeatureCatalogCard
                    feature={feature}
                    fireJournalId={fireJournalId}
                    key={feature.id}
                    onOpen={() => onOpenFeature(feature)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>
    </>
  );
}
