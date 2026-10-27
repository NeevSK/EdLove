'use client';

import React, { useState } from 'react';
import { useWisdom } from '../../../../lib/sanctuary/selfBrowserAdapters';
import styles from './wisdom-seeds.module.css';

interface WisdomSeedsProps {
  userId?: string;
}

export function WisdomSeeds({ userId = 'guest-explorer' }: Readonly<WisdomSeedsProps>) {
  const { notes, isLoading, addWisdomNote } = useWisdom(userId);
  const [showForm, setShowForm] = useState(false);
  const [insight, setInsight] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!insight.trim()) return;
    setSaving(true);
    try {
      await addWisdomNote(insight.trim());
      setInsight('');
      setShowForm(false);
    } catch (cause) {
      console.error('Failed to save wisdom seed:', cause);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className={styles.container} aria-label="Wisdom Seeds Practice">
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <span className={styles.icon}>🌱</span>
          <div>
            <h2 className={styles.title}>Wisdom Seeds</h2>
            <p className={styles.subtitle}>
              Spontaneous pedagogical insights, aphorisms, and grounding reminders planted during
              the rhythm of teaching.
            </p>
          </div>
        </div>
        <button
          type="button"
          className={styles.addBtn}
          onClick={() => setShowForm((prev) => !prev)}
        >
          {showForm ? '✕ Cancel' : '+ Plant Seed'}
        </button>
      </header>

      {showForm && (
        <form onSubmit={handleSave} className={styles.formCard}>
          <h3 className={styles.formTitle}>Plant an Insight</h3>

          <div className={styles.field}>
            <label htmlFor="wisdom-insight-input" className={styles.label}>
              What pedagogical or contemplative realization emerged?
            </label>
            <textarea
              id="wisdom-insight-input"
              rows={3}
              className={styles.textarea}
              placeholder="e.g. When attention wanders, reduce speed before increasing volume..."
              value={insight}
              onChange={(e) => setInsight(e.target.value)}
              required
            />
          </div>

          <div className={styles.formActions}>
            <button type="submit" className={styles.submitBtn} disabled={saving || !insight.trim()}>
              {saving ? 'Planting…' : 'Plant in Wisdom Soil 🪷'}
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className={styles.emptyState}>Listening for wisdom…</div>
      ) : notes.length === 0 ? (
        <div className={styles.emptyState}>
          <span style={{ fontSize: '2rem' }}>🌾</span>
          <p>No seeds planted yet. What truth became clear during your teaching today?</p>
        </div>
      ) : (
        <div className={styles.seedsList}>
          {notes.map((seed) => (
            <article key={seed.id} className={styles.seedCard}>
              <span className={styles.seedSprout}>🌱</span>
              <p className={styles.seedText}>"{seed.insight}"</p>
              <time className={styles.seedTime}>
                {seed.created_at
                  ? new Date(seed.created_at).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })
                  : ''}
              </time>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
