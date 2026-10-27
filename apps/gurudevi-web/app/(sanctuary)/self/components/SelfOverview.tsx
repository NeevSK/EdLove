'use client';

import type { SelfFeatureManifestItem } from '@repo/self/features/catalog';
import type { SelfCategory } from '../../../../lib/canvas/useSelfCanvas';
import { useSanctuaryHealth } from '../../../../lib/sanctuary/selfBrowserAdapters';
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

const ROLE_HERO_COPY: Record<string, { title: string; subtitle: string; badge: string }> = {
  teacher: {
    title: "Teacher's Sadhana",
    subtitle: 'Working rhythm, energy balance and decompression',
    badge: 'Educator',
  },
  student: {
    title: 'Mastery & Inner Pulse',
    subtitle: 'Study flow, emotional calm and self-growth',
    badge: 'Student',
  },
  guardian: {
    title: 'Guardian Sanctuary',
    subtitle: 'Family presence, grounding and mindful pause',
    badge: 'Guardian',
  },
  parent: {
    title: 'Guardian Sanctuary',
    subtitle: 'Family presence, grounding and mindful pause',
    badge: 'Guardian',
  },
  principal: {
    title: "Principal's Inner Sanctuary",
    subtitle: 'Executive discernment, composure and tenets',
    badge: 'Leadership',
  },
  founder: {
    title: "Founder's Vision Lab",
    subtitle: 'Architectural discernment and creative sanctuary',
    badge: 'Founder',
  },
  admin: {
    title: 'Personal Sanctuary',
    subtitle: 'Mindfulness, growth and daily reflections',
    badge: 'Platform',
  },
};

export function FeatureCatalogCard({
  feature,
  onOpen,
  fireJournalId = 'fire_journal',
  temporalIntent = 'current',
  primaryRole,
}: Readonly<{
  feature: SelfFeatureManifestItem;
  onOpen: () => void;
  fireJournalId?: string;
  temporalIntent?: 'current' | 'review' | 'plan';
  primaryRole?: string;
}>) {
  const runnable = isBrowserSelfFeatureDelivered(feature.id);
  const isReview = temporalIntent === 'review';
  const isPlan = temporalIntent === 'plan';

  const roleAffinity =
    primaryRole &&
    feature.roleWeights?.[primaryRole.toLowerCase() as keyof typeof feature.roleWeights];
  const isRoleFocus = typeof roleAffinity === 'number' && roleAffinity >= 80;

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <p aria-hidden="true" className={styles.catalogEmoji}>
          {feature.emoji}
        </p>
        {isRoleFocus ? (
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '0.15rem 0.45rem',
              borderRadius: '9999px',
              background: 'color-mix(in srgb, var(--lotus, #d97706) 15%, transparent)',
              color: 'var(--lotus, #d97706)',
              letterSpacing: '0.04em',
            }}
          >
            ✦ Focus Practice
          </span>
        ) : null}
      </div>
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
  userId,
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
  userId?: string;
}>) {
  const isReview = temporalIntent === 'review';
  const isPlan = temporalIntent === 'plan';
  const { mindfulMinutesToday, recoverySignal, recordSession } = useSanctuaryHealth(userId);

  const formattedDate = selectedDate
    ? new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date(selectedDate + 'T12:00:00'))
    : '';

  const roleMeta = primaryRole ? ROLE_HERO_COPY[primaryRole.toLowerCase()] : undefined;

  const arrivalTitle = isReview
    ? `Reflections from ${formattedDate}`
    : isPlan
      ? `Looking toward ${formattedDate}`
      : roleMeta
        ? roleMeta.title
        : 'A place to notice what is asking for your care.';

  const arrivalSubtitle = isReview
    ? `${displayName}, you are revisiting reflections, moods, and releases recorded on this day.`
    : isPlan
      ? `${displayName}, quiet space and intentions for days waiting to arrive.`
      : roleMeta
        ? `${displayName}, ${roleMeta.subtitle.toLowerCase()}. All practices remain open and shared for your holistic rhythm.`
        : `${displayName}, this is your orientation floor. Open a practice when it is useful, then return here without losing your place.`;

  // All features are shared and accessible across roles; manifestAll is pre-sorted by circadian & role affinity
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

      <section aria-labelledby="self-somatic-title" style={{ marginTop: '1.25rem' }}>
        <LivingCard variant="lotus" elevation="floating">
          <div className={styles.pinnedCardContent}>
            <div>
              <p className={styles.eyebrow}>Somatic Sanctuary & Health Connect</p>
              <h2
                id="self-somatic-title"
                style={{
                  fontFamily: 'Georgia, serif',
                  fontSize: 'clamp(1.3rem, 2.5vw, 1.8rem)',
                  margin: '0.35rem 0',
                }}
              >
                {mindfulMinutesToday > 0
                  ? `${mindfulMinutesToday} mindful minutes anchored today`
                  : 'Somatic health & calm breathing'}
              </h2>
              <p style={{ margin: 0, color: 'var(--ink-soft)', lineHeight: 1.55 }}>
                Rhythm status:{' '}
                <strong style={{ color: 'var(--color-sanctuary-saffron, #a85022)' }}>
                  {recoverySignal?.level ?? 'serene'} flow
                </strong>{' '}
                · Sovereign Health Port active across browser storage and mobile Health Connect.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                className={styles.burnButton}
                onClick={() => {
                  void recordSession(180);
                  const breathFeature = manifestAll.find((f) => f.id === 'breath_guide');
                  if (breathFeature) {
                    onOpenFeature(breathFeature);
                  }
                }}
                type="button"
              >
                🌿 Take 3-min Breath
              </button>
              <button
                className={styles.catalogOpen}
                onClick={() => {
                  const pulseFeature = manifestAll.find((f) => f.id === 'daily_pulse');
                  if (pulseFeature) {
                    onOpenFeature(pulseFeature);
                  }
                }}
                type="button"
                style={{ borderBottom: '1px solid currentColor' }}
              >
                Open Somatic Pulse →
              </button>
            </div>
          </div>
        </LivingCard>
      </section>

      <section aria-labelledby="self-catalog-title" className={styles.catalog}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '0.5rem',
          }}
        >
          <div>
            <p className={styles.eyebrow}>Practice catalog</p>
            <h2 id="self-catalog-title" style={{ margin: '0.2rem 0' }}>
              {isReview
                ? 'Past records & reflections'
                : isPlan
                  ? 'Upcoming horizons'
                  : 'Practices, held in one place'}
            </h2>
          </div>
          {primaryRole ? (
            <span className={styles.primaryRole}>
              {roleMeta ? `Calibrated for ${roleMeta.badge}` : 'Inclusive personal practices'}
            </span>
          ) : null}
        </div>
        <p className={styles.catalogIntroduction}>
          {isReview
            ? 'Review historical records for this day. Completed practices remain visible in archival stillness.'
            : isPlan
              ? 'Preview and prepare practices for upcoming horizons.'
              : 'This catalog is the shared Self inventory. All practices are accessible to every role, sorted by your daily circadian rhythm.'}
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
                    primaryRole={primaryRole}
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
