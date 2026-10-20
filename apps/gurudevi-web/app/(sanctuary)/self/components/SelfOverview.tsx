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
  temporalIntent = 'current',
}: Readonly<{
  feature: SelfFeatureManifestItem;
  onOpen: () => void;
  fireJournalId?: string;
  temporalIntent?: 'current' | 'review' | 'plan';
}>) {
  const runnable = isBrowserSelfFeatureDelivered(feature.id);
  const isReview = temporalIntent === 'review';
  const isPlan = temporalIntent === 'plan';

  const status = runnable
    ? feature.availability === 'authorization-unresolved'
      ? 'Available after secure check'
      : isReview
        ? 'Review practice'
        : isPlan
          ? 'Plan ahead'
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
  temporalIntent = 'current',
  selectedDate,
  primaryRole,
}: Readonly<{
  displayName: string;
  groupOrder: readonly SelfCategory[];
  manifestAll: readonly SelfFeatureManifestItem[];
  onOpenFeature: (feature: SelfFeatureManifestItem) => void;
  onOpenFireJournal: () => void;
  pinnedFeatures: readonly SelfFeatureManifestItem[];
  fireJournalId?: string;
  temporalIntent?: 'current' | 'review' | 'plan';
  selectedDate?: string;
  primaryRole?: string;
}>) {
  const isReview = temporalIntent === 'review';
  const isPlan = temporalIntent === 'plan';

  const formattedDate = selectedDate
    ? new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date(selectedDate + 'T12:00:00'))
    : '';

  const arrivalTitle = isReview
    ? `Reflections from ${formattedDate}`
    : isPlan
      ? `Looking toward ${formattedDate}`
      : 'A place to notice what is asking for your care.';

  const arrivalSubtitle = isReview
    ? `${displayName}, you are revisiting reflections, moods, and releases recorded on this day.`
    : isPlan
      ? `${displayName}, quiet space and intentions for days waiting to arrive.`
      : `${displayName}, this is your orientation floor. Open a practice when it is useful, then return here without losing your place.`;

  const filteredManifest = manifestAll.filter((feature) => {
    if (!primaryRole || !['teacher', 'student', 'principal', 'guardian'].includes(primaryRole)) {
      return true;
    }
    // Mood lotus and fire journal are universally present across all roles
    if (feature.id === 'mood_lotus' || feature.id === 'fire_journal') return true;

    const weights = feature.roleWeights;
    if (!weights) return true;
    const weight = weights[primaryRole as keyof typeof weights];
    return typeof weight === 'number' && weight >= 50;
  });

  const byCategory = filteredManifest.reduce<Record<SelfCategory, SelfFeatureManifestItem[]>>(
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

  const pinnedEyebrow = isReview
    ? 'Archival reflection'
    : isPlan
      ? 'Future intention'
      : 'Pinned practice';

  const pinnedTitle = isReview
    ? `Revisit ${primaryPinned?.label ?? 'Fire Journal'}`
    : isPlan
      ? `Prepare ${primaryPinned?.label ?? 'Fire Journal'}`
      : (primaryPinned?.label ?? 'Fire Journal');

  const pinnedDescription = isReview
    ? `Inspect what was recorded and set free on ${formattedDate || 'this day'}.`
    : isPlan
      ? `Hold quiet space or prepare thoughts for ${formattedDate || 'this horizon'}.`
      : primaryPinned && primaryPinned.id !== fireJournalId
        ? featureDescription(primaryPinned, fireJournalId)
        : 'Release a private reflection. Only a short preview and the day remain in your history.';

  const pinnedButtonText = isReview
    ? `Review ${primaryPinned?.label ?? 'Fire Journal'}`
    : isPlan
      ? `Prepare ${primaryPinned?.label ?? 'Fire Journal'}`
      : `Open ${primaryPinned?.label ?? 'Fire Journal'}`;

  return (
    <>
      <header className={styles.arrival}>
        <p className={styles.eyebrow}>Self · Overview</p>
        <h1 id="self-floor-title">{arrivalTitle}</h1>
        <p>{arrivalSubtitle}</p>
      </header>

      <section aria-labelledby="self-pinned-title">
        <LivingCard
          variant={primaryPinned?.id === 'mood_lotus' ? 'lotus' : 'ember'}
          elevation="floating"
        >
          <div className={styles.pinnedCardContent}>
            <div>
              <p className={styles.eyebrow}>{pinnedEyebrow}</p>
              <h2
                id="self-pinned-title"
                style={{
                  fontFamily: 'Georgia, serif',
                  fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
                  margin: '0.45rem 0',
                }}
              >
                {pinnedTitle}
              </h2>
              <p style={{ margin: 0, color: 'var(--ink-soft)', lineHeight: 1.55 }}>
                {pinnedDescription}
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
              {pinnedButtonText}
            </button>
          </div>
        </LivingCard>
      </section>
      <section aria-labelledby="self-catalog-title" className={styles.catalog}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.5rem' }}>
          <div>
            <p className={styles.eyebrow}>Practice catalog</p>
            <h2 id="self-catalog-title" style={{ margin: '0.2rem 0' }}>
              {isReview ? 'Past records & reflections' : isPlan ? 'Upcoming horizons' : 'Practices, held in one place'}
            </h2>
          </div>
          {primaryRole && ['teacher', 'student', 'principal', 'guardian'].includes(primaryRole) ? (
            <span className={styles.primaryRole}>
              {({ teacher: 'For your teaching practice', student: 'For your learning journey', principal: 'For your school leadership', guardian: 'For your family role' } as Record<string, string>)[primaryRole] ?? 'Your personal practice'}
            </span>
          ) : null}
        </div>
        <p className={styles.catalogIntroduction}>
          {isReview
            ? 'Review historical records for this day. Completed practices remain visible in archival stillness.'
            : isPlan
              ? 'Preview and prepare practices for upcoming horizons.'
              : 'This catalog is the shared Self inventory. A practice opens only when its browser delivery is real.'}
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
                    temporalIntent={temporalIntent}
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
