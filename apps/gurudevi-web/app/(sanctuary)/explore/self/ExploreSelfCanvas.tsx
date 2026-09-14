'use client';

import Link from 'next/link';
import { type FormEvent, useState } from 'react';
import {
  createExploreSelfReflectionAdapter,
  type ExploreJournalEntry,
  type ExploreSelfReflectionAdapter,
} from '../../../../lib/explore';
import type { SanctuarySessionKind } from '../../../../lib/sanctuary/experience';
import styles from './explore-self.module.css';

export type SelfReflectionCanvasProps = Readonly<{
  adapter?: ExploreSelfReflectionAdapter;
  sessionKind?: SanctuarySessionKind;
}>;

function formatEntryDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value));
}

export function ExploreSelfCanvas({
  adapter: injectedAdapter,
  sessionKind = 'explore',
}: SelfReflectionCanvasProps) {
  const [adapter] = useState(() => injectedAdapter ?? createExploreSelfReflectionAdapter());
  const [screen, setScreen] = useState(() => ({
    draft: '',
    editingId: null as string | null,
    message: null as string | null,
    resetOpen: false,
    state: adapter.load(),
  }));

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const next = screen.editingId
        ? adapter.updateJournalEntry({ content: screen.draft, id: screen.editingId })
        : adapter.addJournalEntry({ content: screen.draft });
      setScreen({
        ...screen,
        draft: '',
        editingId: null,
        message: screen.editingId
          ? 'Your reflection was updated locally.'
          : 'Your reflection was saved locally.',
        state: next,
      });
    } catch (error) {
      setScreen({
        ...screen,
        message:
          error instanceof Error ? error.message : 'We could not save that reflection locally.',
      });
    }
  }

  function beginEdit(entry: ExploreJournalEntry) {
    setScreen({ ...screen, draft: entry.content, editingId: entry.id, message: null });
  }

  function remove(entry: ExploreJournalEntry) {
    try {
      setScreen({
        ...screen,
        message: 'Your reflection was removed from this browser.',
        state: adapter.deleteJournalEntry({ id: entry.id }),
      });
    } catch (error) {
      setScreen({
        ...screen,
        message: error instanceof Error ? error.message : 'We could not remove that reflection.',
      });
    }
  }

  function reset() {
    setScreen({
      draft: '',
      editingId: null,
      message: 'Explore was reset to its original sample reflection.',
      resetOpen: false,
      state: adapter.reset(),
    });
  }

  const entries = screen.state.self.journalEntries;

  return (
    <article className={styles.canvas} data-domain="self" aria-labelledby="explore-self-title">
      <header className={styles.arrival}>
        <p className={styles.eyebrow}>
          Self{sessionKind === 'explore' ? ' · private exploration' : ''}
        </p>
        <h1 id="explore-self-title">A little room to arrive.</h1>
        <p>
          {sessionKind === 'explore'
            ? 'This is the real Self canvas in a private browser session. Nothing here creates an account, syncs, or reaches another person.'
            : 'A private place for reflection, held through your verified Sanctuary account.'}
        </p>
      </header>

      {sessionKind === 'explore' ? (
        <aside className={styles.disclosure} aria-label="Explore storage notice">
          <p>
            <strong>Private sandbox.</strong> Reflections save on this browser only. Create an
            account when you decide you want to keep or sync eligible work.
          </p>
          <Link href="/sign-up">Keep this work</Link>
        </aside>
      ) : null}

      <section className={styles.alcove} aria-labelledby="reflection-form-title">
        <div>
          <p className={styles.eyebrow}>Reflection</p>
          <h2 id="reflection-form-title">
            {screen.editingId ? 'Return to the thought' : 'What is asking for your attention?'}
          </h2>
        </div>
        <form onSubmit={save}>
          <label htmlFor="explore-reflection">Your private reflection</label>
          <textarea
            id="explore-reflection"
            maxLength={10_000}
            onChange={(event) => setScreen({ ...screen, draft: event.target.value })}
            placeholder="Write without needing to make it permanent yet."
            required
            rows={6}
            value={screen.draft}
          />
          <div className={styles.actions}>
            <button type="submit">{screen.editingId ? 'Update reflection' : 'Save locally'}</button>
            {screen.editingId ? (
              <button
                className={styles.quietButton}
                onClick={() => {
                  setScreen({ ...screen, draft: '', editingId: null });
                }}
                type="button"
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>
        {screen.message ? (
          <p className={styles.message} role="status">
            {screen.message}
          </p>
        ) : null}
      </section>

      <section className={styles.entries} aria-labelledby="reflections-title">
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.eyebrow}>This browser</p>
            <h2 id="reflections-title">Your reflections</h2>
          </div>
          {sessionKind === 'explore' ? (
            <button
              className={styles.quietButton}
              onClick={() => setScreen({ ...screen, resetOpen: true })}
              type="button"
            >
              Reset Explore
            </button>
          ) : null}
        </div>
        {entries.length === 0 ? (
          <p className={styles.empty}>This browser has no saved reflections yet.</p>
        ) : (
          <ol className={styles.entryList}>
            {entries.map((entry) => (
              <li key={entry.id}>
                <article className={styles.entry}>
                  <p>{entry.content}</p>
                  <footer>
                    <span>
                      {entry.provenance === 'baseline'
                        ? 'Sample reflection'
                        : formatEntryDate(entry.createdAt)}
                    </span>
                    {entry.provenance === 'explorer' ? (
                      <span className={styles.entryActions}>
                        <button onClick={() => beginEdit(entry)} type="button">
                          Edit
                        </button>
                        <button onClick={() => remove(entry)} type="button">
                          Delete
                        </button>
                      </span>
                    ) : null}
                  </footer>
                </article>
              </li>
            ))}
          </ol>
        )}
      </section>

      {sessionKind === 'explore' && screen.resetOpen ? (
        <section
          className={styles.confirmation}
          aria-labelledby="reset-title"
          role="dialog"
          aria-modal="true"
        >
          <h2 id="reset-title">Reset this private exploration?</h2>
          <p>
            Your reflections in this browser will be removed and the sample reflection restored.
          </p>
          <div className={styles.actions}>
            <button onClick={reset} type="button">
              Reset Explore
            </button>
            <button
              className={styles.quietButton}
              onClick={() => setScreen({ ...screen, resetOpen: false })}
              type="button"
            >
              Cancel
            </button>
          </div>
        </section>
      ) : null}
    </article>
  );
}
