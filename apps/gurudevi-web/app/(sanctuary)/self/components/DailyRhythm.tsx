'use client';

import { useTimetable } from '@repo/self/hooks/useTimetable';
import type { Period } from '@repo/self/types';
import { Calendar, Clock, MapPin, Plus, Trash2 } from '@repo/ui/icons';
import { useState } from 'react';
import styles from './daily-rhythm.module.css';

interface DailyRhythmProps {
  userId?: string;
  onClose?: () => void;
}

const DAYS = [
  { id: 1, label: 'Mon' },
  { id: 2, label: 'Tue' },
  { id: 3, label: 'Wed' },
  { id: 4, label: 'Thu' },
  { id: 5, label: 'Fri' },
];

const PERIOD_TYPES: Array<{ value: Period['type']; label: string }> = [
  { value: 'subject', label: 'Standard Focus' },
  { value: 'relief', label: 'Relief Period' },
  { value: 'interval', label: 'Interval & Renewal' },
];

export function DailyRhythm({ userId, onClose }: DailyRhythmProps) {
  const [activeDay, setActiveDay] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  // Form State
  const [subject, setSubject] = useState('');
  const [className, setClassName] = useState('');
  const [type, setType] = useState<Period['type']>('subject');
  const [startTime, setStartTime] = useState('08:30');
  const [endTime, setEndTime] = useState('09:30');

  const { periods, loading, addPeriod, deletePeriod } = useTimetable(activeDay);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;

    await addPeriod({
      day_of_week: activeDay,
      period_number: periods.length + 1,
      subject: subject.trim(),
      class_name: className.trim() || undefined,
      type,
      start_time: startTime,
      end_time: endTime,
    });

    setSubject('');
    setClassName('');
    setIsAdding(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h2 className={styles.title}>Daily Rhythm & Timetable</h2>
          <p className={styles.subtitle}>Curate your focus slots, classroom duties, and renewal periods</p>
        </div>
        <div className={styles.dayTabs}>
          {DAYS.map((day) => (
            <button
              key={day.id}
              type="button"
              className={`${styles.dayTab} ${activeDay === day.id ? styles.dayTabActive : ''}`}
              onClick={() => setActiveDay(day.id)}
            >
              {day.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.periodList}>
        {loading ? (
          <div className={styles.emptyState}>Loading rhythm periods...</div>
        ) : periods.length === 0 ? (
          <div className={styles.emptyState}>
            <Calendar size={32} />
            <p>No periods scheduled for this day yet.</p>
          </div>
        ) : (
          periods.map((period) => (
            <div key={period.id} className={styles.periodCard}>
              <div className={styles.periodMeta}>
                <div className={styles.periodTime}>
                  <Clock size={13} />
                  <span>{period.start_time || '08:30'} - {period.end_time || '09:30'}</span>
                </div>
                <div className={styles.periodDetails}>
                  <span className={styles.periodSubject}>{period.subject}</span>
                  {period.class_name && (
                    <span className={styles.periodRoom}>
                      <MapPin size={11} />
                      {period.class_name}
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                className={styles.deleteBtn}
                onClick={() => deletePeriod(period.id)}
                aria-label={`Delete ${period.subject}`}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>

      {isAdding ? (
        <form onSubmit={handleAdd} className={styles.addForm}>
          <div className={styles.formRow}>
            <input
              type="text"
              placeholder="Subject / Activity"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className={styles.formInput}
              required
            />
            <input
              type="text"
              placeholder="Room / Class Name"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className={styles.formInput}
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value as Period['type'])}
              className={styles.formSelect}
            >
              {PERIOD_TYPES.map((pt) => (
                <option key={pt.value} value={pt.value}>
                  {pt.label}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.formRow}>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className={styles.formInput}
            />
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className={styles.formInput}
            />
          </div>
          <div className={styles.actionRow}>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className={styles.cancelBtn}
            >
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn}>
              Save Period
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className={styles.submitBtn}
          style={{ alignSelf: 'flex-start' }}
        >
          <Plus size={16} />
          <span>Add Rhythm Period</span>
        </button>
      )}
    </div>
  );
}
