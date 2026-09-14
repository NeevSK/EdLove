'use client';

import { type FormEvent, useCallback, useEffect, useState } from 'react';
import {
  type BurnedJournalEntry,
  burnJournal,
  loadBurnedJournalHistory,
} from '../../../lib/sanctuary/selfJournal';
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

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.valueOf())
    ? 'Recently'
    : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date);
}

export function SelfJournalFloor({ displayName }: Readonly<{ displayName: string }>) {
  const [screen, setScreen] = useState<ScreenState>(initialScreen);

  const loadHistory = useCallback(async () => {
    setScreen((current) => ({ ...current, error: null, historyStatus: 'loading' }));
    try {
      const entries = await loadBurnedJournalHistory();
      setScreen((current) => ({ ...current, entries, historyStatus: 'ready' }));
    } catch (error) {
      setScreen((current) => ({
        ...current,
        error:
          error instanceof Error ? error.message : 'We could not load your Fire Journal history.',
        historyStatus: 'error',
      }));
    }
  }, []);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = screen.draft.trim();
    if (!content || screen.isBurning) return;

    setScreen((current) => ({ ...current, error: null, isBurning: true, notice: null }));
    try {
      const entry = await burnJournal(content);
      setScreen((current) => ({
        ...current,
        draft: '',
        entries: [entry, ...current.entries],
        isBurning: false,
        notice: 'Released. Only this short preview remains in your journal history.',
      }));
    } catch (error) {
      setScreen((current) => ({
        ...current,
        error: error instanceof Error ? error.message : 'We could not release that reflection.',
        isBurning: false,
      }));
    }
  }

  return (
    <article className={styles.floor} aria-labelledby="self-journal-title" data-domain="self">
      <header className={styles.arrival}>
        <p className={styles.eyebrow}>Self · Fire Journal</p>
        <h1 id="self-journal-title">Make room for what needs to be released.</h1>
        <p>
          {displayName}, write freely. When you release an entry, the full text is not retained;
          your history holds only its first few words and the day it was offered.
        </p>
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
                {screen.isBurning ? 'Releasing…' : 'Release to Fire Journal'}
              </button>
              <span className={styles.hint}>The full reflection is not saved.</span>
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
            {screen.historyStatus === 'error' ? (
              <button
                className={styles.retryButton}
                onClick={() => {
                  void loadHistory();
                }}
                type="button"
              >
                Retry
              </button>
            ) : null}
          </div>
          {screen.historyStatus === 'loading' ? (
            <p className={styles.empty}>Gathering your history…</p>
          ) : null}
          {screen.historyStatus === 'ready' && screen.entries.length === 0 ? (
            <p className={styles.empty}>Nothing has been released here yet.</p>
          ) : null}
          {screen.historyStatus === 'ready' && screen.entries.length > 0 ? (
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
          ) : null}
        </section>
      </div>
    </article>
  );
}
