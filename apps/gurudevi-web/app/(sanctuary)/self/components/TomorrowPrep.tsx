'use client';

import React, { useState } from 'react';
import { useTomorrowPrep } from '../../../../lib/sanctuary/selfBrowserAdapters';
import styles from './tomorrow-prep.module.css';

interface TomorrowPrepProps {
  userId?: string;
}

export function TomorrowPrep({ userId = 'guest-explorer' }: Readonly<TomorrowPrepProps>) {
  const { prepItems, isLoading, addPrepItem, updatePrepItem, removePrepItem } =
    useTomorrowPrep(userId);
  const [newText, setNewText] = useState('');
  const [saving, setSaving] = useState(false);

  const completedCount = prepItems.filter((i) => i.is_completed).length;
  const progressPct =
    prepItems.length > 0 ? Math.round((completedCount / prepItems.length) * 100) : 0;

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newText.trim()) return;
    setSaving(true);
    try {
      const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0] ?? '';
      await addPrepItem(newText.trim(), tomorrowStr);
      setNewText('');
    } catch (cause) {
      console.error('Failed to add prep item:', cause);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className={styles.container} aria-label="Tomorrow Preparation Practice">
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <span className={styles.icon}>🌙</span>
          <div>
            <h2 className={styles.title}>Tomorrow Prep</h2>
            <p className={styles.subtitle}>
              Clear the cognitive runway for tomorrow's teaching. Complete closing intentions so
              rest is truly restful.
            </p>
          </div>
        </div>
      </header>

      {/* Progress Track */}
      <div className={styles.progressCard}>
        <div className={styles.progressTop}>
          <span className={styles.progressLabel}>Evening Readiness</span>
          <span className={styles.progressPct}>{progressPct}%</span>
        </div>
        <div className={styles.track}>
          <div className={styles.fill} style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {/* Add Item Form */}
      <form onSubmit={handleAdd} className={styles.formRow}>
        <input
          type="text"
          className={styles.input}
          placeholder="e.g. Set up apparatus for 10-A titration experiment..."
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          disabled={saving}
          required
        />
        <button type="submit" className={styles.addBtn} disabled={saving || !newText.trim()}>
          {saving ? 'Adding…' : '+ Add Intention'}
        </button>
      </form>

      {/* Items Checklist */}
      {isLoading ? (
        <div className={styles.emptyState}>Preparing evening checklist…</div>
      ) : prepItems.length === 0 ? (
        <div className={styles.emptyState}>
          <span style={{ fontSize: '2rem' }}>✨</span>
          <p>
            No closing intentions left for tomorrow. You are centered and ready for restful sleep.
          </p>
        </div>
      ) : (
        <div className={styles.list}>
          {prepItems.map((item) => (
            <div
              key={item.id}
              className={`${styles.itemRow} ${item.is_completed ? styles.itemDone : ''}`}
            >
              <button
                type="button"
                className={`${styles.checkbox} ${item.is_completed ? styles.checkboxChecked : ''}`}
                onClick={() => updatePrepItem(item.id, { is_completed: !item.is_completed })}
                aria-label={`Mark "${item.item_text}" as ${item.is_completed ? 'incomplete' : 'complete'}`}
              >
                {item.is_completed ? '✓' : ''}
              </button>
              <span className={styles.itemText}>{item.item_text}</span>
              <button
                type="button"
                className={styles.deleteBtn}
                onClick={() => removePrepItem(item.id)}
                aria-label="Remove item"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
