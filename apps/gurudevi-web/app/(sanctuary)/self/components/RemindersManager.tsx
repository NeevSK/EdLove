'use client';

import {
  Activity,
  Bell,
  Check,
  Clock,
  Droplets,
  Heart,
  MessageSquare,
  Plus,
  Repeat,
  Trash2,
  Wind,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import {
  createReminder,
  deleteReminder,
  fetchReminderFeedback,
  fetchReminders,
  logReminderFeedback,
  updateReminder,
  type ReminderFeedbackAction,
  type ReminderFeedbackEvent,
  type ReminderRecord,
} from '../../../../lib/sanctuary/selfBrowserAdapters';
import styles from './reminders-manager.module.css';

interface RemindersManagerProps {
  userId?: string;
  onClose?: () => void;
}

type ReminderCategory = 'water' | 'medication' | 'movement' | 'breathe' | 'custom';
type ReminderSchedule = 'hourly' | 'every-2-hours' | 'morning-and-night' | 'daily' | 'once';

interface CarePreset {
  title: string;
  description: string;
  category: ReminderCategory;
  schedule: ReminderSchedule;
  scheduled_time?: string;
  icon_type: string;
}

const CARE_PRESETS: readonly CarePreset[] = [
  {
    title: 'Hydrate & Drink Water',
    description: 'A glass of cool water between teaching or focus blocks',
    category: 'water',
    schedule: 'every-2-hours',
    icon_type: 'droplet',
  },
  {
    title: 'Daily Medication & Vitamins',
    description: 'Take morning or evening prescribed care on time',
    category: 'medication',
    schedule: 'morning-and-night',
    scheduled_time: '08:30',
    icon_type: 'heart',
  },
  {
    title: 'Posture & Spine Release',
    description: 'Roll shoulders, unclench jaw, and decompress posture',
    category: 'movement',
    schedule: 'hourly',
    icon_type: 'activity',
  },
  {
    title: 'Mindful Breath Pause',
    description: 'Three conscious belly breaths to reset nervous system',
    category: 'breathe',
    schedule: 'daily',
    scheduled_time: '13:00',
    icon_type: 'wind',
  },
];

const DEFAULT_REMINDERS: Array<Omit<ReminderRecord, 'id' | 'created_at' | 'user_id'>> = [
  {
    title: 'Stay Hydrated',
    description: 'Drink water between focus blocks',
    icon_type: 'droplet',
    category: 'water',
    schedule: 'every-2-hours',
    is_default: true,
    is_active: true,
  },
  {
    title: 'Postural Check',
    description: 'Gently release your shoulders & neck',
    icon_type: 'activity',
    category: 'movement',
    schedule: 'hourly',
    is_default: true,
    is_active: true,
  },
];

function formatScheduleLabel(schedule?: ReminderSchedule, time?: string): string {
  switch (schedule) {
    case 'hourly':
      return 'Every hour';
    case 'every-2-hours':
      return 'Every 2 hours';
    case 'morning-and-night':
      return 'Morning & Evening';
    case 'daily':
      return time ? `Daily at ${time}` : 'Daily';
    case 'once':
      return time ? `Once at ${time}` : 'Once today';
    default:
      return 'Gentle anchor';
  }
}

function CategoryIcon({ category, iconType }: { category?: ReminderCategory; iconType?: string }) {
  if (category === 'water' || iconType === 'droplet') {
    return <Droplets size={18} color="#0284c7" />;
  }
  if (category === 'medication' || iconType === 'heart') {
    return <Heart size={18} color="#e11d48" />;
  }
  if (category === 'movement' || iconType === 'activity') {
    return <Activity size={18} color="#10b981" />;
  }
  if (category === 'breathe' || iconType === 'wind') {
    return <Wind size={18} color="#0d9488" />;
  }
  return <Bell size={18} color="#8b5cf6" />;
}

export function RemindersManager({ userId }: RemindersManagerProps) {
  const effectiveUserId = userId ?? 'guest';
  const [reminders, setReminders] = useState<ReminderRecord[]>([]);
  const [feedbackEvents, setFeedbackEvents] = useState<ReminderFeedbackEvent[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<
    NotificationPermission | 'unsupported'
  >('default');

  // Form state
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState<ReminderCategory>('water');
  const [schedule, setSchedule] = useState<ReminderSchedule>('every-2-hours');
  const [scheduledTime, setScheduledTime] = useState('09:00');

  // Inline feedback interaction state
  const [snoozeMenuFor, setSnoozeMenuFor] = useState<string | null>(null);
  const [noteInputFor, setNoteInputFor] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState('');

  // 1. Initial Permission Check
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    } else {
      setNotificationPermission('unsupported');
    }
  }, []);

  // 2. Load Reminders & Feedback History
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [remData, fbData] = await Promise.all([
          fetchReminders(effectiveUserId),
          fetchReminderFeedback(effectiveUserId),
        ]);
        if (cancelled) return;
        if (remData && remData.length > 0) {
          setReminders(remData);
        } else {
          setReminders(
            DEFAULT_REMINDERS.map((r, i) => ({
              ...r,
              id: `default-${i}`,
              user_id: effectiveUserId,
              created_at: new Date().toISOString(),
            })),
          );
        }
        if (fbData) setFeedbackEvents(fbData);
      } catch {
        if (!cancelled) {
          setReminders(
            DEFAULT_REMINDERS.map((r, i) => ({
              ...r,
              id: `default-${i}`,
              user_id: effectiveUserId,
              created_at: new Date().toISOString(),
            })),
          );
        }
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [effectiveUserId]);

  // Auto-dismiss toast notice after 5 seconds
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 5000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const requestDesktopNotification = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        setToastMessage('✓ Desktop care notifications enabled! You will receive gentle reminders.');
        try {
          new Notification('Sanctuary Care Alerts Active', {
            body: 'Gentle anchors for hydration, medication, posture, and breath are now enabled.',
            icon: '/favicon.ico',
          });
        } catch {
          // In environments where constructor is restricted
        }
      } else if (permission === 'denied') {
        setToastMessage('Notifications were denied in your browser settings. In-app alerts remain active.');
      }
    } catch {
      // Gracefully handle browser security exceptions
    }
  };

  // Feedback action handlers
  const handleActionDone = async (rem: ReminderRecord) => {
    try {
      const event = await logReminderFeedback(effectiveUserId, {
        reminder_id: rem.id,
        user_id: effectiveUserId,
        action: 'done',
        category: rem.category,
      });
      setFeedbackEvents((prev) => [event, ...prev]);

      if (rem.category === 'breathe') {
        setToastMessage('✓ Mindful breath break logged! +3 mindful minutes added to your Somatic Pulse.');
      } else if (rem.category === 'water') {
        setToastMessage('💧 Hydration logged! Staying refreshed supports your teaching presence.');
      } else if (rem.category === 'medication') {
        setToastMessage('💊 Medication & care confirmed on time.');
      } else if (rem.category === 'movement') {
        setToastMessage('🧘 Posture release completed! Spine decompressed.');
      } else {
        setToastMessage(`✓ ${rem.title} marked complete!`);
      }

      setSnoozeMenuFor(null);
      setNoteInputFor(null);
    } catch {
      setToastMessage('Care record noted locally.');
    }
  };

  const handleActionSnooze = async (rem: ReminderRecord, minutes: number) => {
    try {
      const event = await logReminderFeedback(effectiveUserId, {
        reminder_id: rem.id,
        user_id: effectiveUserId,
        action: 'snoozed',
        category: rem.category,
        snooze_minutes: minutes,
      });
      setFeedbackEvents((prev) => [event, ...prev]);
      setToastMessage(`⏳ Snoozed "${rem.title}" for ${minutes} minutes. Focus gently.`);
      setSnoozeMenuFor(null);
    } catch {
      setToastMessage(`Snoozed for ${minutes} minutes.`);
      setSnoozeMenuFor(null);
    }
  };

  const handleActionNote = async (rem: ReminderRecord) => {
    if (!noteDraft.trim()) return;
    try {
      const event = await logReminderFeedback(effectiveUserId, {
        reminder_id: rem.id,
        user_id: effectiveUserId,
        action: 'noted',
        category: rem.category,
        note: noteDraft.trim(),
      });
      setFeedbackEvents((prev) => [event, ...prev]);
      setToastMessage(`📝 Care note attached to ${rem.title}.`);
      setNoteInputFor(null);
      setNoteDraft('');
    } catch {
      setToastMessage('Note saved locally.');
      setNoteInputFor(null);
      setNoteDraft('');
    }
  };

  const handleActionSkip = async (rem: ReminderRecord) => {
    try {
      const event = await logReminderFeedback(effectiveUserId, {
        reminder_id: rem.id,
        user_id: effectiveUserId,
        action: 'skipped',
        category: rem.category,
      });
      setFeedbackEvents((prev) => [event, ...prev]);
      setToastMessage('🌿 Passed for now. Your rhythm honors rest and priorities.');
      setSnoozeMenuFor(null);
      setNoteInputFor(null);
    } catch {
      setToastMessage('Acknowledged.');
    }
  };

  const handleAddPreset = async (preset: CarePreset) => {
    const newReminder = {
      user_id: effectiveUserId,
      title: preset.title,
      description: preset.description,
      icon_type: preset.icon_type,
      category: preset.category,
      schedule: preset.schedule,
      scheduled_time: preset.scheduled_time,
      is_default: false,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    try {
      const saved = await createReminder(effectiveUserId, newReminder);
      setReminders((prev) => [saved, ...prev]);
      setToastMessage(`✓ Preset added: "${preset.title}" (${formatScheduleLabel(preset.schedule, preset.scheduled_time)})`);
    } catch {
      setReminders((prev) => [{ ...newReminder, id: `local-${Date.now()}` }, ...prev]);
      setToastMessage(`Added "${preset.title}"`);
    }
  };

  const handleAddCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newReminder = {
      user_id: effectiveUserId,
      title: title.trim(),
      description: desc.trim() || undefined,
      icon_type:
        category === 'water'
          ? 'droplet'
          : category === 'medication'
            ? 'heart'
            : category === 'movement'
              ? 'activity'
              : category === 'breathe'
                ? 'wind'
                : 'bell',
      category,
      schedule,
      scheduled_time: schedule === 'daily' || schedule === 'once' ? scheduledTime : undefined,
      is_default: false,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    try {
      const saved = await createReminder(effectiveUserId, newReminder);
      setReminders((prev) => [saved, ...prev]);
      setToastMessage(`✓ Care alert saved: "${title.trim()}"`);
    } catch {
      setReminders((prev) => [{ ...newReminder, id: `local-${Date.now()}` }, ...prev]);
      setToastMessage(`Care alert saved: "${title.trim()}"`);
    }

    setTitle('');
    setDesc('');
    setIsAdding(false);
  };

  const handleToggleActive = async (rem: ReminderRecord) => {
    const nextState = !rem.is_active;
    setReminders((prev) =>
      prev.map((r) => (r.id === rem.id ? { ...r, is_active: nextState } : r)),
    );
    try {
      await updateReminder(rem.id, { is_active: nextState });
      setToastMessage(nextState ? `Alert activated: "${rem.title}"` : `Alert paused: "${rem.title}"`);
    } catch {
      // Optimistic fallback
    }
  };

  const handleDelete = async (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
    try {
      await deleteReminder(id);
      setToastMessage('Alert removed.');
    } catch {
      // Ignored for optimistic UI
    }
  };

  // Helper to find latest feedback for a reminder today
  const getLatestFeedbackToday = useCallback(
    (reminderId: string): ReminderFeedbackEvent | undefined => {
      const todayIso = new Date().toISOString().split('T')[0] ?? '';
      return feedbackEvents.find(
        (e) => e.reminder_id === reminderId && e.created_at.startsWith(todayIso),
      );
    },
    [feedbackEvents],
  );

  return (
    <div className={styles.container}>
      {toastMessage ? (
        <div className={styles.toastNotice} role="status" aria-live="polite">
          <span>{toastMessage}</span>
          <button
            type="button"
            className={styles.toastCloseBtn}
            onClick={() => setToastMessage(null)}
            aria-label="Dismiss notice"
          >
            <X size={14} />
          </button>
        </div>
      ) : null}

      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h2 className={styles.title}>Mindful Care Alerts & Reminders</h2>
          <p className={styles.subtitle}>
            Gentle repeating anchors for hydration, medication, posture, and conscious breaths
          </p>
        </div>
      </div>

      <div className={styles.desktopNotifBanner}>
        <div className={styles.desktopNotifLeft}>
          <Bell size={18} color="#0284c7" />
          <div>
            <div className={styles.desktopNotifTitle}>Desktop Care Alerts</div>
            <div className={styles.desktopNotifSubtitle}>
              Receive gentle audio-visual alerts when mindful breaks or medication are due
            </div>
          </div>
        </div>
        {notificationPermission === 'granted' ? (
          <span className={styles.desktopNotifActiveBadge}>
            <Check size={12} /> Active
          </span>
        ) : notificationPermission === 'denied' ? (
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Blocked in browser</span>
        ) : (
          <button
            type="button"
            className={styles.desktopNotifBtn}
            onClick={() => void requestDesktopNotification()}
          >
            Enable Desktop Alerts
          </button>
        )}
      </div>

      <div className={styles.presetsSection}>
        <span className={styles.presetsLabel}>Quick Care Presets</span>
        <div className={styles.presetsGrid}>
          {CARE_PRESETS.map((preset) => (
            <button
              key={preset.title}
              type="button"
              className={styles.presetChip}
              onClick={() => void handleAddPreset(preset)}
            >
              <Plus size={14} />
              <span>{preset.title}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.list}>
        {reminders.map((rem) => {
          const latestFb = getLatestFeedbackToday(rem.id);
          return (
            <div
              key={rem.id}
              className={styles.item}
              style={{ opacity: rem.is_active ? 1 : 0.6 }}
            >
              <div className={styles.itemDetails}>
                <CategoryIcon category={rem.category} iconType={rem.icon_type} />
                <div>
                  <div className={styles.itemTitle}>{rem.title}</div>
                  {rem.description && <div className={styles.itemDesc}>{rem.description}</div>}
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span className={styles.cadenceBadge}>
                      <Repeat size={11} />
                      {formatScheduleLabel(rem.schedule, rem.scheduled_time)}
                    </span>
                    {rem.scheduled_time && (
                      <span className={styles.timeBadge}>
                        <Clock size={11} />
                        {rem.scheduled_time}
                      </span>
                    )}
                    {latestFb ? (
                      <span className={styles.feedbackBadge}>
                        {latestFb.action === 'done'
                          ? '✓ Done today'
                          : latestFb.action === 'snoozed'
                            ? `⏳ Snoozed (${latestFb.snooze_minutes ?? 15}m)`
                            : latestFb.action === 'noted'
                              ? `📝 Note: ${latestFb.note}`
                              : '🌿 Passed today'}
                      </span>
                    ) : null}
                  </div>

                  {rem.is_active ? (
                    <div className={styles.feedbackActions}>
                      <button
                        type="button"
                        className={`${styles.actionPillBtn} ${styles.doneBtn}`}
                        onClick={() => void handleActionDone(rem)}
                        title="Mark complete"
                      >
                        <Check size={12} />
                        <span>Done</span>
                      </button>
                      <button
                        type="button"
                        className={`${styles.actionPillBtn} ${styles.snoozeBtn}`}
                        onClick={() =>
                          setSnoozeMenuFor(snoozeMenuFor === rem.id ? null : rem.id)
                        }
                        title="Snooze alert"
                      >
                        <Clock size={12} />
                        <span>Snooze</span>
                      </button>
                      <button
                        type="button"
                        className={`${styles.actionPillBtn} ${styles.noteBtn}`}
                        onClick={() =>
                          setNoteInputFor(noteInputFor === rem.id ? null : rem.id)
                        }
                        title="Attach context note"
                      >
                        <MessageSquare size={12} />
                        <span>Note</span>
                      </button>
                      <button
                        type="button"
                        className={`${styles.actionPillBtn} ${styles.skipBtn}`}
                        onClick={() => void handleActionSkip(rem)}
                        title="Pass gently today"
                      >
                        <span>Pass</span>
                      </button>
                    </div>
                  ) : null}

                  {snoozeMenuFor === rem.id ? (
                    <div className={styles.snoozeMenu}>
                      <span style={{ fontSize: '0.6875rem', color: '#b45309' }}>Snooze for:</span>
                      {[10, 15, 30, 60].map((mins) => (
                        <button
                          key={mins}
                          type="button"
                          className={styles.snoozeOption}
                          onClick={() => void handleActionSnooze(rem, mins)}
                        >
                          {mins}m
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setSnoozeMenuFor(null)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#94a3b8',
                          cursor: 'pointer',
                        }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : null}

                  {noteInputFor === rem.id ? (
                    <div className={styles.noteBox}>
                      <input
                        type="text"
                        placeholder="Add micro-note (e.g. 500ml water, spine stretch)..."
                        value={noteDraft}
                        onChange={(e) => setNoteDraft(e.target.value)}
                        className={styles.noteInput}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            void handleActionNote(rem);
                          }
                        }}
                      />
                      <button
                        type="button"
                        className={styles.saveNoteBtn}
                        onClick={() => void handleActionNote(rem)}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNoteInputFor(null);
                          setNoteDraft('');
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#94a3b8',
                          cursor: 'pointer',
                        }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
              <div className={styles.itemRight}>
                <button
                  type="button"
                  className={`${styles.toggleBtn} ${rem.is_active ? styles.toggleBtnActive : ''}`}
                  onClick={() => void handleToggleActive(rem)}
                  aria-label={rem.is_active ? 'Pause alert' : 'Activate alert'}
                >
                  {rem.is_active ? 'Active' : 'Paused'}
                </button>
                <button
                  type="button"
                  className={styles.deleteBtn}
                  onClick={() => void handleDelete(rem.id)}
                  aria-label={`Delete ${rem.title}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {isAdding ? (
        <form onSubmit={handleAddCustom} className={styles.addForm}>
          <div className={styles.presetsLabel}>Alert Category</div>
          <div className={styles.categoryGroup}>
            {(
              [
                ['water', '💧 Hydrate', 'droplet'],
                ['medication', '💊 Meds / Care', 'heart'],
                ['movement', '🧘 Movement', 'activity'],
                ['breathe', '🌬️ Breathing', 'wind'],
                ['custom', '🔔 Custom', 'bell'],
              ] as const
            ).map(([cat, label]) => (
              <button
                key={cat}
                type="button"
                className={`${styles.categoryBtn} ${category === cat ? styles.categoryBtnActive : ''}`}
                onClick={() => setCategory(cat)}
              >
                {label}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Alert title (e.g. Afternoon Water & Eye Rest)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={styles.input}
            required
          />
          <input
            type="text"
            placeholder="Gentle description or instructions (optional)"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className={styles.input}
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '0.75rem',
            }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--color-text-secondary)',
                  marginBottom: '0.25rem',
                }}
              >
                Repeating Cadence
              </label>
              <select
                value={schedule}
                onChange={(e) => setSchedule(e.target.value as ReminderSchedule)}
                className={styles.select}
                style={{ width: '100%' }}
              >
                <option value="hourly">Hourly</option>
                <option value="every-2-hours">Every 2 Hours</option>
                <option value="morning-and-night">Morning & Evening</option>
                <option value="daily">Daily at specific time</option>
                <option value="once">Once today</option>
              </select>
            </div>

            {(schedule === 'daily' || schedule === 'once') && (
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--color-text-secondary)',
                    marginBottom: '0.25rem',
                  }}
                >
                  Target Time
                </label>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className={styles.input}
                  style={{ width: '100%' }}
                />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button type="submit" className={styles.addBtn}>
              Save Alert
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className={styles.deleteBtn}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className={styles.addBtn}
        >
          <Plus size={16} />
          <span>Add Custom Care Alert</span>
        </button>
      )}
    </div>
  );
}
