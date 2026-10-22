'use client';

import React, { useState } from 'react';
import { useStudentGoals } from '@repo/self/hooks/useStudentGoals';
import styles from './student-goals.module.css';

interface StudentGoalsProps {
  userId?: string;
}

export function StudentGoals({ userId = 'guest-explorer' }: Readonly<StudentGoalsProps>) {
  const { goals, isLoading, addGoal, updateGoal } = useStudentGoals(userId);
  const [showForm, setShowForm] = useState(false);
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSaving(true);
    try {
      await addGoal(text.trim());
      setText('');
      setShowForm(false);
    } catch (cause) {
      console.error('Failed to add goal:', cause);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(id: string, current: boolean) {
    try {
      await updateGoal(id, {
        is_completed: !current,
        progress: !current ? 100 : 0,
      });
    } catch (cause) {
      console.error('Failed to update goal:', cause);
    }
  }

  return (
    <section className={styles.container} aria-label="Student Goals Practice">
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <span className={styles.icon}>🎯</span>
          <div>
            <h2 className={styles.title}>Learning Intentions & Goals</h2>
            <p className={styles.subtitle}>
              Articulate personal milestones and track your self-directed learning journey.
            </p>
          </div>
        </div>
        <button
          type="button"
          className={styles.addBtn}
          onClick={() => setShowForm((prev) => !prev)}
        >
          {showForm ? '✕ Cancel' : '+ Set New Goal'}
        </button>
      </header>

      {showForm && (
        <form onSubmit={handleAdd} className={styles.formCard}>
          <h3 className={styles.formTitle}>Define a Learning Horizon</h3>

          <div className={styles.field}>
            <label htmlFor="student-goal-input" className={styles.label}>
              What specific mastery or understanding are you cultivating?
            </label>
            <input
              id="student-goal-input"
              type="text"
              className={styles.input}
              placeholder="e.g. Master organic chemistry functional groups by Term 2..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={saving}
              required
            />
          </div>

          <div className={styles.formActions}>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={saving || !text.trim()}
            >
              {saving ? 'Saving…' : 'Set Goal 🪷'}
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className={styles.emptyState}>Loading learning intentions…</div>
      ) : goals.length === 0 ? (
        <div className={styles.emptyState}>
          <span style={{ fontSize: '2rem' }}>🧭</span>
          <p>No active goals recorded. Set an intention above to guide your daily studies.</p>
        </div>
      ) : (
        <div className={styles.list}>
          {goals.map((goal) => (
            <div
              key={goal.id}
              className={`${styles.goalRow} ${goal.is_completed ? styles.goalDone : ''}`}
            >
              <button
                type="button"
                className={`${styles.checkbox} ${goal.is_completed ? styles.checkboxChecked : ''}`}
                onClick={() => handleToggle(goal.id, Boolean(goal.is_completed))}
                aria-label={`Mark "${goal.text}" as ${goal.is_completed ? 'incomplete' : 'complete'}`}
              >
                {goal.is_completed ? '✓' : ''}
              </button>
              <div className={styles.goalInfo}>
                <span className={styles.goalText}>{goal.text}</span>
                {goal.progress !== undefined && (
                  <div className={styles.miniTrack}>
                    <div className={styles.miniFill} style={{ width: `${goal.progress}%` }} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
