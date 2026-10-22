'use client';

import {
  createReminder,
  deleteReminder,
  fetchReminders,
  type ReminderRecord,
} from '@repo/self/api/selfFeatureRepository';
import { Bell, Droplets, Plus, Trash2 } from '@repo/ui/icons';
import { useEffect, useState } from 'react';
import styles from './reminders-manager.module.css';

interface RemindersManagerProps {
  userId?: string;
  onClose?: () => void;
}

const DEFAULT_REMINDERS: Array<Omit<ReminderRecord, 'id' | 'created_at' | 'user_id'>> = [
  { title: 'Stay Hydrated', description: 'Drink water between focus blocks', icon_type: 'droplet', is_default: true, is_active: true },
  { title: 'Postural Check', description: 'Gently release your shoulders & neck', icon_type: 'bell', is_default: true, is_active: true },
];

export function RemindersManager({ userId }: RemindersManagerProps) {
  const [reminders, setReminders] = useState<ReminderRecord[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await fetchReminders(userId ?? 'guest');
        if (!cancelled && data && data.length > 0) {
          setReminders(data);
        } else if (!cancelled) {
          setReminders(
            DEFAULT_REMINDERS.map((r, i) => ({
              ...r,
              id: `default-${i}`,
              user_id: userId ?? 'guest',
              created_at: new Date().toISOString(),
            })),
          );
        }
      } catch {
        if (!cancelled) {
          setReminders(
            DEFAULT_REMINDERS.map((r, i) => ({
              ...r,
              id: `default-${i}`,
              user_id: userId ?? 'guest',
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
  }, [userId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newReminder = {
      user_id: userId ?? 'guest',
      title: title.trim(),
      description: desc.trim() || undefined,
      icon_type: 'bell',
      is_default: false,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    try {
      const saved = await createReminder(userId ?? 'guest', newReminder);
      setReminders((prev) => [...prev, saved]);
    } catch {
      setReminders((prev) => [...prev, { ...newReminder, id: `local-${Date.now()}` }]);
    }

    setTitle('');
    setDesc('');
    setIsAdding(false);
  };

  const handleDelete = async (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
    try {
      await deleteReminder(id);
    } catch {
      // Ignored for optimistic UI
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h2 className={styles.title}>Mindful Reminders</h2>
          <p className={styles.subtitle}>Gentle anchors throughout your teaching and learning day</p>
        </div>
      </div>

      <div className={styles.list}>
        {reminders.map((rem) => (
          <div key={rem.id} className={styles.item}>
            <div className={styles.itemDetails}>
              {rem.icon_type === 'droplet' ? <Droplets size={18} color="#0284c7" /> : <Bell size={18} color="#8b5cf6" />}
              <div>
                <div className={styles.itemTitle}>{rem.title}</div>
                {rem.description && <div className={styles.itemDesc}>{rem.description}</div>}
              </div>
            </div>
            <button
              type="button"
              className={styles.deleteBtn}
              onClick={() => handleDelete(rem.id)}
              aria-label={`Delete ${rem.title}`}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {isAdding ? (
        <form onSubmit={handleAdd} className={styles.addForm}>
          <input
            type="text"
            placeholder="Reminder title (e.g. 5-minute eye rest)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={styles.input}
            required
          />
          <input
            type="text"
            placeholder="Description / Context (optional)"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className={styles.input}
          />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" className={styles.addBtn}>
              Save Reminder
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
          <span>Add Custom Reminder</span>
        </button>
      )}
    </div>
  );
}
