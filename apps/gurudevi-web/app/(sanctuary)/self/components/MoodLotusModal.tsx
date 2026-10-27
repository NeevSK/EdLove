'use client';

import { type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { AccountSafeTrySelfPracticeAdapter } from '../../../../lib/sanctuary/selfExplore';
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
  temporalIntent = 'current',
  selectedDate,
  embedded = false,
  isPracticing = false,
  practiceAdapter = null,
}: Readonly<{
  onClose: () => void;
  initialTab?: 'mood' | 'breath';
  temporalIntent?: 'current' | 'review' | 'plan';
  selectedDate?: string;
  embedded?: boolean;
  isPracticing?: boolean;
  practiceAdapter?: AccountSafeTrySelfPracticeAdapter | null;
}>) {
  const isReview = temporalIntent === 'review';
  const isPlan = temporalIntent === 'plan';
  const isCurrent = !isReview && !isPlan;

  const [activeTab, setActiveTab] = useState<'mood' | 'breath'>(initialTab);
  const [history, setHistory] = useState<readonly MoodLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedMood, setSelectedMood] = useState<MoodValue | null>(null);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isRetroactiveComposing, setIsRetroactiveComposing] = useState(false);
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
      if (isPracticing && practiceAdapter) {
        const raw =
          selectedDate && isReview
            ? practiceAdapter.loadMoodHistoryForDate(selectedDate)
            : practiceAdapter.loadMoodHistory();
        setHistory(Array.isArray(raw) ? raw : []);
      } else {
        const entries = await loadMoodHistory();
        setHistory(Array.isArray(entries) ? entries : []);
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'We could not load your mood history.');
    } finally {
      setLoading(false);
    }
  }, [isPracticing, practiceAdapter, selectedDate, isReview]);

  useEffect(() => {
    let active = true;
    const fetchHistory = async () => {
      await Promise.resolve();
      if (active) {
        await refreshHistory();
      }
    };
    fetchHistory().catch(() => {});
    return () => {
      active = false;
    };
  }, [refreshHistory]);

  useEffect(() => {
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
  }, [onClose]);

  const latest = history[0] ?? null;
  const selectedChoice = MOOD_CHOICES.find((choice) => choice.value === selectedMood) ?? null;

  // Filter entries to the selected date if in review mode
  const dateEntries = useMemo(() => {
    if (!selectedDate || isCurrent) return history;
    return history.filter((entry) => entry.created_at?.slice(0, 10) === selectedDate);
  }, [history, selectedDate, isCurrent]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedMood || saving) return;
    setSaving(true);
    setError(null);
    try {
      let entry: MoodLog;
      if (isPracticing && practiceAdapter) {
        entry = practiceAdapter.logMood({ mood: selectedMood, note });
      } else {
        entry = await logMood({ mood: selectedMood, note });
      }
      setHistory((current) => [entry, ...(Array.isArray(current) ? current : [])].slice(0, 8));
      setNote('');
      setSelectedMood(null);
      if (isRetroactiveComposing) {
        setIsRetroactiveComposing(false);
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'We could not save this check-in.');
    } finally {
      setSaving(false);
    }
  }

  const modalEyebrow = isReview
    ? 'Archival Somatic Record'
    : isPlan
      ? 'Future Horizon Intention'
      : isPracticing
        ? 'Safe Try Somatic Record'
        : 'Somatic Sanctuary';

  const modalTitle =
    activeTab === 'breath'
      ? 'Breath Resonance'
      : isReview
        ? `Mood on ${selectedDate ?? 'this day'}`
        : isPlan
          ? `Horizon for ${selectedDate ?? 'this day'}`
          : 'How are you arriving?';

  const modalDescription =
    activeTab === 'breath'
      ? 'Follow the gentle rhythm to settle your autonomic nervous system.'
      : isReview
        ? 'Historical mood check-ins remain peacefully sealed. You are reviewing your state on this day.'
        : isPlan
          ? 'This day is waiting to arrive. Check-ins unlock on that morning; practice breath resonance now.'
          : isPracticing
            ? 'Safe Try check-in: saved only on this device. Your account history remains untouched.'
            : 'A brief check-in for this moment. It is saved to your private history, not opened as a task.';

  return (
    <div
      className={embedded ? styles.moodTaskBackdrop : styles.modalBackdrop}
      onMouseDown={(event) => {
        if (!embedded && event.currentTarget === event.target && !saving) onClose();
      }}
    >
      <section
        aria-describedby="mood-lotus-description"
        aria-labelledby="mood-lotus-title"
        aria-modal={embedded ? undefined : true}
        className={embedded ? styles.moodTaskPanel : styles.moodModal}
        ref={dialogRef}
        role={embedded ? undefined : 'dialog'}
        tabIndex={-1}
      >
        <header className={styles.modalHeader}>
          <div>
            <p className={styles.eyebrow}>{modalEyebrow}</p>
            <h2 id="mood-lotus-title">{modalTitle}</h2>
            <p id="mood-lotus-description">{modalDescription}</p>
          </div>
          {!embedded ? (
            <button
              aria-label="Close Mood Lotus"
              className={styles.modalClose}
              disabled={saving}
              onClick={onClose}
              type="button"
            >
              Close
            </button>
          ) : null}
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
        ) : isPlan ? (
          /* Future Horizon Planning View */
          <div
            style={{
              padding: '2rem 1.5rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <span style={{ fontSize: '2.5rem' }} aria-hidden="true">
              🌅
            </span>
            <h3 style={{ fontFamily: 'Georgia, serif', color: 'var(--ink)', margin: 0 }}>
              Holding space for {selectedDate}
            </h3>
            <p style={{ color: 'var(--ink-soft)', maxWidth: '28rem', margin: 0, lineHeight: 1.55 }}>
              Live mood check-ins unlock when this day arrives. You can use Breath Resonance to
              center your nervous system today.
            </p>
            <button
              type="button"
              className={styles.burnButton}
              onClick={() => setActiveTab('breath')}
              style={{ marginTop: '0.5rem' }}
            >
              🌬️ Practice Breath Resonance
            </button>
          </div>
        ) : isReview && !isRetroactiveComposing ? (
          /* Archival Review View */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {dateEntries.length > 0 ? (
              <section aria-labelledby="mood-date-records">
                <p className={styles.eyebrow} id="mood-date-records">
                  Recorded on {selectedDate}
                </p>
                <ol className={styles.moodHistoryList}>
                  {dateEntries.map((entry) => (
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
              </section>
            ) : (
              <div
                style={{
                  padding: '2rem 1rem',
                  textAlign: 'center',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '0.75rem',
                  border: '1px solid var(--line)',
                }}
              >
                <p className={styles.eyebrow} style={{ margin: '0 0 0.5rem' }}>
                  Archival Record
                </p>
                <h3
                  style={{
                    fontFamily: 'Georgia, serif',
                    color: 'var(--ink)',
                    margin: '0 0 0.5rem',
                    fontSize: '1.15rem',
                  }}
                >
                  No mood was recorded on {selectedDate}
                </h3>
                <p
                  style={{
                    color: 'var(--ink-soft)',
                    margin: '0 auto',
                    maxWidth: '24rem',
                    fontSize: '0.88rem',
                    lineHeight: 1.5,
                  }}
                >
                  This day has passed. Past check-ins remain peaceful and sealed.
                </p>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
              <button
                type="button"
                className={styles.retryButton}
                onClick={() => setIsRetroactiveComposing(true)}
              >
                + Add retroactive note
              </button>
            </div>
          </div>
        ) : (
          /* Live Check-in Form (or Retroactive Composition) */
          <>
            <form
              className={styles.moodForm}
              onSubmit={(event) => {
                submit(event).catch(() => {});
              }}
            >
              <fieldset disabled={saving}>
                <legend>
                  {isRetroactiveComposing
                    ? `What was your state on ${selectedDate}?`
                    : 'Choose what feels closest'}
                </legend>
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
              <label htmlFor="mood-lotus-note">
                {isRetroactiveComposing ? 'Retroactive reflection note' : 'A few words, if useful'}
              </label>
              <textarea
                disabled={saving}
                id="mood-lotus-note"
                maxLength={500}
                onChange={(event) => setNote(event.target.value)}
                placeholder={
                  isRetroactiveComposing
                    ? 'Optional notes on how that day unfolded.'
                    : 'Optional. Keep this gentle and brief.'
                }
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
                      ? isRetroactiveComposing
                        ? `Save ${selectedChoice.label} (Retroactive)`
                        : `Save ${selectedChoice.label}`
                      : 'Choose a feeling'}
                </button>
                {isRetroactiveComposing ? (
                  <button
                    type="button"
                    className={styles.retryButton}
                    onClick={() => setIsRetroactiveComposing(false)}
                  >
                    Cancel
                  </button>
                ) : latest ? (
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
            {!isReview ? (
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
                            {MOOD_CHOICES.find((choice) => choice.value === entry.mood)?.emoji ??
                              '•'}
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
            ) : null}
          </>
        )}
      </section>
    </div>
  );
}
