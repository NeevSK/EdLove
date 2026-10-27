'use client';

import { Activity, Bell, Check, Clock, Droplets, Heart, Sparkles, Wind } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { playSingingBowlChime } from '../../../../lib/sanctuary/audioSanctuary';
import {
  fetchReminderFeedback,
  fetchReminders,
  logReminderFeedback,
  type ReminderFeedbackEvent,
  type ReminderRecord,
} from '../../../../lib/sanctuary/selfBrowserAdapters';
import styles from './dynamic-care-island.module.css';

interface DynamicCareIslandProps {
  userId?: string;
  onOpenReminders?: () => void;
}

export function DynamicCareIsland({ userId, onOpenReminders }: DynamicCareIslandProps) {
  const effectiveUserId = userId ?? 'guest';
  const [reminders, setReminders] = useState<ReminderRecord[]>([]);
  const [feedbackEvents, setFeedbackEvents] = useState<ReminderFeedbackEvent[]>([]);
  const [activeAlert, setActiveAlert] = useState<ReminderRecord | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [rems, fb] = await Promise.all([
        fetchReminders(effectiveUserId),
        fetchReminderFeedback(effectiveUserId),
      ]);
      setReminders(rems || []);
      setFeedbackEvents(fb || []);
    } catch {
      // Ignored
    }
  }, [effectiveUserId]);

  useEffect(() => {
    void loadData();
    const interval = setInterval(() => {
      void loadData();
    }, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [loadData]);

  // Determine current active due alert
  useEffect(() => {
    const todayIso = new Date().toISOString().split('T')[0] ?? '';
    const active = reminders.filter((r) => r.is_active);
    if (active.length === 0) {
      setActiveAlert(null);
      return;
    }

    // Find the first active reminder that has NOT been done or snoozed recently today
    const now = Date.now();
    const pending = active.find((rem) => {
      const fb = feedbackEvents.find(
        (e) => e.reminder_id === rem.id && e.created_at.startsWith(todayIso),
      );
      if (!fb) return true;
      if (fb.action === 'snoozed' && fb.snooze_minutes) {
        const snoozeExpiry = new Date(fb.created_at).getTime() + fb.snooze_minutes * 60 * 1000;
        return now >= snoozeExpiry;
      }
      return false;
    });

    setActiveAlert(pending || null);
  }, [reminders, feedbackEvents]);

  const handleDone = async () => {
    if (!activeAlert) return;
    try {
      playSingingBowlChime(528); // Resonant 528Hz heart chime
      await logReminderFeedback(effectiveUserId, {
        reminder_id: activeAlert.id,
        user_id: effectiveUserId,
        action: 'done',
        category: activeAlert.category,
      });
      await loadData();
    } catch {
      // Fallback
    }
  };

  const handleSnooze = async () => {
    if (!activeAlert) return;
    try {
      await logReminderFeedback(effectiveUserId, {
        reminder_id: activeAlert.id,
        user_id: effectiveUserId,
        action: 'snoozed',
        category: activeAlert.category,
        snooze_minutes: 15,
      });
      await loadData();
    } catch {
      // Fallback
    }
  };

  const handlePass = async () => {
    if (!activeAlert) return;
    try {
      await logReminderFeedback(effectiveUserId, {
        reminder_id: activeAlert.id,
        user_id: effectiveUserId,
        action: 'skipped',
        category: activeAlert.category,
      });
      await loadData();
    } catch {
      // Fallback
    }
  };

  if (!activeAlert) {
    return (
      <div
        className={`${styles.island} ${styles.islandSerene}`}
        role="button"
        tabIndex={0}
        onClick={onOpenReminders}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onOpenReminders?.();
        }}
        title="View Mindful Care Anchors"
      >
        <div className={styles.iconWrap} style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
          <Sparkles size={13} color="#059669" />
        </div>
        <span className={styles.sereneText}>Care anchors steady</span>
      </div>
    );
  }

  const category = activeAlert.category;
  return (
    <div
      className={styles.island}
      role="region"
      aria-label={`Due care reminder: ${activeAlert.title}`}
    >
      <div
        className={styles.iconWrap}
        style={{
          background:
            category === 'water'
              ? 'rgba(2, 132, 199, 0.12)'
              : category === 'breathe'
                ? 'rgba(13, 148, 136, 0.12)'
                : category === 'medication'
                  ? 'rgba(225, 29, 72, 0.12)'
                  : 'rgba(16, 185, 129, 0.12)',
        }}
      >
        {category === 'water' ? (
          <Droplets size={13} color="#0284c7" />
        ) : category === 'breathe' ? (
          <Wind size={13} color="#0d9488" />
        ) : category === 'medication' ? (
          <Heart size={13} color="#e11d48" />
        ) : (
          <Activity size={13} color="#10b981" />
        )}
      </div>

      <span className={styles.title}>{activeAlert.title}</span>

      <div className={styles.actions}>
        <button
          type="button"
          className={`${styles.btn} ${styles.doneBtn}`}
          onClick={() => void handleDone()}
          title="Mark complete"
        >
          <Check size={11} />
          <span>Done</span>
        </button>
        <button
          type="button"
          className={`${styles.btn} ${styles.snoozeBtn}`}
          onClick={() => void handleSnooze()}
          title="Snooze for 15 minutes"
        >
          <Clock size={11} />
          <span>15m</span>
        </button>
        <button
          type="button"
          className={`${styles.btn} ${styles.passBtn}`}
          onClick={() => void handlePass()}
          title="Pass gently for now"
        >
          <span>✕</span>
        </button>
      </div>
    </div>
  );
}
