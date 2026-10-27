'use client';

import React, { useEffect, useState } from 'react';
import { useSleepTracker } from '../../../../lib/sanctuary/selfBrowserAdapters';
import styles from './sleep-tracker.module.css';

interface SleepTrackerProps {
  userId?: string;
}

const QUALITY_LEVELS: Array<{ value: number; label: string; emoji: string; color: string }> = [
  { value: 1, label: 'Exhausted', emoji: '😫', color: '#ef4444' },
  { value: 2, label: 'Restless', emoji: '😔', color: '#f97316' },
  { value: 3, label: 'Adequate', emoji: '😐', color: '#eab308' },
  { value: 4, label: 'Rested', emoji: '😊', color: '#10b981' },
  { value: 5, label: 'Deeply Restored', emoji: '✨', color: '#8b5cf6' },
];

export function SleepTracker({ userId = 'guest-explorer' }: Readonly<SleepTrackerProps>) {
  const { sleepLogs, addSleepLog, setSleepLogs } = useSleepTracker(userId);
  const [quality, setQuality] = useState(3);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayLog = sleepLogs.find((log) => log.created_at.startsWith(todayStr)) ?? null;

  useEffect(() => {
    if (todayLog) {
      setQuality(todayLog.quality);
    }
  }, [todayLog]);

  async function handleSave() {
    setSaving(true);
    try {
      const data = await addSleepLog(quality);
      if (data) {
        setSleepLogs((prev) => [data, ...prev.filter((l) => !l.created_at.startsWith(todayStr))]);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (cause) {
      console.error('Failed to log sleep:', cause);
    } finally {
      setSaving(false);
    }
  }

  const selectedLevel = QUALITY_LEVELS.find((l) => l.value === quality) ?? QUALITY_LEVELS[2];

  return (
    <section className={styles.container} aria-label="Sleep & Recovery Tracker">
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <span className={styles.icon}>🌌</span>
          <div>
            <h2 className={styles.title}>Sleep & Vitality Rhythm</h2>
            <p className={styles.subtitle}>
              Attune to your circadian energy. Good teaching begins with honored rest.
            </p>
          </div>
        </div>
      </header>

      <div className={styles.card}>
        <span className={styles.cardEyebrow}>How did you wake this morning?</span>

        <div className={styles.levelSelector}>
          {QUALITY_LEVELS.map((level) => (
            <button
              key={level.value}
              type="button"
              className={`${styles.levelBtn} ${quality === level.value ? styles.levelBtnActive : ''}`}
              style={{
                borderColor: quality === level.value ? level.color : undefined,
                backgroundColor: quality === level.value ? `${level.color}15` : undefined,
              }}
              onClick={() => setQuality(level.value)}
            >
              <span className={styles.levelEmoji}>{level.emoji}</span>
              <span className={styles.levelLabel}>{level.label}</span>
            </button>
          ))}
        </div>

        <div className={styles.sliderBox}>
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
            className={styles.rangeInput}
          />
          <div
            className={styles.selectedFeedback}
            style={{ color: selectedLevel?.color ?? '#0284c7' }}
          >
            <span>{selectedLevel?.emoji ?? '✨'}</span>
            <strong>
              {selectedLevel?.label ?? 'Balanced'} ({quality}/5)
            </strong>
          </div>
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.saveBtn} onClick={handleSave} disabled={saving}>
            {saving ? 'Logging…' : saved ? '✓ Sleep Logged' : 'Log Sleep Rhythm 🪷'}
          </button>
        </div>
      </div>

      {sleepLogs.length > 0 && (
        <div className={styles.historyList}>
          <h3 className={styles.historyTitle}>Recent Sleep Log</h3>
          <div className={styles.historyGrid}>
            {sleepLogs.slice(0, 5).map((log) => {
              const meta = QUALITY_LEVELS.find((l) => l.value === log.quality) ?? QUALITY_LEVELS[2];
              return (
                <div key={log.id} className={styles.historyItem}>
                  <time className={styles.historyDate}>
                    {new Date(log.created_at).toLocaleDateString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </time>
                  <span className={styles.historyEmoji}>{meta?.emoji ?? '✨'}</span>
                  <span className={styles.historyLabel} style={{ color: meta?.color ?? '#0284c7' }}>
                    {meta?.label ?? 'Balanced'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
