'use client';

import { type FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import {
  loadMoodHistory,
  logMood,
  MOOD_CHOICES,
  type MoodLog,
  type MoodValue,
} from '../../../../lib/sanctuary/selfWellbeing';
import styles from '../self-floor.module.css';
import { BreathGuide } from './BreathGuide';
import { formatDate } from './formatDate';

export function MoodLotusModal({
  onClose,
  initialTab = 'mood',
}: Readonly<{ onClose: () => void; initialTab?: 'mood' | 'breath' }>) {
  const [activeTab, setActiveTab] = useState<'mood' | 'breath'>(initialTab);
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
    await Promise.resolve();
    setLoading(true);
    setError(null);
    try {
      const entries = await loadMoodHistory();
      setHistory(Array.isArray(entries) ? entries : []);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'We could not load your mood history.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const fetchHistory = async () => {
      await Promise.resolve();
      if (active) {
        await refreshHistory();
      }
    };
    fetchHistory().catch(() => {});
    const previousFocus =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialogRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !savingRef.current) onClose();
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      active = false;
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
      setHistory((current) => [entry, ...(Array.isArray(current) ? current : [])].slice(0, 8));
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
            <p className={styles.eyebrow}>Somatic Sanctuary</p>
            <h2 id="mood-lotus-title">
              {activeTab === 'mood' ? 'How are you arriving?' : 'Breath Resonance'}
            </h2>
            <p id="mood-lotus-description">
              {activeTab === 'mood'
                ? 'A brief check-in for this moment. It is saved to your private history, not opened as a task.'
                : 'Follow the gentle rhythm to settle your autonomic nervous system.'}
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

        <div className={styles.modalTabs} role="tablist" aria-label="Somatic modalities">
          <button
            className={`${styles.tabButton} ${activeTab === 'mood' ? styles.tabButtonActive : ''}`}
            onClick={() => setActiveTab('mood')}
            role="tab"
            aria-selected={activeTab === 'mood'}
            type="button"
          >
            🪷 Mood Reflection
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'breath' ? styles.tabButtonActive : ''}`}
            onClick={() => setActiveTab('breath')}
            role="tab"
            aria-selected={activeTab === 'breath'}
            type="button"
          >
            🌬️ Breath Resonance
          </button>
        </div>

        {activeTab === 'breath' ? (
          <BreathGuide />
        ) : (
          <>
            <form
              className={styles.moodForm}
              onSubmit={(event) => {
                submit(event).catch(() => {});
              }}
            >
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
                  <span className={styles.hint}>
                    Last check-in: {formatDate(latest.created_at)}
                  </span>
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
                    onClick={() => {
                      refreshHistory().catch(() => {});
                    }}
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
                  {history.map((entry) => (
                    <li key={entry.id}>
                      <div className={styles.moodHistoryEntry}>
                        <span aria-hidden="true" className={styles.moodEmoji}>
                          {MOOD_CHOICES.find((choice) => choice.value === entry.mood)?.emoji ?? '•'}
                        </span>
                        <div>
                          <p className={styles.moodLabel}>
                            {entry.mood
                              ? entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)
                              : 'Logged'}
                          </p>
                          {entry.note ? <p className={styles.moodNote}>{entry.note}</p> : null}
                          <time dateTime={entry.created_at}>{formatDate(entry.created_at)}</time>
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : null}
            </section>
          </>
        )}
      </section>
    </div>
  );
}
