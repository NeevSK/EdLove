'use client';

import { declaredPracticeCapability } from '@repo/core/logic/registry/capabilityManifest';
import {
  resolveTemporalCoordinates,
  resolveTemporalIntent,
  toIsoDate,
} from '@repo/core/logic/workbench';
import { getMaxPinnedForWorkspace } from '@repo/core/logic/workspace/canvas';
import type { DomainTemporalHorizon, WorkbenchTaskDescriptor } from '@repo/core/types';
import {
  createSelfAccessContext,
  resolveSelfFeatureManifest,
  type SelfFeatureManifestItem,
} from '@repo/self/features/catalog';
import { useQuery } from '@tanstack/react-query';
import { Volume2, VolumeX } from 'lucide-react';
import { type FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import type { SelfCategory } from '../../../lib/canvas/useSelfCanvas';
import { useSelfCanvas } from '../../../lib/canvas/useSelfCanvas';
import { useExploreCapacity } from '../../../lib/explore/exploreCapacity';
import {
  isSanctuaryAudioMuted,
  subscribeSanctuaryAudio,
  toggleSanctuaryAudio,
} from '../../../lib/sanctuary/audioSanctuary';
import { createAccountSafeTrySelfPracticeAdapter } from '../../../lib/sanctuary/selfExplore';
import { burnJournal, loadBurnedJournalHistory } from '../../../lib/sanctuary/selfJournal';
import { useDomainWorkbench } from '../../../lib/workbench';
import { useQuickAccessPreferences } from '../../../lib/workbench/quickAccessPreferences';
import type { FloorAtmosphereKind } from '../components/FloorAtmosphere';
import type { FurnitureDefinition } from '../components/FloorStudioDrawer';
import { SanctuaryFloorCanvas } from '../components/SanctuaryFloorCanvas';
import { DateTimeCombo } from '@repo/ui/components/web';
import { timeGreeting } from '../../../lib/timeGreeting';
import { TaskStrip } from '../components/TaskStrip';
import { BROWSER_SELF_FEATURES } from './browserFeatureRegistry';
import { DailyContentCard } from './components/DailyContentCard';
import { DailyRhythm } from './components/DailyRhythm';
import { DailySadhanaModal } from './components/DailySadhanaModal';
import { DecisionJournalSection } from './components/DecisionJournalSection';
import { DynamicCareIsland } from './components/DynamicCareIsland';
import { EnergyForecast } from './components/EnergyForecast';
import { FireJournal, initialScreen, type ScreenState } from './components/FireJournal';
import { GratitudeGlimmers } from './components/GratitudeGlimmers';
import { JoyJar } from './components/JoyJar';
import { MoodLotusModal } from './components/MoodLotusModal';
import { Dialog } from '@repo/ui/components/web';
import { MyGradesView } from './components/MyGradesView';
import { ProgressTree } from './components/ProgressTree';
import { PulseDashboard } from './components/PulseDashboard';
import { ReframeWizard } from './components/ReframeWizard';
import { RemindersManager } from './components/RemindersManager';
import { ResonancePatternCard } from './components/ResonancePatternCard';
import { SelfOverview } from './components/SelfOverview';
import { ShadowAgentDrawer } from './components/ShadowAgentDrawer';
import { SleepTracker } from './components/SleepTracker';
import { StudentGoals } from './components/StudentGoals';
import { TeachingHistoryTimeline } from './components/TeachingHistoryTimeline';
import { TomorrowPrep } from './components/TomorrowPrep';
import { UnavailableTask } from './components/UnavailableTask';
import { VoiceJournaling } from './components/VoiceJournaling';
import { WarmMirrorCard } from './components/WarmMirrorCard';
import { WindDownRitual } from './components/WindDownRitual';
import { WisdomSeeds } from './components/WisdomSeeds';
import styles from './self-floor.module.css';

const SELF_FEATURE_MANIFEST = resolveSelfFeatureManifest(
  createSelfAccessContext({ isExplore: true }),
  {
    customOrder: [],
    hiddenIds: [],
    selectedIds: [],
  },
  'browser',
  { deliveredFeatureIds: Object.keys(BROWSER_SELF_FEATURES) },
);

const fireJournalFeature = requiredFeature('fire_journal');

function requiredFeature(id: string): SelfFeatureManifestItem {
  const feature = SELF_FEATURE_MANIFEST.all.find((candidate) => candidate.id === id);
  if (!feature) throw new Error(`The canonical Self catalog is missing ${id}.`);
  return feature;
}

const fireJournalTask = {
  featureId: fireJournalFeature.id,
  route: '/self',
  title: fireJournalFeature.label,
  icon: fireJournalFeature.emoji,
  temporalBinding: { kind: 'follow-domain' },
  localStatePolicy: 'restore-permitted',
} as const;

function todayHorizon(): DomainTemporalHorizon {
  const now = new Date();
  const date = toIsoDate(now);
  return {
    anchor: {
      kind: 'date',
      date,
    },
    scale: 'day',
    intent: 'current',
  };
}

const SELF_FURNITURE_ITEMS: readonly FurnitureDefinition[] = [
  {
    id: 'hero',
    label: 'Primary Hero Practice',
    icon: '🪷',
  },
  {
    id: 'somatic',
    label: 'Somatic Health & Breathing',
    icon: '🫁',
  },
  {
    id: 'circadian',
    label: 'Circadian Rhythm Practices',
    icon: '🌅',
  },
  {
    id: 'shelf',
    label: 'Personal Shelf & History',
    icon: '📌',
  },
  {
    id: 'catalog',
    label: 'Complete Practice Catalog',
    icon: '📚',
  },
];

export function SelfFloor({
  accountId,
  displayName,
  initialPracticing = false,
  initialCapacity,
  capacities = [],
}: Readonly<{
  accountId?: string;
  displayName: string;
  initialPracticing?: boolean;
  initialCapacity?: string;
  capacities?: readonly string[];
}>) {
  const [screen, setScreen] = useState<ScreenState>(initialScreen);
  const [isPracticing, setIsPracticing] = useState(initialPracticing || accountId === 'explore');
  const quickAccessScope = accountId === 'explore-guest' ? 'explore' : 'sanctuary';
  const quickAccess = useQuickAccessPreferences(
    'self',
    quickAccessScope,
    SELF_FEATURE_MANIFEST.all.map((feature) => feature.id),
    ['fire_journal'],
    getMaxPinnedForWorkspace('self'),
  );
  const workbench = useDomainWorkbench('self', { usageScope: quickAccessScope });
  const [showOverview, setShowOverview] = useState(true);
  const [showSadhanaModal, setShowSadhanaModal] = useState(false);
  const [activeModalFeature, setActiveModalFeature] = useState<SelfFeatureManifestItem | null>(null);
  const [audioMuted, setAudioMuted] = useState(false);

  useEffect(() => {
    setAudioMuted(isSanctuaryAudioMuted());
    return subscribeSanctuaryAudio(setAudioMuted);
  }, []);

  const handleToggleAudio = useCallback(() => {
    const next = toggleSanctuaryAudio();
    setAudioMuted(next);
  }, []);

  const [todaySadhana, setTodaySadhana] = useState<{
    intention: string;
    energyLevel: number;
  } | null>(null);
  const loadTodaySadhana = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem('sanctuary_today_sadhana');
      if (raw) {
        const parsed = JSON.parse(raw);
        const todayStr = new Date().toISOString().slice(0, 10);
        if (parsed.date === todayStr) {
          setTodaySadhana(parsed);
          return;
        }
      }
      setTodaySadhana(null);
    } catch {
      setTodaySadhana(null);
    }
  }, []);

  useEffect(() => {
    loadTodaySadhana();
    const handler = () => loadTodaySadhana();
    window.addEventListener('sanctuary_sadhana_saved', handler);
    return () => window.removeEventListener('sanctuary_sadhana_saved', handler);
  }, [loadTodaySadhana]);
  const returnToHome = useCallback(() => setShowOverview(true), []);
  const exploreCapacity = useExploreCapacity();
  const primaryRole =
    initialCapacity ?? (accountId === 'explore-guest' ? exploreCapacity : undefined);
  const isExplore =
    accountId === 'explore-guest' || accountId === 'explore' || initialPracticing;
  const practiceAdapter = useMemo(
    () =>
      accountId
        ? createAccountSafeTrySelfPracticeAdapter({ accountId, workspaceId: 'self' })
        : null,
    [accountId],
  );
  const canPracticeInBrowser =
    practiceAdapter !== null &&
    declaredPracticeCapability(fireJournalFeature.id, 'browser') !== null;
  const horizon = workbench.state.temporalHorizon ?? todayHorizon();
  const currentAnchorDate =
    horizon.anchor.kind === 'date' ? horizon.anchor.date : toIsoDate(new Date());
  const coordinates = useMemo(
    () => resolveTemporalCoordinates(currentAnchorDate, { domain: 'self' }),
    [currentAnchorDate],
  );

  const datesKey = useMemo(
    () => coordinates.slots.map((s) => s.date).join(','),
    [coordinates.slots],
  );

  const { data: activityDensity = {} } = useQuery<Readonly<Record<string, number>>>({
    queryKey: ['self', 'activity-density', accountId ?? 'anonymous', datesKey],
    queryFn: async () => {
      if (!practiceAdapter?.getActivityDensityForDates) return {};
      const dates = coordinates.slots.map((s) => s.date);
      const result = practiceAdapter.getActivityDensityForDates(dates);
      return result instanceof Promise ? await result : result;
    },
    enabled: Boolean(practiceAdapter?.getActivityDensityForDates),
    staleTime: 60_000,
  });

  const focusedTask = useMemo(
    () =>
      workbench.state.tasks.find((task) => task.taskKey === workbench.state.focusedTaskKey) ?? null,
    [workbench.state.focusedTaskKey, workbench.state.tasks],
  );
  const canvas = useSelfCanvas({
    accountId: accountId ?? 'anonymous',
    activeFeatureId: focusedTask ? focusedTask.featureId : null,
    role: primaryRole,
    roles: primaryRole ? [primaryRole, ...capacities] : capacities,
  });

  const [atmosphere, setAtmosphere] = useState<FloorAtmosphereKind>(() => {
    if (typeof window === 'undefined') return 'washi-grain';
    try {
      const stored = window.localStorage.getItem('sanctuary-atmosphere:self');
      if (
        stored === 'none' ||
        stored === 'washi-grain' ||
        stored === 'aurora-mesh' ||
        stored === 'celestial-embers'
      ) {
        return stored;
      }
      return 'washi-grain';
    } catch {
      return 'washi-grain';
    }
  });

  const [selfFurnitureOrder, setSelfFurnitureOrder] = useState<string[]>([
    'hero',
    'somatic',
    'circadian',
    'shelf',
    'catalog',
  ]);

  const selectAtmosphere = useCallback((kind: FloorAtmosphereKind) => {
    setAtmosphere(kind);
    try {
      window.localStorage.setItem('sanctuary-atmosphere:self', kind);
    } catch {
      // Ignore in restricted environments
    }
  }, []);

  useEffect(() => {
    if (!workbench.state.temporalHorizon) workbench.setTemporalHorizon(todayHorizon());
  }, [workbench]);

  const loadHistory = useCallback(async () => {
    await Promise.resolve();
    setScreen((current) => ({ ...current, error: null, historyStatus: 'loading' }));
    try {
      const rawEntries = isPracticing
        ? coordinates.intent === 'review'
          ? practiceAdapter?.loadJournalForDate(coordinates.date)
          : practiceAdapter?.loadJournal()
        : await loadBurnedJournalHistory();
      const entries = Array.isArray(rawEntries) ? rawEntries : [];
      setScreen((current) => ({ ...current, entries, historyStatus: 'ready' }));
    } catch (error) {
      setScreen((current) => ({
        ...current,
        error:
          error instanceof Error ? error.message : 'We could not load your Fire Journal history.',
        historyStatus: 'error',
      }));
    }
  }, [isPracticing, practiceAdapter, coordinates.date, coordinates.intent]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = screen.draft.trim();
    if (!content || screen.isBurning) return;

    setScreen((current) => ({ ...current, error: null, isBurning: true, notice: null }));
    try {
      const isReviewMode = coordinates.intent === 'review';
      const entry = isPracticing
        ? await practiceAdapter?.burnJournal(content, {
            targetDate: coordinates.date,
            isRetroactive: isReviewMode,
          })
        : await burnJournal(content);
      if (!entry) throw new Error('Safe Try is unavailable until the account identity is ready.');
      setScreen((current) => ({
        ...current,
        draft: '',
        entries: [entry, ...current.entries],
        isBurning: false,
        notice: isPracticing
          ? 'Practice release saved on this device. Your real journal was not changed.'
          : 'Released. Only this short preview remains in your journal history.',
      }));
    } catch (error) {
      setScreen((current) => ({
        ...current,
        error: error instanceof Error ? error.message : 'We could not release that reflection.',
        isBurning: false,
      }));
    }
  }

  async function enterSafeTry() {
    if (!canPracticeInBrowser) return;
    try {
      const entries = await practiceAdapter?.loadJournal();
      if (!entries) return;
      setIsPracticing(true);
      setScreen({ ...initialScreen, entries, historyStatus: 'ready' });
    } catch (error) {
      setScreen((current) => ({
        ...current,
        error: error instanceof Error ? error.message : 'Safe Try could not open on this device.',
      }));
    }
  }

  async function discardSafeTry() {
    try {
      if (!practiceAdapter) return;
      await practiceAdapter.reset();
      setIsPracticing(false);
      setScreen((current) => ({
        ...initialScreen,
        draft: current.draft,
        notice: 'Safe Try was discarded. Your real Fire Journal was not changed.',
      }));
    } catch (error) {
      setScreen((current) => ({
        ...current,
        error: error instanceof Error ? error.message : 'Safe Try could not be discarded.',
      }));
    }
  }

  function openFireJournal() {
    quickAccess.trackUse(fireJournalFeature.id);
    const result = workbench.open(fireJournalTask);
    if (result.kind === 'at-capacity') {
      setScreen((current) => ({
        ...current,
        error: 'Close one of your other Self tasks before opening Fire Journal.',
      }));
      return;
    }
    setShowOverview(false);
  }

  function focusTask(task: WorkbenchTaskDescriptor) {
    workbench.focus(task.taskKey);
    setShowOverview(false);
  }

  function closeTask(task: WorkbenchTaskDescriptor) {
    const returnToHome = showOverview;
    const result = workbench.close(task.taskKey);
    setShowOverview(returnToHome || result.kind === 'overview');
  }

  function openFeature(feature: SelfFeatureManifestItem) {
    quickAccess.trackUse(feature.id);
    const isModalKind =
      feature.id === 'mood_lotus' ||
      feature.id === 'breath_guide' ||
      feature.id === 'daily_pulse' ||
      feature.id === 'gratitude_glimmers' ||
      feature.id === 'joy_jar' ||
      feature.id === 'wisdom_seeds';

    if (isModalKind) {
      setActiveModalFeature(feature);
      return;
    }

    const result = workbench.open({
      ...fireJournalTask,
      featureId: feature.id,
      title: feature.label,
      icon: feature.emoji,
    });
    if (result.kind === 'at-capacity') {
      setScreen((current) => ({
        ...current,
        error: `Close one of your other Self tasks before opening ${feature.label}.`,
      }));
      return;
    }
    setShowOverview(false);
  }

  function openQuickAccessFeature(feature: SelfFeatureManifestItem) {
    openFeature(feature);
  }

  useEffect(() => {
    const practice = new URLSearchParams(window.location.search).get('practice');
    if (practice === 'breath') {
      openFeature(requiredFeature('breath_guide'));
    } else if (practice === 'journal') {
      openFireJournal();
    }
  }, []);

  const journalActive = !showOverview && focusedTask?.featureId === fireJournalFeature.id;
  const wellbeingTaskActive =
    !showOverview &&
    (focusedTask?.featureId === 'mood_lotus' ||
      focusedTask?.featureId === 'breath_guide' ||
      focusedTask?.featureId === 'daily_pulse');

  useEffect(() => {
    if (!journalActive) return;
    let active = true;
    (async () => {
      try {
        const rawEntries = isPracticing
          ? coordinates.intent === 'review'
            ? practiceAdapter?.loadJournalForDate(coordinates.date)
            : practiceAdapter?.loadJournal()
          : await loadBurnedJournalHistory();
        if (!active) return;
        const entries = Array.isArray(rawEntries) ? rawEntries : [];
        setScreen((current) => ({ ...current, entries, historyStatus: 'ready' }));
      } catch (error) {
        if (!active) return;
        setScreen((current) => ({
          ...current,
          error:
            error instanceof Error ? error.message : 'We could not load your Fire Journal history.',
          historyStatus: 'error',
        }));
      }
    })();

    return () => {
      active = false;
    };
  }, [journalActive, isPracticing, practiceAdapter, coordinates.date, coordinates.intent]);

  const practiceContent = journalActive ? (
    <FireJournal
      isPracticing={isPracticing}
      practiceStorageKind={practiceAdapter?.storageKind ?? 'memory'}
      onDiscardPractice={discardSafeTry}
      onEnterPractice={enterSafeTry}
      screen={screen}
      setScreen={setScreen}
      loadHistory={loadHistory}
      submit={submit}
      temporalIntent={coordinates.intent}
      selectedDate={coordinates.date}
    />
  ) : wellbeingTaskActive && focusedTask ? (
    <MoodLotusModal
      embedded
      initialTab={focusedTask.featureId === 'breath_guide' ? 'breath' : 'mood'}
      onClose={returnToHome}
      temporalIntent={coordinates.intent}
      selectedDate={coordinates.date}
      isPracticing={isPracticing}
      practiceAdapter={practiceAdapter}
    />
  ) : focusedTask?.featureId === 'joy_jar' ? (
    <JoyJar userId={accountId ?? 'guest-explorer'} />
  ) : focusedTask?.featureId === 'gratitude_glimmers' ? (
    <GratitudeGlimmers userId={accountId ?? 'guest-explorer'} />
  ) : focusedTask?.featureId === 'wisdom_seeds' ? (
    <WisdomSeeds userId={accountId ?? 'guest-explorer'} />
  ) : focusedTask?.featureId === 'tomorrow_prep' ? (
    <TomorrowPrep userId={accountId ?? 'guest-explorer'} />
  ) : focusedTask?.featureId === 'sleep_tracker' ? (
    <SleepTracker userId={accountId ?? 'guest-explorer'} />
  ) : focusedTask?.featureId === 'personal_goals' ? (
    <StudentGoals userId={accountId ?? 'guest-explorer'} />
  ) : focusedTask?.featureId === 'daily_rhythm' || focusedTask?.featureId === 'study_rhythm' ? (
    <DailyRhythm userId={accountId ?? 'guest-explorer'} />
  ) : focusedTask?.featureId === 'governance_history' ? (
    <ProgressTree userId={accountId ?? 'guest-explorer'} />
  ) : focusedTask?.featureId === 'energy_forecast' ? (
    <EnergyForecast userId={accountId ?? 'guest-explorer'} selectedDate={coordinates.date} />
  ) : focusedTask?.featureId === 'voice_journal' ? (
    <VoiceJournaling userId={accountId ?? 'guest-explorer'} />
  ) : focusedTask?.featureId === 'reminders' ? (
    <RemindersManager userId={accountId ?? 'guest-explorer'} />
  ) : focusedTask?.featureId === 'wind_down_ritual' ? (
    <WindDownRitual userId={accountId ?? 'guest-explorer'} />
  ) : focusedTask?.featureId === 'monthly_reflection' ? (
    <WarmMirrorCard userId={accountId ?? 'guest-explorer'} />
  ) : focusedTask?.featureId === 'resonance_patterns' ? (
    <ResonancePatternCard userId={accountId ?? 'guest-explorer'} />
  ) : focusedTask?.featureId === 'academic_grades' ? (
    <MyGradesView userId={accountId ?? 'guest-explorer'} />
  ) : focusedTask?.featureId === 'daily_content' ? (
    <DailyContentCard userId={accountId ?? 'guest-explorer'} />
  ) : focusedTask?.featureId === 'reframe' ? (
    <ReframeWizard userId={accountId ?? 'guest-explorer'} />
  ) : focusedTask?.featureId === 'decisions' ? (
    <DecisionJournalSection userId={accountId ?? 'guest-explorer'} />
  ) : focusedTask?.featureId === 'professional_history' ||
    focusedTask?.featureId === 'journey_timeline' ? (
    <TeachingHistoryTimeline userId={accountId ?? 'guest-explorer'} />
  ) : focusedTask?.featureId === 'daily_pulse' ? (
    <PulseDashboard userId={accountId ?? 'guest-explorer'} />
  ) : (
    <UnavailableTask task={focusedTask} onReturnToOverview={() => setShowOverview(true)} />
  );

  return (
    <SanctuaryFloorCanvas
      appearance={canvas.appearance}
      className={
        canvas.phase === 'morning'
          ? styles.diurnalDawn
          : canvas.phase === 'night'
            ? styles.diurnalDusk
            : styles.diurnalSolar
      }
      domain="self"
      furnitureItems={SELF_FURNITURE_ITEMS}
      groupOrder={selfFurnitureOrder}
      onReorderFurniture={setSelfFurnitureOrder}
      onResetFloorDefaults={canvas.resetAppearance}
      showPageActions={showOverview}
      onTogglePinFurniture={canvas.togglePin}
      pinnedIds={canvas.pinnedIds}
      setAppearance={canvas.setAppearance}
      titleId="self-floor-title"
      greeting={timeGreeting(displayName)}
      breadcrumb={
        showOverview
          ? coordinates.intent === 'review'
            ? 'Self · Archival Horizon'
            : coordinates.intent === 'plan'
              ? 'Self · Future Horizon'
              : 'Self · Overview'
          : `Self · ${focusedTask?.title ?? 'Task'}`
      }
      timeControl={
        <DateTimeCombo
          formFactor="nano"
          date={coordinates.date}
          dateLabel={coordinates.dateLabel}
          intent={coordinates.intent}
          activityDensity={activityDensity}
          onSelectDate={(date) => {
            workbench.setTemporalHorizon({
              anchor: { kind: 'date', date },
              scale: 'day',
              intent: resolveTemporalIntent(date, toIsoDate(new Date())),
            });
          }}
          onToday={() => workbench.setTemporalHorizon(todayHorizon())}
          allowDismiss={false}
        />
      }
    >
      {({ isArrangeMode }) => (
        <>
          <TaskStrip
            shellSlot
            focusedTaskKey={workbench.state.focusedTaskKey}
            onCloseTask={closeTask}
            onFocusTask={focusTask}
            onReorderTask={(taskKey, destinationIndex) => workbench.reorder(taskKey, destinationIndex)}
            onOpenOverview={() => {
              setShowOverview(true);
              requestAnimationFrame(() =>
                document.getElementById('self-catalog-title')?.scrollIntoView?.({
                  behavior: 'smooth',
                  block: 'start',
                }),
              );
            }}
            quickAccessItems={SELF_FEATURE_MANIFEST.all.map((feature) => ({
              id: feature.id,
              label: feature.label,
              emoji: feature.emoji,
            }))}
            quickAccessPinnedIds={quickAccess.pinnedIds}
            quickAccessUsage={quickAccess.usage}
            quickAccessPinLimit={quickAccess.pinLimit}
            onOpenQuickAccessItem={(item) => {
              const feature = SELF_FEATURE_MANIFEST.all.find((candidate) => candidate.id === item.id);
              if (feature) openQuickAccessFeature(feature);
            }}
            onToggleQuickAccessPin={quickAccess.togglePin}
            overviewActive={showOverview}
            tasks={workbench.state.tasks}
          />

          {showOverview ? (
            <div className={styles.featureContentIn} key="self-home">
              <SelfOverview
                isArrangeMode={isArrangeMode}
                displayName={displayName}
                phase={canvas.phase}
                groupOrder={canvas.groupOrder}
                floorSectionOrder={selfFurnitureOrder}
                manifestAll={canvas.sortedManifestAll}
                onOpenFeature={openFeature}
                onOpenFireJournal={openFireJournal}
                pinnedFeatures={canvas.pinnedFeatures}
                pinnedIds={quickAccess.pinnedIds}
                usage={quickAccess.usage}
                onTogglePin={quickAccess.togglePin}
                fireJournalId={fireJournalFeature.id}
                temporalIntent={coordinates.intent}
                selectedDate={coordinates.date}
                primaryRole={primaryRole}
                otherRoles={capacities}
                userId={accountId}
                isExplore={isExplore}
              />
            </div>
          ) : (
            <div
              className={styles.featureContentIn}
              data-layout-mode={canvas.layoutMode}
              key={focusedTask?.taskKey ?? 'self-feature'}
            >
              <div className={styles.activePracticeStage}>{practiceContent}</div>
            </div>
          )}

          <DailySadhanaModal
            isOpen={showSadhanaModal}
            onClose={() => setShowSadhanaModal(false)}
            userId={accountId}
          />

          {activeModalFeature && (
            <Dialog
              open={!!activeModalFeature}
              onClose={() => setActiveModalFeature(null)}
              title={activeModalFeature.label}
              description={
                activeModalFeature.id === 'breath_guide'
                  ? 'Follow the gentle rhythm to settle your autonomic nervous system.'
                  : activeModalFeature.id === 'daily_pulse'
                    ? 'Your living morning threshold: commitments, energy anchors, and mindful pacing.'
                    : activeModalFeature.id === 'gratitude_glimmers'
                      ? 'Capture moments of student growth, colleague support, or quiet personal wins.'
                      : activeModalFeature.id === 'joy_jar'
                        ? 'Preserve classroom breakthrough moments and joyful connections.'
                        : activeModalFeature.id === 'wisdom_seeds'
                          ? 'Plant spontaneous pedagogical insights and grounding reminders.'
                          : undefined
              }
            >
              <div style={{ marginTop: '0.5rem', width: '100%' }}>
                {activeModalFeature.id === 'mood_lotus' || activeModalFeature.id === 'breath_guide' ? (
                  <MoodLotusModal
                    embedded
                    initialTab={activeModalFeature.id === 'breath_guide' ? 'breath' : 'mood'}
                    onClose={() => setActiveModalFeature(null)}
                    temporalIntent={coordinates.intent}
                    selectedDate={coordinates.date}
                    isPracticing={isPracticing}
                    practiceAdapter={practiceAdapter}
                  />
                ) : activeModalFeature.id === 'daily_pulse' ? (
                  <PulseDashboard userId={accountId ?? 'guest-explorer'} onClose={() => setActiveModalFeature(null)} />
                ) : activeModalFeature.id === 'gratitude_glimmers' ? (
                  <GratitudeGlimmers userId={accountId ?? 'guest-explorer'} />
                ) : activeModalFeature.id === 'joy_jar' ? (
                  <JoyJar userId={accountId ?? 'guest-explorer'} />
                ) : activeModalFeature.id === 'wisdom_seeds' ? (
                  <WisdomSeeds userId={accountId ?? 'guest-explorer'} />
                ) : null}
              </div>
            </Dialog>
          )}
        </>
      )}
    </SanctuaryFloorCanvas>
  );
}
