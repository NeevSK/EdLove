'use client';

import { declaredPracticeCapability } from '@repo/core/logic/registry/capabilityManifest';
import { getMaxPinnedForWorkspace } from '@repo/core/logic/workspace/canvas';
import {
  resolveTemporalCoordinates,
  resolveTemporalIntent,
  toIsoDate,
} from '@repo/core/logic/workbench';
import type { DomainTemporalHorizon, WorkbenchTaskDescriptor } from '@repo/core/types';
import {
  resolveSelfFeatureManifest,
  type SelfFeatureManifestItem,
} from '@repo/self/features/catalog';
import { Volume2, VolumeX } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
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
import {
  TaskStrip,
  TemporalHorizon,
  timeGreeting,
  WorkbenchContextHeader,
} from '../components/workbench';
import {
  BROWSER_SELF_FEATURES,
} from './browserFeatureRegistry';
import { FireJournal, initialScreen, type ScreenState } from './components/FireJournal';
import { MoodLotusModal } from './components/MoodLotusModal';
import { JoyJar } from './components/JoyJar';
import { GratitudeGlimmers } from './components/GratitudeGlimmers';
import { WisdomSeeds } from './components/WisdomSeeds';
import { TomorrowPrep } from './components/TomorrowPrep';
import { SleepTracker } from './components/SleepTracker';
import { StudentGoals } from './components/StudentGoals';
import { DailyRhythm } from './components/DailyRhythm';
import { ProgressTree } from './components/ProgressTree';
import { EnergyForecast } from './components/EnergyForecast';
import { VoiceJournaling } from './components/VoiceJournaling';
import { RemindersManager } from './components/RemindersManager';
import { WindDownRitual } from './components/WindDownRitual';
import { WarmMirrorCard } from './components/WarmMirrorCard';
import { ResonancePatternCard } from './components/ResonancePatternCard';
import { MyGradesView } from './components/MyGradesView';
import { DailyContentCard } from './components/DailyContentCard';
import { TeachingHistoryTimeline } from './components/TeachingHistoryTimeline';
import { DecisionJournalSection } from './components/DecisionJournalSection';
import { ReframeWizard } from './components/ReframeWizard';
import { PulseDashboard } from './components/PulseDashboard';
import { ShadowAgentDrawer } from './components/ShadowAgentDrawer';
import { SelfOverview } from './components/SelfOverview';
import { DynamicCareIsland } from './components/DynamicCareIsland';
import { DailySadhanaModal } from './components/DailySadhanaModal';
import { UnavailableTask } from './components/UnavailableTask';
import styles from './self-floor.module.css';

const SELF_FEATURE_MANIFEST = resolveSelfFeatureManifest(
  null,
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
    id: 'workbench',
    label: 'Task Workbench & Timeline',
    icon: '🧭',
  },
  {
    id: 'content',
    label: 'Practices & Living Canvas',
    icon: '🪷',
  },
];

export function SelfFloor({
  accountId,
  displayName,
  initialPracticing = false,
  initialCapacity,
}: Readonly<{
  accountId?: string;
  displayName: string;
  initialPracticing?: boolean;
  initialCapacity?: string;
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
  const [audioMuted, setAudioMuted] = useState(false);

  useEffect(() => {
    setAudioMuted(isSanctuaryAudioMuted());
    return subscribeSanctuaryAudio(setAudioMuted);
  }, []);

  const handleToggleAudio = useCallback(() => {
    const next = toggleSanctuaryAudio();
    setAudioMuted(next);
  }, []);

  const [todaySadhana, setTodaySadhana] = useState<{ intention: string; energyLevel: number } | null>(null);
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
  ) : focusedTask?.featureId === 'professional_history' || focusedTask?.featureId === 'journey_timeline' ? (
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
      groupOrder={[
        ...(canvas.groupOrder.length > 0 ? canvas.groupOrder : ['workbench', 'content']),
      ]}
      onReorderFurniture={(order) => canvas.setGroupOrder(order as unknown as SelfCategory[])}
      onResetFloorDefaults={canvas.resetAppearance}
      showPageActions={showOverview}
      onTogglePinFurniture={canvas.togglePin}
      pinnedIds={canvas.pinnedIds}
      setAppearance={canvas.setAppearance}
      titleId="self-floor-title"
      topControls={() => (
        <WorkbenchContextHeader
          domain="self"
          homeActive={showOverview}
          dateControl={
            <TemporalHorizon
              compact
              dateLabel={coordinates.dateLabel}
              intent={coordinates.intent}
              orientation={coordinates.orientationLabel}
              slots={coordinates.slots}
              activityDensity={activityDensity}
              onSelectDate={(date) => {
                workbench.setTemporalHorizon({
                  anchor: { kind: 'date', date },
                  scale: 'day',
                  intent: resolveTemporalIntent(date, toIsoDate(new Date())),
                });
              }}
              onToday={() => workbench.setTemporalHorizon(todayHorizon())}
            />
          }
          greeting={timeGreeting(displayName)}
          intent={coordinates.intent}
          selectedDate={coordinates.date}
          renderExtra={() => (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className={styles.centerNowBtn}
                onClick={() => setShowSadhanaModal(true)}
              >
                <span>🌿 Center Now</span>
              </button>
              {todaySadhana?.intention ? (
                <span
                  className={styles.livingAnchorBadge}
                  title={`Today's Energy: ${todaySadhana.energyLevel}/5`}
                >
                  ✦ {todaySadhana.intention}
                </span>
              ) : null}
              <button
                type="button"
                className={styles.audioToggleBtn}
                onClick={handleToggleAudio}
                aria-label={
                  audioMuted
                    ? 'Sanctuary chimes muted. Click to enable sound.'
                    : 'Sanctuary chimes active. Click to mute.'
                }
                title={
                  audioMuted
                    ? 'Sanctuary chimes muted (Click to unmute)'
                    : 'Sanctuary chimes active (Click to mute)'
                }
              >
                {audioMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
              </button>
              <DynamicCareIsland
                userId={accountId}
                onOpenReminders={() => openFeature(requiredFeature('reminders'))}
              />
              <ShadowAgentDrawer userId={accountId} />
            </div>
          )}
        />
      )}
    >
      <TaskStrip
          shellSlot
          focusedTaskKey={workbench.state.focusedTaskKey}
          onCloseTask={closeTask}
          onFocusTask={focusTask}
          onReorderTask={(taskKey, destinationIndex) => workbench.reorder(taskKey, destinationIndex)}
          onOpenOverview={() => {
            setShowOverview(true);
            requestAnimationFrame(() =>
              document.getElementById('self-catalog-title')?.scrollIntoView({
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
            displayName={displayName}
            groupOrder={canvas.groupOrder}
            manifestAll={canvas.sortedManifestAll}
            onOpenFeature={openFeature}
            onOpenFireJournal={openFireJournal}
            pinnedFeatures={canvas.pinnedFeatures}
            fireJournalId={fireJournalFeature.id}
            temporalIntent={coordinates.intent}
            selectedDate={coordinates.date}
            primaryRole={primaryRole}
            userId={accountId}
          />
        </div>
      ) : (
        <div className={styles.featureContentIn} data-layout-mode={canvas.layoutMode} key={focusedTask?.taskKey ?? 'self-feature'}>
          <div className={styles.activePracticeStage}>{practiceContent}</div>
        </div>
      )}

      <DailySadhanaModal
        isOpen={showSadhanaModal}
        onClose={() => setShowSadhanaModal(false)}
        userId={accountId}
      />
    </SanctuaryFloorCanvas>
  );
}
