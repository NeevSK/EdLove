'use client';

import React, { useState } from 'react';
import { useGratitude } from '../../../../lib/sanctuary/selfBrowserAdapters';
import styles from './gratitude-glimmers.module.css';

interface GratitudeGlimmersProps {
  userId?: string;
}

type Category = 'student-said' | 'colleague-kindness' | 'personal-win';

const CATEGORIES: Array<{
  value: Category;
  label: string;
  emoji: string;
  color: string;
}> = [
  { value: 'student-said', label: 'A student said…', emoji: '💬', color: '#8b5cf6' },
  { value: 'colleague-kindness', label: 'Colleague kindness', emoji: '🤝', color: '#3b82f6' },
  { value: 'personal-win', label: 'Personal win', emoji: '🏆', color: '#f59e0b' },
];

export function GratitudeGlimmers({ userId = 'guest-explorer' }: Readonly<GratitudeGlimmersProps>) {
  const { entries, isLoading, addGratitudeEntry } = useGratitude(userId);
  const [showForm, setShowForm] = useState(false);
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<Category>('student-said');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setSaving(true);
    setSaveError(null);

    try {
      await addGratitudeEntry({
        category,
        content: content.trim(),
      });
      setContent('');
      setShowForm(false);
    } catch (cause) {
      setSaveError(cause instanceof Error ? cause.message : 'Failed to record gratitude entry.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className={styles.container} aria-label="Gratitude Glimmers Practice">
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <span className={styles.icon}>✨</span>
          <div>
            <h2 className={styles.title}>Gratitude Glimmers</h2>
            <p className={styles.subtitle}>
              Attune your senses to microscopic moments of grace, kindness, and small victories
              throughout the teaching day.
            </p>
          </div>
        </div>
        <button
          type="button"
          className={styles.addBtn}
          onClick={() => setShowForm((prev) => !prev)}
        >
          {showForm ? '✕ Cancel' : '+ Note a Glimmer'}
        </button>
      </header>

      {showForm && (
        <form onSubmit={handleSave} className={styles.formCard}>
          <h3 className={styles.formTitle}>Record a Glimmer</h3>

          <div className={styles.categoryPills}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                className={`${styles.catPill} ${category === cat.value ? styles.catPillActive : ''}`}
                style={{
                  borderColor: category === cat.value ? cat.color : undefined,
                  backgroundColor: category === cat.value ? `${cat.color}15` : undefined,
                }}
                onClick={() => setCategory(cat.value)}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          <div className={styles.field}>
            <label htmlFor="glimmer-content-input" className={styles.label}>
              What caught your heart?
            </label>
            <textarea
              id="glimmer-content-input"
              rows={3}
              className={styles.textarea}
              placeholder="A kind glance, a colleague sharing tea, a student remembering an idea..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>

          {saveError && <p className={styles.error}>{saveError}</p>}

          <div className={styles.formActions}>
            <button type="submit" className={styles.submitBtn} disabled={saving || !content.trim()}>
              {saving ? 'Saving…' : 'Record Glimmer 🪷'}
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className={styles.emptyState}>Gathering glimmers…</div>
      ) : entries.length === 0 ? (
        <div className={styles.emptyState}>
          <span style={{ fontSize: '2rem' }}>🌿</span>
          <p>
            No glimmers recorded yet today. Take a conscious breath and notice what went gently
            right.
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          {entries.map((item) => {
            const cat = CATEGORIES.find((c) => c.value === item.category) ?? CATEGORIES[0];
            return (
              <article key={item.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <span className={styles.tag} style={{ color: cat?.color ?? '#64748b' }}>
                    {cat?.emoji ?? '✨'} {cat?.label ?? 'Reflection'}
                  </span>
                  <time className={styles.time}>
                    {item.created_at
                      ? new Date(item.created_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })
                      : ''}
                  </time>
                </div>
                <p className={styles.content}>{item.content || item.category}</p>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
