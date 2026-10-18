'use client';

import type { FeatureSurfaceStateSnapshot } from '@repo/core/logic/capabilityDecision';
import { FeatureStateBoundary } from '@repo/ui/components/FeatureStateBoundary.web';
import type { Dispatch, FormEvent, SetStateAction } from 'react';
import type { BurnedJournalEntry } from '../../../../lib/sanctuary/selfJournal';
import { LivingCard } from '../../components/LivingCard';
import styles from '../self-floor.module.css';
import { formatDate } from './formatDate';

export type ScreenState = Readonly<{
  draft: string;
  entries: readonly BurnedJournalEntry[];
  error: string | null;
  historyStatus: 'loading' | 'ready' | 'error';
  isBurning: boolean;
  notice: string | null;
}>;

export const initialScreen: ScreenState = {
  draft: '',
  entries: [],
  error: null,
  historyStatus: 'loading',
  isBurning: false,
  notice: null,
};

export function FireJournal({
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
          <LivingCard
            variant="ember"
            elevation="raised"
            style={{ padding: 'clamp(1.25rem, 3vw, 2rem)' }}
          >
            <p className={styles.eyebrow}>Reflection</p>
            <h2 id="fire-journal-compose-title">What can leave your hands today?</h2>
            {screen.notice ? (
              <div className={styles.catharsisCard}>
                <span className={styles.catharsisEmoji} aria-hidden="true">
                  🔥
                </span>
                <h3 className={styles.catharsisTitle}>Released.</h3>
                <p className={styles.catharsisText}>The words are ash now. You are lighter.</p>
                <p className={styles.hint} role="status">
                  {screen.notice}
                </p>
                <button
                  className={styles.retryButton}
                  onClick={() => setScreen((current) => ({ ...current, notice: null }))}
                  type="button"
                >
                  Write Another Reflection
                </button>
              </div>
            ) : (
              <form
                className={`${styles.form} ${screen.isBurning ? styles.burnGlow : ''}`}
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
            )}
            {screen.error ? (
              <p className={styles.error} role="alert">
                {screen.error}
              </p>
            ) : null}
          </LivingCard>
        </section>

        <section className={styles.history} aria-labelledby="fire-journal-history-title">
          <LivingCard
            variant="vellum"
            elevation="flat"
            style={{ padding: 'clamp(1.25rem, 3vw, 1.75rem)' }}
          >
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
          </LivingCard>
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
        : (screen.entries?.length ?? 0) === 0
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
