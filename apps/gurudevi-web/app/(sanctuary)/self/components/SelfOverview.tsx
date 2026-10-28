'use client';

import { useMemo, useState } from 'react';
import { useTranslation } from '@/lib/i18n';
import type { SelfFeatureManifestItem } from '@repo/self/features/catalog';
import {
  getCircadianPhase,
  isFeatureApplicableToRole,
  isFeatureForCapacity,
  isUniversalFeature,
  scoreFeatureForRoles,
  type SelfCategory,
} from '../../../../lib/canvas/useSelfCanvas';
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

function formatRelativeTime(timestamp?: string | number): string {
  if (!timestamp) return '';
  const parsedTime = typeof timestamp === 'number' ? timestamp : new Date(timestamp).getTime();
  const diffMs = Date.now() - parsedTime;
  if (diffMs < 0 || Number.isNaN(diffMs)) return '';
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
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

const ROLE_TABS: Array<{ id: string; label: string; icon: string }> = [
  { id: 'all', label: 'All Practices', icon: '✦' },
  { id: 'teacher', label: 'Teacher', icon: '🧑‍🏫' },
  { id: 'student', label: 'Student', icon: '🎒' },
  { id: 'principal', label: 'Principal', icon: '🏫' },
  { id: 'guardian', label: 'Guardian', icon: '👨‍👩‍👧' },
];

const CIRCADIAN_META: Record<
  'morning' | 'afternoon' | 'night',
  { title: string; icon: string; subtitle: string; phaseBadge: string }
> = {
  morning: {
    title: 'Morning Awakening & Focus',
    icon: '🌅',
    subtitle: 'Practices calibrated for waking presence, daily intentions, and steady focus.',
    phaseBadge: 'Morning Rhythm · 5:00 - 12:00',
  },
  afternoon: {
    title: 'Midday Poise & Recharge',
    icon: '☀️',
    subtitle: 'Practices calibrated for resetting midday tension, balancing cognitive load, and mindful pause.',
    phaseBadge: 'Midday Balance · 12:00 - 18:00',
  },
  night: {
    title: 'Evening Wind-Down & Release',
    icon: '🌙',
    subtitle: 'Practices calibrated for releasing accumulated strain, deep reflection, and restorative rest.',
    phaseBadge: 'Evening Rest · 18:00 - 5:00',
  },
};

export function FeatureCatalogCard({
  feature,
  onOpen,
  fireJournalId = 'fire_journal',
  temporalIntent = 'current',
  primaryRole,
  isExplore = false,
  isPinned = false,
  onTogglePin,
  lastUsedAt,
  usageCount,
}: Readonly<{
  feature: SelfFeatureManifestItem;
  onOpen: () => void;
  fireJournalId?: string;
  temporalIntent?: 'current' | 'review' | 'plan';
  primaryRole?: string;
  isExplore?: boolean;
  isPinned?: boolean;
  onTogglePin?: (id: string) => void;
  lastUsedAt?: string | number;
  usageCount?: number;
}>) {
  const runnable = isBrowserSelfFeatureDelivered(feature.id);
  const isReview = temporalIntent === 'review';
  const isPlan = temporalIntent === 'plan';

  const roleAffinity =
    primaryRole &&
    feature.roleWeights?.[primaryRole.toLowerCase() as keyof typeof feature.roleWeights];
  const isRoleFocus = typeof roleAffinity === 'number' && roleAffinity >= 80;

  let ctaText = 'Open practice →';
  if (isReview) {
    ctaText = 'Review practice ↺';
  } else if (isPlan) {
    ctaText = 'Plan ahead ↗';
  }

  const isLocked = feature.availability === 'authorization-unresolved' && !isExplore;
  const isUnavailable = !runnable || feature.availability === 'unavailable';

  const displayStatus = isUnavailable
    ? 'Coming to web'
    : isLocked
      ? 'Sign in to unlock'
      : ctaText;

  const timeLabel = formatRelativeTime(lastUsedAt);

  return (
    <LivingCard
      as="article"
      className={styles.catalogItem}
      variant={
        feature.id === 'mood_lotus' ? 'lotus' : feature.id === fireJournalId ? 'ember' : 'vellum'
      }
      elevation="floating"
      data-runnable={runnable && !isLocked}
    >
      <div className={styles.cardHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
          <p aria-hidden="true" className={styles.catalogEmoji}>
            {feature.emoji}
          </p>
          {isRoleFocus ? (
            <span className={styles.focusBadge}>
              ✦ Focus Practice
            </span>
          ) : null}
        </div>
        {onTogglePin ? (
          <button
            type="button"
            className={isPinned ? styles.pinToggleBtnActive : styles.pinToggleBtn}
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin(feature.id);
            }}
            aria-label={isPinned ? `Unpin ${feature.label}` : `Pin ${feature.label} to quick access`}
            title={isPinned ? 'Unpin practice' : 'Pin to quick access'}
          >
            {isPinned ? '📌' : '📍'}
          </button>
        ) : null}
      </div>
      <h4>{feature.label}</h4>
      <p>{featureDescription(feature, fireJournalId)}</p>

      {usageCount && usageCount > 0 ? (
        <div className={styles.usageMeta}>
          <span>{usageCount} {usageCount === 1 ? 'session' : 'sessions'}</span>
          {timeLabel ? <span>· {timeLabel}</span> : null}
        </div>
      ) : null}

      {runnable && !isLocked ? (
        <button
          className={styles.catalogOpen}
          onClick={onOpen}
          type="button"
          aria-label={`${ctaText} for ${feature.label}`}
        >
          {displayStatus}
        </button>
      ) : isLocked ? (
        <span className={styles.catalogLocked}>{displayStatus}</span>
      ) : (
        <span className={styles.catalogStatus}>{displayStatus}</span>
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
  pinnedIds = [],
  usage = {},
  onTogglePin,
  fireJournalId = 'fire_journal',
  temporalIntent = 'current',
  selectedDate,
  primaryRole,
  otherRoles = [],
  userId,
  isExplore = false,
  isDevRun,
}: Readonly<{
  displayName: string;
  groupOrder: readonly SelfCategory[];
  manifestAll: readonly SelfFeatureManifestItem[];
  onOpenFeature: (feature: SelfFeatureManifestItem) => void;
  onOpenFireJournal: () => void;
  pinnedFeatures: readonly SelfFeatureManifestItem[];
  pinnedIds?: readonly string[];
  usage?: Readonly<Record<string, Readonly<{ count: number; lastUsedAt: number | string }>>>;
  onTogglePin?: (featureId: string) => void;
  fireJournalId?: string;
  temporalIntent?: 'current' | 'review' | 'plan';
  selectedDate?: string;
  primaryRole?: string;
  otherRoles?: readonly string[];
  userId?: string;
  isExplore?: boolean;
  isDevRun?: boolean;
}>) {
  const isReview = temporalIntent === 'review';
  const isPlan = temporalIntent === 'plan';
  const isExploreMode =
    isExplore || !userId || userId === 'explore-guest' || userId === 'explore';
  const { mindfulMinutesToday, recoverySignal, recordSession } = useSanctuaryHealth(userId);
  const { t } = useTranslation();

  const isDevMode =
    isDevRun ??
    (process.env.NODE_ENV !== 'production' ||
      isExploreMode ||
      (typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' ||
          window.location.hostname === '127.0.0.1' ||
          new URLSearchParams(window.location.search).has('dev'))));

  // In dev run, allow developer to switch perspectives dynamically.
  // In normal production, stays null so user automatically sees their curated view (primary + other + universal).
  const [devSelectedRole, setDevSelectedRole] = useState<string | null>(null);

  // Quick access tab state
  const [quickAccessTab, setQuickAccessTab] = useState<'pinned' | 'recent' | 'frequent'>('pinned');

  const formattedDate = selectedDate
    ? new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date(selectedDate + 'T12:00:00'))
    : '';

  const roleKey = primaryRole ? primaryRole.toLowerCase() : '';
  const fallbackCopy = roleKey ? ROLE_HERO_COPY[roleKey] : undefined;
  const localizedTitle = roleKey ? t(`self.hero.${roleKey}.title`) : '';
  const localizedSubtitle = roleKey ? t(`self.hero.${roleKey}.subtitle`) : '';
  const localizedBadge = roleKey ? t(`self.hero.${roleKey}.badge`) : '';

  const roleMeta = primaryRole
    ? {
        title:
          localizedTitle && localizedTitle !== `self.hero.${roleKey}.title`
            ? localizedTitle
            : (fallbackCopy?.title ?? 'Personal Sanctuary'),
        subtitle:
          localizedSubtitle && localizedSubtitle !== `self.hero.${roleKey}.subtitle`
            ? localizedSubtitle
            : (fallbackCopy?.subtitle ?? 'Mindfulness, growth and daily reflections'),
        badge:
          localizedBadge && localizedBadge !== `self.hero.${roleKey}.badge`
            ? localizedBadge
            : (fallbackCopy?.badge ?? 'Sanctuary'),
      }
    : undefined;

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

  // Circadian rhythm features
  const currentPhase = getCircadianPhase();
  const circadianInfo = CIRCADIAN_META[currentPhase];
  const rhythmFeatures = useMemo(() => {
    return manifestAll
      .filter((f) => isBrowserSelfFeatureDelivered(f.id) && f.timing?.preferredPhase === currentPhase)
      .slice(0, 4);
  }, [manifestAll, currentPhase]);

  // Quick access lists
  const pinnedSet = useMemo(() => new Set(pinnedIds), [pinnedIds]);
  const pinnedList = useMemo(() => {
    return manifestAll.filter((f) => pinnedSet.has(f.id));
  }, [manifestAll, pinnedSet]);

  const recentList = useMemo(() => {
    return manifestAll
      .filter((f) => usage[f.id]?.lastUsedAt)
      .sort((a, b) => {
        const rawA = usage[a.id]?.lastUsedAt;
        const rawB = usage[b.id]?.lastUsedAt;
        const timeA = typeof rawA === 'number' ? rawA : Date.parse(rawA ?? '') || 0;
        const timeB = typeof rawB === 'number' ? rawB : Date.parse(rawB ?? '') || 0;
        return timeB - timeA;
      })
      .slice(0, 4);
  }, [manifestAll, usage]);

  const frequentList = useMemo(() => {
    return manifestAll
      .filter((f) => (usage[f.id]?.count ?? 0) > 0)
      .sort((a, b) => (usage[b.id]?.count ?? 0) - (usage[a.id]?.count ?? 0))
      .slice(0, 4);
  }, [manifestAll, usage]);

  const activeShelfItems =
    quickAccessTab === 'pinned'
      ? pinnedList
      : quickAccessTab === 'recent'
        ? recentList
        : frequentList;

  // Role filtering counts & items (used by Dev perspective switcher)
  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = { all: manifestAll.length };
    for (const tab of ROLE_TABS) {
      if (tab.id === 'all') continue;
      counts[tab.id] = manifestAll.filter((f) => isFeatureForCapacity(f, tab.id, [])).length;
    }
    return counts;
  }, [manifestAll]);

  const filteredManifest = useMemo(() => {
    // If a developer selected an explicit perspective in the Dev Switcher:
    if (devSelectedRole) {
      if (devSelectedRole === 'all') return manifestAll;
      return manifestAll.filter((f) => isFeatureForCapacity(f, devSelectedRole, []));
    }

    // Default / Production curation:
    // Seamlessly curated to user's primary capacity + secondary capacities + all universal practices!
    if (primaryRole) {
      return manifestAll.filter((f) => isFeatureForCapacity(f, primaryRole, otherRoles));
    }

    // Fallback: universal personal practices
    return manifestAll.filter((f) => isUniversalFeature(f));
  }, [manifestAll, devSelectedRole, primaryRole, otherRoles]);

  const effectiveRoles = useMemo(() => {
    if (devSelectedRole && devSelectedRole !== 'all') return [devSelectedRole];
    if (primaryRole) return [primaryRole, ...otherRoles];
    return ['teacher'];
  }, [devSelectedRole, primaryRole, otherRoles]);

  const sortedFilteredManifest = useMemo(() => {
    return [...filteredManifest].sort((a, b) => {
      const scoreA = scoreFeatureForRoles(a, effectiveRoles, currentPhase, {
        isPinned: pinnedSet.has(a.id),
        lastUsedAt: usage[a.id]?.lastUsedAt,
        count: usage[a.id]?.count,
      });
      const scoreB = scoreFeatureForRoles(b, effectiveRoles, currentPhase, {
        isPinned: pinnedSet.has(b.id),
        lastUsedAt: usage[b.id]?.lastUsedAt,
        count: usage[b.id]?.count,
      });
      const diff = scoreB - scoreA;
      if (diff !== 0) return diff;
      return a.defaultOrder - b.defaultOrder;
    });
  }, [filteredManifest, effectiveRoles, currentPhase, pinnedSet, usage]);

  const byCategory = useMemo(() => {
    return sortedFilteredManifest.reduce<Record<SelfCategory, SelfFeatureManifestItem[]>>(
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
  }, [sortedFilteredManifest]);

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

      {/* 🕯 Primary Pinned Hero Sanctuary */}
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

      {/* 🌿 Somatic Sanctuary & Health Connect */}
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

      {/* 🌅 Circadian Rhythm Shelf */}
      {rhythmFeatures.length > 0 ? (
        <section aria-labelledby="self-circadian-title" className={styles.shelfSection}>
          <div className={styles.shelfHeader}>
            <div>
              <p className={styles.eyebrow}>{circadianInfo.phaseBadge}</p>
              <h2 id="self-circadian-title" className={styles.shelfTitle}>
                {circadianInfo.icon} {circadianInfo.title}
              </h2>
              <p className={styles.shelfSubtitle}>{circadianInfo.subtitle}</p>
            </div>
          </div>
          <div className={styles.shelfGrid}>
            {rhythmFeatures.map((feature) => (
              <FeatureCatalogCard
                feature={feature}
                fireJournalId={fireJournalId}
                isExplore={isExploreMode}
                isPinned={pinnedSet.has(feature.id)}
                key={`rhythm-${feature.id}`}
                lastUsedAt={usage[feature.id]?.lastUsedAt}
                onOpen={() => onOpenFeature(feature)}
                onTogglePin={onTogglePin}
                primaryRole={primaryRole}
                temporalIntent={temporalIntent}
                usageCount={usage[feature.id]?.count}
              />
            ))}
          </div>
        </section>
      ) : null}

      {/* 📌 Quick Access & History Shelf */}
      <section aria-labelledby="self-quickaccess-title" className={styles.shelfSection}>
        <div className={styles.shelfHeader}>
          <div>
            <p className={styles.eyebrow}>Quick access & history</p>
            <h2 id="self-quickaccess-title" className={styles.shelfTitle}>
              Your Personal Shelf
            </h2>
            <p className={styles.shelfSubtitle}>
              Quickly resume frequent practices or jump to your pinned favorites.
            </p>
          </div>
          <div className={styles.shelfSubTabs} role="tablist" aria-label="Quick Access Views">
            <button
              type="button"
              role="tab"
              aria-selected={quickAccessTab === 'pinned'}
              className={quickAccessTab === 'pinned' ? styles.shelfSubTabActive : styles.shelfSubTab}
              onClick={() => setQuickAccessTab('pinned')}
            >
              📌 Pinned ({pinnedList.length})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={quickAccessTab === 'recent'}
              className={quickAccessTab === 'recent' ? styles.shelfSubTabActive : styles.shelfSubTab}
              onClick={() => setQuickAccessTab('recent')}
            >
              ⏱ Recent ({recentList.length})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={quickAccessTab === 'frequent'}
              className={quickAccessTab === 'frequent' ? styles.shelfSubTabActive : styles.shelfSubTab}
              onClick={() => setQuickAccessTab('frequent')}
            >
              ⚡ Frequent ({frequentList.length})
            </button>
          </div>
        </div>

        {activeShelfItems.length > 0 ? (
          <div className={styles.shelfGrid}>
            {activeShelfItems.map((feature) => (
              <FeatureCatalogCard
                feature={feature}
                fireJournalId={fireJournalId}
                isExplore={isExploreMode}
                isPinned={pinnedSet.has(feature.id)}
                key={`shelf-${feature.id}`}
                lastUsedAt={usage[feature.id]?.lastUsedAt}
                onOpen={() => onOpenFeature(feature)}
                onTogglePin={onTogglePin}
                primaryRole={primaryRole}
                temporalIntent={temporalIntent}
                usageCount={usage[feature.id]?.count}
              />
            ))}
          </div>
        ) : (
          <div className={styles.emptyShelfNotice}>
            {quickAccessTab === 'pinned' ? (
              <p>No pinned practices yet. Click 📍 on any practice card below to pin it here.</p>
            ) : quickAccessTab === 'recent' ? (
              <p>No recent practices recorded yet. Opening any practice will automatically remember it here.</p>
            ) : (
              <p>Frequent practices will appear here as you return to them.</p>
            )}
          </div>
        )}
      </section>

      {/* 📚 Complete Practice Catalog with Role Filter */}
      <section aria-labelledby="self-catalog-title" className={styles.catalog}>
        <div className={styles.catalogHeaderRow}>
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
              ✦ {roleMeta ? `Curated for ${roleMeta.badge}` : `Tuned for ${primaryRole}`} &amp; Universal Practices
            </span>
          ) : (
            <span className={styles.primaryRole}>
              ✦ Inclusive Personal Practices
            </span>
          )}
        </div>

        <p className={styles.catalogIntroduction}>
          {isReview
            ? 'Review historical records for this day. Completed practices remain visible in archival stillness.'
            : isPlan
              ? 'Preview and prepare practices for upcoming horizons.'
              : 'This catalog holds your personal Self practices, calibrated to your capacities and daily circadian rhythm.'}
        </p>

        {/* 🛠 Developer Perspective Switcher (Visible in Dev & Explore runs only) */}
        {isDevMode ? (
          <div className={styles.devPerspectiveBar} role="region" aria-label="Dev Perspective Switcher">
            <div className={styles.devPerspectiveHeader}>
              <span className={styles.devBadge}>🛠 Dev Perspective Switcher</span>
              <span className={styles.devHelp}>
                Developer mode active · Switch roles to test how different capacities view this floor
              </span>
            </div>
            <div className={styles.roleFilterPills} role="tablist" aria-label="Developer Role Previews">
              {ROLE_TABS.map((tab) => {
                const count = roleCounts[tab.id] ?? 0;
                const isSelected =
                  devSelectedRole === tab.id ||
                  (devSelectedRole === null &&
                    tab.id === (primaryRole ? primaryRole.toLowerCase() : 'all'));
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    className={isSelected ? styles.roleFilterPillActive : styles.roleFilterPill}
                    onClick={() => setDevSelectedRole(tab.id)}
                  >
                    <span aria-hidden="true">{tab.icon}</span>
                    <span>{t(`self.roleTabs.${tab.id}`) || tab.label}</span>
                    <span className={styles.roleFilterCount}>({count})</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <div className={styles.catalogZones}>
          {groupOrder.map((zone) => {
            const items = byCategory[zone] ?? [];
            if (items.length === 0 && devSelectedRole !== null && devSelectedRole !== 'all') return null;
            return (
              <section
                aria-labelledby={`self-category-${zone}`}
                className={styles.catalogZone}
                key={zone}
              >
                <h3 id={`self-category-${zone}`}>{categoryTitle(zone)}</h3>
                <div className={styles.catalogGrid}>
                  {items.map((feature) => (
                    <FeatureCatalogCard
                      feature={feature}
                      fireJournalId={fireJournalId}
                      isExplore={isExploreMode}
                      isPinned={pinnedSet.has(feature.id)}
                      key={feature.id}
                      lastUsedAt={usage[feature.id]?.lastUsedAt}
                      onOpen={() => onOpenFeature(feature)}
                      onTogglePin={onTogglePin}
                      primaryRole={primaryRole}
                      temporalIntent={temporalIntent}
                      usageCount={usage[feature.id]?.count}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </section>
    </>
  );
}
