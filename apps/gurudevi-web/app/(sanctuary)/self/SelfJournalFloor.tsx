'use client';

import type { FeatureSurfaceStateSnapshot } from '@repo/core/logic/capabilityDecision';
import { declaredPracticeCapability } from '@repo/core/logic/registry/capabilityManifest';
import type { DomainTemporalHorizon, WorkbenchTaskDescriptor } from '@repo/core/types';
import { resolveWorkspaceGroupOrder } from '@repo/core/logic/workspace/canvas';
import {
  resolveSelfFeatureManifest,
  type SelfFeatureManifestItem,
} from '@repo/self/features/catalog';
import { FeatureStateBoundary } from '@repo/ui/components/FeatureStateBoundary.web';
import {
  type Dispatch,
  type FormEvent,
  type SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useBrowserWorkspaceAppearance } from '../../../lib/canvas/useBrowserWorkspaceAppearance';
import { createAccountSafeTrySelfPracticeAdapter } from '../../../lib/sanctuary/selfExplore';
import {
  type BurnedJournalEntry,
  burnJournal,
  loadBurnedJournalHistory,
} from '../../../lib/sanctuary/selfJournal';
import {
  loadMoodHistory,
  logMood,
  MOOD_CHOICES,
  type MoodLog,
  type MoodValue,
} from '../../../lib/sanctuary/selfWellbeing';
import { useDomainWorkbench } from '../../../lib/workbench';
import { TaskStrip, TemporalHorizon } from '../components/workbench';
import {
  BROWSER_SELF_FEATURES,
  getBrowserSelfFeature,
  isBrowserSelfFeatureDelivered,
} from './browserFeatureRegistry';
import styles from './self-journal.module.css';

type ScreenState = Readonly<{
  draft: string;
  entries: readonly BurnedJournalEntry[];
  error: string | null;
  historyStatus: 'loading' | 'ready' | 'error';
  isBurning: boolean;
  notice: string | null;
}>;

const initialScreen: ScreenState = {
  draft: '',
  entries: [],
  error: null,
  historyStatus: 'loading',
  isBurning: false,
  notice: null,
};

type SelfGroup = SelfFeatureManifestItem['category'];

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

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.valueOf())
    ? 'Recently'
    : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date);
}

export function SelfJournalFloor({
  accountId,
  displayName,
}: Readonly<{ accountId: string; displayName: string }>) {
  const [screen, setScreen] = useState<ScreenState>(initialScreen);
  const floorAppearance = useBrowserWorkspaceAppearance({
    accountId,
    defaultGroupOrder: ['identity', 'wellbeing', 'growth', 'practice', 'professional'],
    workspaceId: 'self',
  });
  const [isPracticing, setIsPracticing] = useState(false);
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

  useEffect(() => {
    if (!workbench.state.temporalHorizon) workbench.setTemporalHorizon(todayHorizon());
  }, [workbench, workbench.state.temporalHorizon]);

  useEffect(() => {
    if (focusedTask) setShowOverview(false);
  }, [focusedTask]);

  const loadHistory = useCallback(async () => {
    setScreen((current) => ({ ...current, error: null, historyStatus: 'loading' }));
    try {
      const entries = isPracticing
        ? ((await practiceAdapter?.loadJournal()) ?? [])
        : await loadBurnedJournalHistory();
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

  function openFeature(feature: SelfFeatureManifestItem) {
    const delivery = getBrowserSelfFeature(feature.id);
    if (delivery?.taskKind === 'modal' && delivery.renderer === 'mood-lotus') {
      setMoodModalOpen(true);
      return;
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
    if (journalActive) void loadHistory();
  }, [journalActive, isPracticing, loadHistory]);

  return (
    <article
      className={styles.floor}
      aria-labelledby="self-floor-title"
      data-domain="self"
      data-appearance={floorAppearance.appearance.preset}
      data-motion={floorAppearance.appearance.motion}
    >
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
          groupOrder={resolveWorkspaceGroupOrder(floorAppearance.groupOrder, [
            'identity',
            'wellbeing',
            'growth',
            'practice',
            'professional',
          ]).filter(isSelfGroup)}
          onOpenFeature={openFeature}
          onOpenFireJournal={openFireJournal}
        />
      ) : journalActive ? (
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
      )}
      {moodModalOpen ? <MoodLotusModal onClose={() => setMoodModalOpen(false)} /> : null}
    </article>
  );
}

function isSelfGroup(value: string): value is SelfGroup {
  return (
    value === 'identity' ||
    value === 'wellbeing' ||
    value === 'growth' ||
    value === 'practice' ||
    value === 'professional'
  );
}

function SelfOverview({
  displayName,
  groupOrder,
  onOpenFeature,
  onOpenFireJournal,
}: Readonly<{
  displayName: string;
  groupOrder: readonly SelfGroup[];
  onOpenFeature: (feature: SelfFeatureManifestItem) => void;
  onOpenFireJournal: () => void;
}>) {
  const byCategory = SELF_FEATURE_MANIFEST.all.reduce<Record<SelfGroup, SelfFeatureManifestItem[]>>(
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

      <section aria-labelledby="self-pinned-title" className={styles.catalog}>
        <div>
          <p className={styles.eyebrow}>Pinned practice</p>
          <h2 id="self-pinned-title">Fire Journal</h2>
          <p>
            Release a private reflection. Only a short preview and the day remain in your history.
          </p>
        </div>
        <button className={styles.burnButton} onClick={onOpenFireJournal} type="button">
          Open Fire Journal
        </button>
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

function categoryTitle(category: SelfGroup): string {
  const labels: Record<SelfGroup, string> = {
    identity: 'Identity',
    wellbeing: 'Wellbeing',
    growth: 'Growth',
    practice: 'Practice & rhythm',
    professional: 'Professional',
  };
  return labels[category] ?? category;
}

function FeatureCatalogCard({
  feature,
  onOpen,
}: Readonly<{ feature: SelfFeatureManifestItem; onOpen: () => void }>) {
  const runnable = isBrowserSelfFeatureDelivered(feature.id);
  const status = runnable
    ? feature.availability === 'authorization-unresolved'
      ? 'Available after secure check'
      : 'Open practice'
    : 'Not yet delivered in browser';

  return (
    <article className={styles.catalogItem} data-runnable={runnable}>
      <p aria-hidden="true" className={styles.catalogEmoji}>
        {feature.emoji}
      </p>
      <h4>{feature.label}</h4>
      <p>{featureDescription(feature)}</p>
      {runnable ? (
        <button className={styles.catalogOpen} onClick={onOpen} type="button">
          {status}
        </button>
      ) : (
        <span className={styles.catalogStatus}>{status}</span>
      )}
    </article>
  );
}

function featureDescription(feature: SelfFeatureManifestItem): string {
  if (feature.id === fireJournalFeature.id)
    return 'Release a private reflection. Only a short preview and the day remain in history.';
  return `${feature.category} practice · ${feature.timing?.preferredPhase ?? 'any time'}`;
}

function MoodLotusModal({ onClose }: Readonly<{ onClose: () => void }>) {
  const [history, setHistory] = useState<readonly MoodLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedMood, setSelectedMood] = useState<MoodValue | null>(null);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const savingRef = useRef(false);

  useEffect(() => {
    savingRef.current = saving;
  }, [saving]);

  const refreshHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setHistory(await loadMoodHistory());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'We could not load your mood history.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshHistory();
    const previousFocus =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialogRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !savingRef.current) onClose();
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      previousFocus?.focus();
    };
  }, [onClose, refreshHistory]);

  const latest = history[0] ?? null;
  const selectedChoice = MOOD_CHOICES.find((choice) => choice.value === selectedMood) ?? null;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedMood || saving) return;
    setSaving(true);
    setError(null);
    try {
      const entry = await logMood({ mood: selectedMood, note });
      setHistory((current) => [entry, ...current].slice(0, 8));
      setNote('');
      setSelectedMood(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'We could not save this check-in.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className={styles.modalBackdrop}
      onMouseDown={(event) => {
        if (event.currentTarget === event.target && !saving) onClose();
      }}
    >
      <section
        aria-describedby="mood-lotus-description"
        aria-labelledby="mood-lotus-title"
        aria-modal="true"
        className={styles.moodModal}
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <header className={styles.modalHeader}>
          <div>
            <p className={styles.eyebrow}>Mood Lotus</p>
            <h2 id="mood-lotus-title">How are you arriving?</h2>
            <p id="mood-lotus-description">
              A brief check-in for this moment. It is saved to your private history, not opened as a
              task.
            </p>
          </div>
          <button
            aria-label="Close Mood Lotus"
            className={styles.modalClose}
            disabled={saving}
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </header>
        <form className={styles.moodForm} onSubmit={(event) => void submit(event)}>
          <fieldset disabled={saving}>
            <legend>Choose what feels closest</legend>
            <div className={styles.moodChoices}>
              {MOOD_CHOICES.map((choice) => (
                <button
                  aria-pressed={selectedMood === choice.value}
                  className={styles.moodChoice}
                  data-selected={selectedMood === choice.value}
                  key={choice.value}
                  onClick={() => setSelectedMood(choice.value)}
                  type="button"
                >
                  <span aria-hidden="true">{choice.emoji}</span>
                  {choice.label}
                </button>
              ))}
            </div>
          </fieldset>
          <label htmlFor="mood-lotus-note">A few words, if useful</label>
          <textarea
            disabled={saving}
            id="mood-lotus-note"
            maxLength={500}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Optional. Keep this gentle and brief."
            rows={3}
            value={note}
          />
          <div className={styles.actions}>
            <button
              className={styles.burnButton}
              disabled={!selectedChoice || saving}
              type="submit"
            >
              {saving
                ? 'Saving…'
                : selectedChoice
                  ? `Save ${selectedChoice.label}`
                  : 'Choose a feeling'}
            </button>
            {latest ? (
              <span className={styles.hint}>Last check-in: {formatDate(latest.created_at)}</span>
            ) : null}
          </div>
        </form>
        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}
        <section aria-labelledby="mood-history-title" className={styles.moodHistory}>
          <div className={styles.historyHeader}>
            <h3 id="mood-history-title">Recent check-ins</h3>
            {error && !saving ? (
              <button
                className={styles.retryButton}
                onClick={() => void refreshHistory()}
                type="button"
              >
                Retry
              </button>
            ) : null}
          </div>
          {loading ? <p className={styles.empty}>Gathering the recent pattern…</p> : null}
          {!loading && history.length === 0 ? (
            <p className={styles.empty}>Your first check-in can begin here.</p>
          ) : null}
          {!loading && history.length > 0 ? (
            <ol className={styles.moodHistoryList}>
              {history.slice(0, 5).map((entry) => (
                <li key={entry.id}>
                  <span>
                    {MOOD_CHOICES.find((choice) => choice.value === entry.mood)?.emoji ?? '🪷'}
                  </span>
                  <span>{entry.mood ?? 'Check-in'}</span>
                  <time dateTime={entry.created_at}>{formatDate(entry.created_at)}</time>
                </li>
              ))}
            </ol>
          ) : null}
        </section>
      </section>
    </div>
  );
}

function UnavailableTask({
  task,
  onReturnToOverview,
}: Readonly<{ task: WorkbenchTaskDescriptor | null; onReturnToOverview: () => void }>) {
  return (
    <section aria-labelledby="self-task-unavailable-title" className={styles.unavailableTask}>
      <p className={styles.eyebrow}>Self · Restored task</p>
      <h1 id="self-task-unavailable-title">This practice is not available in the browser.</h1>
      <p>
        {task?.title ?? 'This task'} was restored from your working set, but its browser renderer is
        not delivered. Return to the Self overview to choose an available practice.
      </p>
      <button className={styles.burnButton} onClick={onReturnToOverview} type="button">
        Return to overview
      </button>
    </section>
  );
}

function FireJournal({
  isPracticing,
  practiceStorageKind,
  onDiscardPractice,
  onEnterPractice,
  screen,
  setScreen,
  loadHistory,
  submit,
}: Readonly<{
  isPracticing: boolean;
  practiceStorageKind: 'local-storage' | 'memory';
  onDiscardPractice: () => void;
  onEnterPractice: () => void;
  screen: ScreenState;
  setScreen: Dispatch<SetStateAction<ScreenState>>;
  loadHistory: () => Promise<void>;
  submit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
}>) {
  const historySnapshot = journalHistorySnapshot(screen);

  return (
    <>
      <header className={styles.arrival}>
        <p className={styles.eyebrow}>Self · Fire Journal</p>
        <h1 id="self-floor-title">Make room for what needs to be released.</h1>
        <p>
          {isPracticing
            ? practiceStorageKind === 'local-storage'
              ? 'Safe Try uses fictional sample data and saves only on this browser. Your account journal is untouched.'
              : 'Safe Try uses fictional sample data in this page session only. Your account journal is untouched.'
            : 'Write freely. When you release an entry, the full text is not retained.'}
        </p>
        <div className={styles.actions}>
          {isPracticing ? (
            <button className={styles.retryButton} onClick={onDiscardPractice} type="button">
              End Safe Try and discard
            </button>
          ) : (
            <button className={styles.retryButton} onClick={onEnterPractice} type="button">
              Try this safely
            </button>
          )}
        </div>
      </header>
      <div className={styles.grid}>
        <section className={styles.alcove} aria-labelledby="fire-journal-compose-title">
          <p className={styles.eyebrow}>Reflection</p>
          <h2 id="fire-journal-compose-title">What can leave your hands today?</h2>
          <form
            className={styles.form}
            onSubmit={(event) => {
              void submit(event);
            }}
          >
            <label htmlFor="fire-journal-entry">A private reflection</label>
            <textarea
              disabled={screen.isBurning}
              id="fire-journal-entry"
              maxLength={10_000}
              onChange={(event) =>
                setScreen((current) => ({ ...current, draft: event.target.value }))
              }
              placeholder="Write without needing to carry every word forward."
              required
              rows={7}
              value={screen.draft}
            />
            <div className={styles.actions}>
              <button className={styles.burnButton} disabled={screen.isBurning} type="submit">
                {screen.isBurning
                  ? 'Releasing…'
                  : isPracticing
                    ? 'Practice release'
                    : 'Release to Fire Journal'}
              </button>
              <span className={styles.hint}>
                {isPracticing
                  ? 'This only changes the local practice copy.'
                  : 'The full reflection is not saved.'}
              </span>
            </div>
          </form>
          {screen.notice ? (
            <p className={styles.status} role="status">
              {screen.notice}
            </p>
          ) : null}
          {screen.error ? (
            <p className={styles.error} role="alert">
              {screen.error}
            </p>
          ) : null}
        </section>

        <section className={styles.history} aria-labelledby="fire-journal-history-title">
          <div className={styles.historyHeader}>
            <div>
              <p className={styles.eyebrow}>What remains</p>
              <h2 id="fire-journal-history-title">Burned history</h2>
            </div>
          </div>
          <FeatureStateBoundary
            emptyTitle="Nothing has been released here yet"
            onRetry={() => void loadHistory()}
            snapshot={historySnapshot}
          >
            <ol className={styles.historyList}>
              {screen.entries.map((entry) => (
                <li key={entry.id}>
                  <article className={styles.entry}>
                    <p>{entry.content_preview}</p>
                    <footer>
                      <time dateTime={entry.created_at}>{formatDate(entry.created_at)}</time>
                      <span className={styles.burned}>Released</span>
                    </footer>
                  </article>
                </li>
              ))}
            </ol>
          </FeatureStateBoundary>
        </section>
      </div>
    </>
  );
}

function journalHistorySnapshot(screen: ScreenState): FeatureSurfaceStateSnapshot {
  const state =
    screen.historyStatus === 'loading'
      ? 'loading'
      : screen.historyStatus === 'error'
        ? 'retryable_error'
        : screen.entries.length === 0
          ? 'empty'
          : 'ready';

  return {
    state,
    lastKnownGoodAt: null,
    pendingMutationCount: 0,
    canRetry: state === 'retryable_error',
    canEdit: true,
    isSensitive: true,
    safeMessage:
      state === 'loading'
        ? 'Gathering your history…'
        : state === 'retryable_error'
          ? (screen.error ?? 'We could not load your Fire Journal history.')
          : state === 'empty'
            ? 'Your released reflections will appear here.'
            : 'Your Fire Journal history is ready.',
  };
}
