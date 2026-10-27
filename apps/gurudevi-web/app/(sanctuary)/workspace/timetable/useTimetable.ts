'use client';

import { storage } from '@repo/core/lib/storage';
import { getSandboxSamples } from '@repo/core/api/sandboxDataset';
import { useCallback, useState, useSyncExternalStore } from 'react';

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;
export type Day = (typeof DAYS)[number];

export interface Period {
  number: number;
  time: string;
  subject: string;
  teacher: string;
  room: string;
  periodKind?: 'core' | 'lab' | 'assembly' | 'wellbeing';
}

export interface PrepChecklistItem {
  id: string;
  task: string;
  completed: boolean;
  category: 'materials' | 'lesson_plan' | 'attendance';
}

const PREP_STORAGE_KEY = 'gurudevi:timetable:daily_prep_items';

// Weekends have no school day, so they fall back to the start of the week.
export function schoolDayFor(date: Date): Day {
  const weekday = date.getDay();
  if (weekday < 1 || weekday > DAYS.length) return 'Monday';
  return DAYS.at(weekday - 1) ?? 'Monday';
}

function loadPrepChecklist(): readonly PrepChecklistItem[] {
  try {
    const cached = storage.getString(PREP_STORAGE_KEY);
    if (cached) return JSON.parse(cached) as PrepChecklistItem[];
  } catch {
    // Storage read fallback
  }
  const defaults = getSandboxSamples<PrepChecklistItem[]>('timetable', 'getPrepItems', [], []);
  try {
    storage.set(PREP_STORAGE_KEY, JSON.stringify(defaults));
  } catch {
    // Storage write fallback
  }
  return defaults;
}

const noSubscription = () => () => {};
const readTodaySchoolDay = (): Day => schoolDayFor(new Date());
const readServerSchoolDay = (): Day => 'Monday';

export function useTimetable() {
  const todaySchoolDay = useSyncExternalStore(
    noSubscription,
    readTodaySchoolDay,
    readServerSchoolDay,
  );

  const [chosenDay, setSelectedDay] = useState<Day | null>(null);
  const selectedDay = chosenDay ?? todaySchoolDay;

  const schedule = getSandboxSamples<Record<string, Period[]>>('timetable', 'getSchedule', [], {});
  const periods = schedule[selectedDay] || [];

  const [prepItems, setPrepItems] = useState<readonly PrepChecklistItem[]>(loadPrepChecklist);

  const togglePrepItem = useCallback((id: string) => {
    setPrepItems((current) => {
      const updated = current.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item,
      );
      try {
        storage.set(PREP_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Storage write fallback
      }
      return updated;
    });
  }, []);

  const completedCount = prepItems.filter((i) => i.completed).length;
  const prepProgressPercent =
    prepItems.length > 0 ? Math.round((completedCount / prepItems.length) * 100) : 0;

  return {
    selectedDay,
    setSelectedDay,
    periods,
    prepItems,
    togglePrepItem,
    completedCount,
    prepProgressPercent,
  };
}
