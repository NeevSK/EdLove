'use client';

import React, { useState } from 'react';
import { useJoyJar } from '../../../../lib/sanctuary/selfBrowserAdapters';
import styles from './joy-jar.module.css';

interface JoyJarProps {
  userId?: string;
}

type Category = 'breakthrough' | 'question' | 'connection' | 'other';

const CATEGORIES: Array<{
  value: Category;
  label: string;
  emoji: string;
  color: string;
}> = [
  { value: 'breakthrough', label: 'Breakthrough', emoji: '💡', color: '#f59e0b' },
  { value: 'question', label: 'Great Question', emoji: '❓', color: '#8b5cf6' },
  { value: 'connection', label: 'Connection', emoji: '💫', color: '#3b82f6' },
  { value: 'other', label: 'Other', emoji: '✨', color: '#10b981' },
];

export function JoyJar({ userId = 'guest-explorer' }: Readonly<JoyJarProps>) {
  const { joyMoments, isLoading, addJoyMoment, error } = useJoyJar(userId);
  const [showForm, setShowForm] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('breakthrough');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) return;
    setSaving(true);
    setSaveError(null);

    try {
      await addJoyMoment({
        category,
        moment_description: description.trim(),
        student_name: studentName.trim() || undefined,
      });
      setDescription('');
      setStudentName('');
      setShowForm(false);
    } catch (cause) {
      setSaveError(cause instanceof Error ? cause.message : 'Failed to deposit joy moment.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className={styles.container} aria-label="Joy Jar Practice">
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <span className={styles.icon}>🏺</span>
          <div>
            <h2 className={styles.title}>Joy Jar</h2>
            <p className={styles.subtitle}>
              Capture subtle breakthroughs, genuine student questions, and sacred moments of
              connection.
            </p>
          </div>
        </div>
        <button
          type="button"
          className={styles.addBtn}
          onClick={() => setShowForm((prev) => !prev)}
        >
          {showForm ? '✕ Cancel' : '+ Drop Joy Moment'}
        </button>
      </header>

      {showForm && (
        <form onSubmit={handleSave} className={styles.formCard}>
          <h3 className={styles.formTitle}>Drop a Coin into the Joy Jar</h3>

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
            <label htmlFor="joy-student-input" className={styles.label}>
              Student / Peer (optional)
            </label>
            <input
              id="joy-student-input"
              type="text"
              className={styles.input}
              placeholder="e.g. Kasun, or Class 9-B"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="joy-desc-input" className={styles.label}>
              What spark occurred?
            </label>
            <textarea
              id="joy-desc-input"
              rows={3}
              className={styles.textarea}
              placeholder="Describe the moment of curiosity or understanding..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {saveError && <p className={styles.error}>{saveError}</p>}

          <div className={styles.formActions}>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={saving || !description.trim()}
            >
              {saving ? 'Depositing…' : 'Drop into Jar 🪷'}
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className={styles.emptyState}>Gently opening the jar…</div>
      ) : joyMoments.length === 0 ? (
        <div className={styles.emptyState}>
          <span style={{ fontSize: '2rem' }}>✨</span>
          <p>
            The jar is quiet. Deposit your first teaching highlight or classroom breakthrough above.
          </p>
        </div>
      ) : (
        <div className={styles.momentList}>
          {joyMoments.map((moment) => {
            const cat = CATEGORIES.find((c) => c.value === moment.category) ?? CATEGORIES[3];
            return (
              <article key={moment.id} className={styles.momentCard}>
                <div className={styles.momentTop}>
                  <span className={styles.momentTag} style={{ color: cat?.color ?? '#64748b' }}>
                    {cat?.emoji ?? '✨'} {cat?.label ?? 'Moment'}
                  </span>
                  {moment.student_name && (
                    <span className={styles.momentStudent}>✦ {moment.student_name}</span>
                  )}
                </div>
                <p className={styles.momentDesc}>{moment.moment_description}</p>
                <time className={styles.momentTime}>
                  {moment.created_at
                    ? new Date(moment.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })
                    : ''}
                </time>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
