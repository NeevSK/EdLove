'use client';

import { declaredPracticeCapability } from '@repo/core/logic/registry/capabilityManifest';
import type { DomainTemporalHorizon, WorkbenchTaskDescriptor } from '@repo/core/types';
import {
  resolveSelfFeatureManifest,
  type SelfFeatureManifestItem,
} from '@repo/self/features/catalog';
import { type FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useSelfCanvas } from '../../../lib/canvas/useSelfCanvas';
import { createAccountSafeTrySelfPracticeAdapter } from '../../../lib/sanctuary/selfExplore';
import { burnJournal, loadBurnedJournalHistory } from '../../../lib/sanctuary/selfJournal';
import { useDomainWorkbench } from '../../../lib/workbench';
import { FloorAtmosphere, type FloorAtmosphereKind } from '../components/FloorAtmosphere';
import { FloorAtmospherePicker } from '../components/FloorAtmospherePicker';
import { TaskStrip, TemporalHorizon } from '../components/workbench';
import {
  BROWSER_SELF_FEATURES,
  getBrowserSelfFeature,
  isBrowserSelfFeatureDelivered,
} from './browserFeatureRegistry';
import { FireJournal, initialScreen, type ScreenState } from './components/FireJournal';
import { MoodLotusModal } from './components/MoodLotusModal';
import { SelfCatalogRail } from './components/SelfCatalogRail';
import { SelfOverview } from './components/SelfOverview';
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
  temporalBinding: { kind: 'none' },
  localStatePolicy: 'restore-permitted',
} as const;

function todayHorizon(): DomainTemporalHorizon {
  const now = new Date();
  return {
    anchor: {
      kind: 'date',
      date: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
        now.getDate(),
      ).padStart(2, '0')}`,
    },
    scale: 'day',
    intent: 'current',
  };
}

function shiftDate(horizon: DomainTemporalHorizon, amount: number): DomainTemporalHorizon {
  const anchorDate =
    horizon.anchor.kind === 'date' ? horizon.anchor.date : new Date().toISOString();
  const date = new Date(`${anchorDate.slice(0, 10)}T12:00:00`);
  date.setDate(date.getDate() + amount);
  return { ...horizon, anchor: { kind: 'date', date: date.toISOString().slice(0, 10) } };
}

function formatHorizon(horizon: DomainTemporalHorizon): string {
  if (horizon.anchor.kind !== 'date') return 'Today';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'full' }).format(
    new Date(`${horizon.anchor.date}T12:00:00`),
  );
}

export function SelfFloor({
  accountId,
  displayName,
  initialPracticing = false,
}: Readonly<{ accountId?: string; displayName: string; initialPracticing?: boolean }>) {
  const [screen, setScreen] = useState<ScreenState>(initialScreen);
  const [isPracticing, setIsPracticing] = useState(initialPracticing || accountId === 'explore');
  const [moodModalOpen, setMoodModalOpen] = useState(false);
  const workbench = useDomainWorkbench('self');
  const [showOverview, setShowOverview] = useState(true);
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
  const focusedTask = useMemo(
    () =>
      workbench.state.tasks.find((task) => task.taskKey === workbench.state.focusedTaskKey) ?? null,
    [workbench.state.focusedTaskKey, workbench.state.tasks],
  );
  const canvas = useSelfCanvas({
    accountId: accountId ?? 'anonymous',
    activeFeatureId: focusedTask ? focusedTask.featureId : null,
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
        ? await practiceAdapter?.loadJournal()
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
  }, [isPracticing, practiceAdapter]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = screen.draft.trim();
    if (!content || screen.isBurning) return;

    setScreen((current) => ({ ...current, error: null, isBurning: true, notice: null }));
    try {
      const entry = isPracticing
        ? await practiceAdapter?.burnJournal(content)
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
    const result = workbench.close(task.taskKey);
    setShowOverview(result.kind === 'overview');
  }

  const [moodModalInitialTab, setMoodModalInitialTab] = useState<'mood' | 'breath'>('mood');

  function openFeature(feature: SelfFeatureManifestItem) {
    const delivery = getBrowserSelfFeature(feature.id);
    if (delivery?.taskKind === 'modal') {
      if (delivery.renderer === 'mood-lotus') {
        setMoodModalInitialTab('mood');
        setMoodModalOpen(true);
        return;
      }
      if (delivery.renderer === 'breath-guide') {
        setMoodModalInitialTab('breath');
        setMoodModalOpen(true);
        return;
      }
    }
    if (feature.id === fireJournalFeature.id && isBrowserSelfFeatureDelivered(feature.id)) {
      openFireJournal();
      return;
    }
    setScreen((current) => ({
      ...current,
      error: `${feature.label} is not delivered in the browser yet. It remains in the catalog so the same Self floor can grow without a second navigation model.`,
    }));
  }

  const journalActive = !showOverview && focusedTask?.featureId === fireJournalFeature.id;

  useEffect(() => {
    if (!journalActive) return;
    let active = true;
    (async () => {
      try {
        const rawEntries = isPracticing
          ? await practiceAdapter?.loadJournal()
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
  }, [journalActive, isPracticing, practiceAdapter]);

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
    />
  ) : (
    <UnavailableTask task={focusedTask} onReturnToOverview={() => setShowOverview(true)} />
  );

  return (
    <article
      className={styles.floor}
      aria-labelledby="self-floor-title"
      data-domain="self"
      data-appearance={canvas.appearance.preset}
      data-motion={canvas.appearance.motion}
      data-atmosphere={atmosphere}
    >
      <FloorAtmosphere kind={atmosphere} preset={canvas.appearance.preset} />
      <div className={styles.workbenchChrome}>
        <TaskStrip
          focusedTaskKey={workbench.state.focusedTaskKey}
          onCloseTask={closeTask}
          onFocusTask={focusTask}
          onOpenCatalog={() => setShowOverview(true)}
          onOpenOverview={() => setShowOverview(true)}
          overviewActive={showOverview}
          tasks={workbench.state.tasks}
        />
        <TemporalHorizon
          dateLabel={formatHorizon(horizon)}
          onNext={() => workbench.setTemporalHorizon(shiftDate(horizon, 1))}
          onPrevious={() => workbench.setTemporalHorizon(shiftDate(horizon, -1))}
          onToday={() => workbench.setTemporalHorizon(todayHorizon())}
          orientation="A quiet daily orientation for reflection; Fire Journal does not bind to a date."
        />
      </div>
      {showOverview ? (
        <SelfOverview
          displayName={displayName}
          groupOrder={canvas.groupOrder}
          manifestAll={SELF_FEATURE_MANIFEST.all}
          onOpenFeature={openFeature}
          onOpenFireJournal={openFireJournal}
          pinnedFeatures={canvas.pinnedFeatures}
          fireJournalId={fireJournalFeature.id}
        />
      ) : (
        <div className={styles.masterDetailLayout} data-layout-mode={canvas.layoutMode}>
          <SelfCatalogRail
            canvas={canvas}
            focusedTask={focusedTask}
            onOpenFeature={openFeature}
            onReturnToOverview={() => {
              if (focusedTask) closeTask(focusedTask);
              setShowOverview(true);
            }}
          />

          <div className={styles.activePracticeStage}>
            <div className={styles.backOverviewBar}>
              <button
                className={styles.streamBackButton}
                onClick={() => {
                  if (focusedTask) closeTask(focusedTask);
                  setShowOverview(true);
                }}
                type="button"
              >
                ← Back to Overview
              </button>
            </div>
            {practiceContent}
          </div>
        </div>
      )}
      {moodModalOpen ? (
        <MoodLotusModal initialTab={moodModalInitialTab} onClose={() => setMoodModalOpen(false)} />
      ) : null}
      <FloorAtmospherePicker
        currentPreset={canvas.appearance.preset}
        currentMotion={canvas.appearance.motion}
        currentAtmosphere={atmosphere}
        onSelectPreset={(preset) => canvas.setAppearance({ ...canvas.appearance, preset })}
        onSelectMotion={(motion) => canvas.setAppearance({ ...canvas.appearance, motion })}
        onSelectAtmosphere={selectAtmosphere}
      />
    </article>
  );
}
