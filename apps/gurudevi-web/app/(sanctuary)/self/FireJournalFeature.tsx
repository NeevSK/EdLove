'use client';

import { type FormEvent, useEffect, useState } from 'react';
import type { BurnedJournalEntry } from '../../../lib/sanctuary/selfJournal';
import { FeatureStateBoundary } from '../components/FeatureStateBoundary';
import type { FireJournalRuntime } from './fireJournalRuntime';
import styles from './self-floor.module.css';

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

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.valueOf())
    ? 'Recently'
    : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date);
}

export function FireJournalFeature({ runtime }: Readonly<{ runtime: FireJournalRuntime }>) {
  const [mode, setMode] = useState<'live' | 'practice'>(runtime.initialMode);
  const [screen, setScreen] = useState<ScreenState>(initialScreen);
  const adapter = mode === 'practice' ? runtime.practice : runtime.live;

  useEffect(() => {
    let active = true;
    setScreen((current) => ({ ...current, error: null, historyStatus: 'loading' }));
    if (!adapter) {
      setScreen((current) => ({
        ...current,
        error: 'This Fire Journal mode is not available in this session.',
        historyStatus: 'error',
      }));
      return () => {
        active = false;
      };
    }
    void adapter
      .loadJournal()
      .then((entries) => {
        if (active)
          setScreen((current) => ({
            ...current,
            entries: Array.isArray(entries) ? entries : [],
            historyStatus: 'ready',
          }));
      })
      .catch((error: unknown) => {
        if (active)
          setScreen((current) => ({
            ...current,
            error:
              error instanceof Error ? error.message : 'We could not load Fire Journal history.',
            historyStatus: 'error',
          }));
      });
    return () => {
      active = false;
    };
  }, [adapter]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = screen.draft.trim();
    if (!content || screen.isBurning || !adapter) return;
    setScreen((current) => ({ ...current, error: null, isBurning: true, notice: null }));
    try {
      const entry = await adapter.burnJournal(content);
      setScreen((current) => ({
        ...current,
        draft: '',
        entries: [entry, ...current.entries],
        isBurning: false,
        notice:
          mode === 'practice'
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

  async function enterPractice() {
    if (!runtime.practice) return;
    setMode('practice');
  }

  async function discardPractice() {
    if (!runtime.practice?.reset) return;
    try {
      await runtime.practice.reset();
      const entries = await runtime.practice.loadJournal();
      setScreen({
        ...initialScreen,
        entries,
        historyStatus: 'ready',
        notice: 'Safe Try was discarded. Your real Fire Journal was not changed.',
      });
    } catch (error) {
      setScreen((current) => ({
        ...current,
        error: error instanceof Error ? error.message : 'Safe Try could not be discarded.',
      }));
    }
  }

  const historySnapshot = {
    state:
      screen.historyStatus === 'loading'
        ? 'loading'
        : screen.historyStatus === 'error'
          ? 'retryable_error'
          : screen.entries.length === 0
            ? 'empty'
            : 'ready',
    lastKnownGoodAt: null,
    pendingMutationCount: 0,
    canRetry: screen.historyStatus === 'error',
    canEdit: true,
    isSensitive: true,
    safeMessage:
      screen.historyStatus === 'loading'
        ? 'Gathering your history…'
        : screen.historyStatus === 'error'
          ? (screen.error ?? 'We could not load your Fire Journal history.')
          : screen.entries.length === 0
            ? 'Your released reflections will appear here.'
            : 'Your Fire Journal history is ready.',
  } as const;

  return (
    <>
      <header className={styles.arrival}>
        <p className={styles.eyebrow}>Self · Fire Journal</p>
        <h1 id="self-floor-title">Make room for what needs to be released.</h1>
        <p>
          {mode === 'practice'
            ? 'Safe Try uses fictional sample data and saves only on this browser/device for up to 30 inactive days. It is not synced or encrypted at rest; discard it now if this browser is shared. Your account journal is untouched.'
            : 'Write freely. When you release an entry, the full text is not retained.'}
        </p>
        <div className={styles.actions}>
          {mode === 'practice' && runtime.live ? (
            <button className={styles.retryButton} onClick={discardPractice} type="button">
              End Safe Try and discard
            </button>
          ) : mode === 'live' && runtime.canPractice ? (
            <button
              className={styles.retryButton}
              onClick={() => void enterPractice()}
              type="button"
            >
              Try this safely
            </button>
          ) : null}
        </div>
      </header>
      <div className={styles.grid}>
        <section className={styles.alcove} aria-labelledby="fire-journal-compose-title">
          <p className={styles.eyebrow}>Reflection</p>
          <h2 id="fire-journal-compose-title">What can leave your hands today?</h2>
          <form className={styles.form} onSubmit={(event) => void submit(event)}>
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
                  : mode === 'practice'
                    ? 'Practice release'
                    : 'Release to Fire Journal'}
              </button>
              <span className={styles.hint}>
                {mode === 'practice'
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
            onRetry={() => setMode((current) => current)}
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
