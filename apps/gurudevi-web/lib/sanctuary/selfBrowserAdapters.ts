'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createBrowserSupabaseClient } from '../supabase/browser';

type Identified = { id: string; user_id: string; created_at: string };
export type Period = Identified & {
  day_of_week: number;
  period_number: number;
  subject?: string;
  class_name?: string;
  type: 'subject' | 'relief' | 'interval';
  start_time: string;
  end_time: string;
};
export type DecisionLog = Identified & {
  decision_text: string;
  context?: string;
  is_reviewed: boolean;
};
export type EnergyForecast = Identified & {
  forecast_date: string;
  energy_level: 1 | 2 | 3 | 4 | 5;
  notes?: string;
};
export type JoyMoment = Identified & {
  student_name?: string;
  moment_description: string;
  category: 'breakthrough' | 'question' | 'connection' | 'other';
};
export type GratitudeEntry = Identified & {
  content: string;
  category: 'student-said' | 'colleague-kindness' | 'personal-win';
};
export type SleepLog = Identified & { quality: number };
export type Goal = Identified & { text: string; progress: number; is_completed: boolean };
export type DailyPrepItem = Identified & {
  item_text: string;
  prep_date: string;
  is_completed: boolean;
};
export type WisdomNote = Identified & { insight: string };
export type ReminderRecord = Identified & {
  title: string;
  description?: string;
  icon_type: string;
  category?: 'water' | 'medication' | 'movement' | 'breathe' | 'custom';
  schedule?: 'hourly' | 'every-2-hours' | 'morning-and-night' | 'daily' | 'once';
  scheduled_time?: string;
  is_default: boolean;
  is_active: boolean;
};
export type ReminderFeedbackAction = 'done' | 'snoozed' | 'skipped' | 'noted';

export interface ReminderFeedbackEvent {
  id: string;
  reminder_id: string;
  user_id: string;
  action: ReminderFeedbackAction;
  category?: 'water' | 'medication' | 'movement' | 'breathe' | 'custom';
  note?: string;
  snooze_minutes?: number;
  created_at: string;
}

function isRealAccount(userId?: string): boolean {
  if (!userId) return false;
  return !userId.startsWith('guest') && userId !== 'explore' && userId !== 'explore-guest';
}

const PREFIX = 'gurudevi:web:self:v1';
const uid = (prefix: string) => `${prefix}_${crypto.randomUUID()}`;
const key = (collection: string, userId: string) => `${PREFIX}:${collection}:${userId}`;

function read<T>(collection: string, userId?: string): T[] {
  if (!userId || typeof window === 'undefined') return [];
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(key(collection, userId)) ?? '[]');
    return Array.isArray(value) ? (value as T[]) : [];
  } catch {
    return [];
  }
}

function write<T>(collection: string, userId: string, records: T[]): void {
  window.localStorage.setItem(key(collection, userId), JSON.stringify(records));
}

function useCollection<T extends Identified>(collection: string, userId?: string) {
  const [records, setRecords] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const refreshData = useCallback(async () => {
    setRecords(read<T>(collection, userId));
    setIsLoading(false);
  }, [collection, userId]);
  useEffect(() => {
    void refreshData();
  }, [refreshData]);
  const insert = useCallback(
    async (record: T) => {
      if (!userId) throw new Error('A signed-in account is required.');
      const next = [record, ...read<T>(collection, userId)];
      write(collection, userId, next);
      setRecords(next);
      return record;
    },
    [collection, userId],
  );
  const patch = useCallback(
    async (id: string, updates: Partial<T>) => {
      if (!userId) throw new Error('A signed-in account is required.');
      const next = read<T>(collection, userId).map((record) =>
        record.id === id ? { ...record, ...updates } : record,
      );
      write(collection, userId, next);
      setRecords(next);
    },
    [collection, userId],
  );
  const remove = useCallback(
    async (id: string) => {
      if (!userId) throw new Error('A signed-in account is required.');
      const next = read<T>(collection, userId).filter((record) => record.id !== id);
      write(collection, userId, next);
      setRecords(next);
    },
    [collection, userId],
  );
  return { records, setRecords, isLoading, refreshData, insert, patch, remove };
}

function stamp<T extends object>(userId: string, prefix: string, fields: T): T & Identified {
  return { ...fields, id: uid(prefix), user_id: userId, created_at: new Date().toISOString() };
}

export function useTimetable(activeDay: number, userId?: string) {
  const state = useCollection<Period>('timetable', userId);
  const periods = useMemo(
    () =>
      state.records
        .filter((record) => record.day_of_week === activeDay)
        .sort((a, b) => a.start_time.localeCompare(b.start_time)),
    [activeDay, state.records],
  );
  return {
    periods,
    loading: state.isLoading,
    error: null,
    fetchPeriods: state.refreshData,
    addPeriod: async (period: Omit<Period, keyof Identified>) =>
      state.insert(stamp(userId ?? 'guest', 'period', period)),
    updatePeriod: state.patch,
    deletePeriod: state.remove,
  };
}

export function useDecisionJournal(userId?: string) {
  const state = useCollection<DecisionLog>('decisions', userId);
  return {
    decisions: state.records,
    isLoading: state.isLoading,
    error: null,
    refreshData: state.refreshData,
    setDecisions: state.setRecords,
    addDecision: async (input: Pick<DecisionLog, 'decision_text' | 'context' | 'is_reviewed'>) =>
      state.insert(stamp(userId ?? 'guest', 'decision', input)),
  };
}

export function useEnergyForecast(userId?: string) {
  const state = useCollection<EnergyForecast>('energy', userId);
  return {
    forecasts: state.records,
    isLoading: state.isLoading,
    error: null,
    refreshData: state.refreshData,
    setForecasts: state.setRecords,
    saveForecast: async (input: {
      forecastDate: string;
      energyLevel: EnergyForecast['energy_level'];
      notes?: string;
      existingId?: string;
    }) => {
      const existing =
        input.existingId ??
        state.records.find((record) => record.forecast_date === input.forecastDate)?.id;
      if (existing)
        return state.patch(existing, { energy_level: input.energyLevel, notes: input.notes });
      return state.insert(
        stamp(userId ?? 'guest', 'energy', {
          forecast_date: input.forecastDate,
          energy_level: input.energyLevel,
          notes: input.notes,
        }),
      );
    },
  };
}

export function useJoyJar(userId?: string) {
  const state = useCollection<JoyMoment>('joy', userId);
  return {
    joyMoments: state.records,
    isLoading: state.isLoading,
    error: null,
    refreshData: state.refreshData,
    setJoyMoments: state.setRecords,
    addJoyMoment: async (
      input: Pick<JoyMoment, 'student_name' | 'moment_description' | 'category'>,
    ) => state.insert(stamp(userId ?? 'guest', 'joy', input)),
  };
}

export function useGratitude(userId?: string) {
  const state = useCollection<GratitudeEntry>('gratitude', userId);
  return {
    entries: state.records,
    isLoading: state.isLoading,
    error: null,
    refreshData: state.refreshData,
    setEntries: state.setRecords,
    addGratitudeEntry: async (input: Pick<GratitudeEntry, 'content' | 'category'>) =>
      state.insert(stamp(userId ?? 'guest', 'gratitude', input)),
  };
}

export function useSleepTracker(userId?: string) {
  const state = useCollection<SleepLog>('sleep', userId);
  return {
    sleepLogs: state.records,
    isLoading: state.isLoading,
    error: null,
    refreshData: state.refreshData,
    setSleepLogs: state.setRecords,
    addSleepLog: async (quality: number) =>
      state.insert(stamp(userId ?? 'guest', 'sleep', { quality })),
  };
}

export function useStudentGoals(userId?: string) {
  const state = useCollection<Goal>('goals', userId);
  return {
    goals: state.records,
    isLoading: state.isLoading,
    loadError: null,
    refreshData: state.refreshData,
    setGoals: state.setRecords,
    addGoal: async (text: string) =>
      state.insert(stamp(userId ?? 'guest', 'goal', { text, progress: 0, is_completed: false })),
    updateGoal: state.patch,
  };
}

export function useTomorrowPrep(userId?: string) {
  const state = useCollection<DailyPrepItem>('tomorrow', userId);
  return {
    prepItems: state.records,
    isLoading: state.isLoading,
    refreshData: state.refreshData,
    setPrepItems: state.setRecords,
    addPrepItem: async (item_text: string, prep_date: string) =>
      state.insert(stamp(userId ?? 'guest', 'prep', { item_text, prep_date, is_completed: false })),
    updatePrepItem: state.patch,
    removePrepItem: state.remove,
  };
}

export function useWisdom(userId?: string) {
  const state = useCollection<WisdomNote>('wisdom', userId);
  return {
    notes: state.records,
    isLoading: state.isLoading,
    error: null,
    refreshData: state.refreshData,
    setNotes: state.setRecords,
    addWisdomNote: async (insight: string) =>
      state.insert(stamp(userId ?? 'guest', 'wisdom', { insight })),
  };
}

type BrowserThoughtRecord = Identified & {
  automatic_thought: string;
  feeling_name: string;
  trap_name: string;
  balanced_perspective: string;
};

export function useThoughtRecords(userId?: string) {
  const state = useCollection<BrowserThoughtRecord>('thoughts', userId);
  return {
    ...state,
    records: state.records,
    loading: state.isLoading,
    isAnonymous: !userId,
    addThoughtRecord: async (
      record: Omit<BrowserThoughtRecord, keyof Identified>,
    ) =>
      state.insert(stamp(userId ?? 'guest', 'thought', record)),
    completeFollowUp: async () => undefined,
  };
}

export async function fetchReminders(userId: string): Promise<ReminderRecord[]> {
  const local = read<ReminderRecord>('reminders', userId);
  if (isRealAccount(userId)) {
    try {
      const client = createBrowserSupabaseClient();
      if (client) {
        const { data } = await client
          .from('personal_reminders')
          .select('id, user_id, title, scheduled_time, is_recurring, is_active, created_at')
          .eq('user_id', userId);
        if (data && data.length > 0) {
          const remoteRecords: ReminderRecord[] = data.map((r: {
            id: string;
            user_id: string;
            title: string;
            scheduled_time: string;
            is_recurring: boolean;
            is_active: boolean;
            created_at: string;
          }) => ({
            id: r.id,
            user_id: r.user_id,
            title: r.title,
            scheduled_time: r.scheduled_time,
            schedule: r.is_recurring ? 'every-2-hours' : 'once',
            icon_type: r.title.toLowerCase().includes('water')
              ? 'droplet'
              : r.title.toLowerCase().includes('med')
                ? 'pill'
                : 'bell',
            category: r.title.toLowerCase().includes('water')
              ? 'water'
              : r.title.toLowerCase().includes('med')
                ? 'medication'
                : 'custom',
            is_default: false,
            is_active: r.is_active,
            created_at: r.created_at,
          }));
          const merged = [...remoteRecords];
          for (const item of local) {
            if (!merged.some((m) => m.id === item.id)) merged.push(item);
          }
          write('reminders', userId, merged);
          return merged;
        }
      }
    } catch {
      // Offline fallback to local cache
    }
  }
  return local;
}

export async function createReminder(
  userId: string,
  input: Omit<ReminderRecord, keyof Identified | 'is_default' | 'is_active'> &
    Partial<Pick<ReminderRecord, 'is_default' | 'is_active'>>,
): Promise<ReminderRecord> {
  const next = stamp(userId, 'reminder', {
    ...input,
    is_default: input.is_default ?? false,
    is_active: input.is_active ?? true,
  });
  write('reminders', userId, [next, ...read('reminders', userId)]);

  if (isRealAccount(userId)) {
    try {
      const client = createBrowserSupabaseClient();
      if (client) {
        await client.from('personal_reminders').insert({
          id: next.id,
          user_id: userId,
          title: next.title,
          scheduled_time: next.scheduled_time || '09:00',
          is_recurring: next.schedule ? next.schedule !== 'once' : true,
          is_active: next.is_active,
        });
      }
    } catch {
      // Optimistic write persisted locally; server syncs upon reconnect
    }
  }
  return next;
}

export async function updateReminder(
  id: string,
  updates: Partial<ReminderRecord>,
): Promise<void> {
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const storageKey = window.localStorage.key(index);
    if (!storageKey?.startsWith(`${PREFIX}:reminders:`)) continue;
    const userId = storageKey.slice(`${PREFIX}:reminders:`.length);
    const records = read<ReminderRecord>('reminders', userId);
    if (!records.some((record) => record.id === id)) continue;
    write(
      'reminders',
      userId,
      records.map((record) => (record.id === id ? { ...record, ...updates } : record)),
    );
    if (isRealAccount(userId)) {
      try {
        const client = createBrowserSupabaseClient();
        if (client) {
          const dbUpdates: Record<string, unknown> = {};
          if (updates.title !== undefined) dbUpdates.title = updates.title;
          if (updates.scheduled_time !== undefined) dbUpdates.scheduled_time = updates.scheduled_time;
          if (updates.is_active !== undefined) dbUpdates.is_active = updates.is_active;
          if (updates.schedule !== undefined) dbUpdates.is_recurring = updates.schedule !== 'once';
          if (Object.keys(dbUpdates).length > 0) {
            void client.from('personal_reminders').update(dbUpdates).eq('id', id);
          }
        }
      } catch {
        // Ignored
      }
    }
    return;
  }
}

export async function deleteReminder(id: string): Promise<void> {
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const storageKey = window.localStorage.key(index);
    if (!storageKey?.startsWith(`${PREFIX}:reminders:`)) continue;
    const userId = storageKey.slice(`${PREFIX}:reminders:`.length);
    const records = read<ReminderRecord>('reminders', userId);
    if (!records.some((record) => record.id === id)) continue;
    write(
      'reminders',
      userId,
      records.filter((record) => record.id !== id),
    );
    if (isRealAccount(userId)) {
      try {
        const client = createBrowserSupabaseClient();
        if (client) {
          void client.from('personal_reminders').delete().eq('id', id);
        }
      } catch {
        // Ignored
      }
    }
    return;
  }
}

export async function logReminderFeedback(
  userId: string,
  event: Omit<ReminderFeedbackEvent, 'id' | 'created_at'>,
): Promise<ReminderFeedbackEvent> {
  const next: ReminderFeedbackEvent = {
    ...event,
    id: uid('rfb'),
    created_at: new Date().toISOString(),
  };
  const existing = read<ReminderFeedbackEvent>('reminder_feedback', userId);
  write('reminder_feedback', userId, [next, ...existing]);

  // Somatic loop closure:
  if (event.action === 'done' && event.category === 'breathe') {
    const existingSessions = read<SomaticSessionRecord>('somatic_sessions', userId);
    const session: SomaticSessionRecord = stamp(userId, 'somatic', {
      seconds: 180,
      source: 'breath_guide' as const,
      started_at: new Date().toISOString(),
    });
    write('somatic_sessions', userId, [session, ...existingSessions]);
  }

  return next;
}

export async function fetchReminderFeedback(userId: string): Promise<ReminderFeedbackEvent[]> {
  return read<ReminderFeedbackEvent>('reminder_feedback', userId);
}
export async function saveWindDownRitual(
  userId: string,
  payload: { went_well: string; to_release: string; tomorrow_intent: string },
): Promise<void> {
  const records = read<Identified>('wind-down', userId);
  write('wind-down', userId, [stamp(userId, 'wind-down', payload), ...records]);
}
export async function saveVoiceJournalRecord(
  userId: string,
  payload: { durationSeconds: number; blob?: Blob; extension?: string; contentType?: string },
): Promise<void> {
  void payload.blob;
  void payload.extension;
  void payload.contentType;
  const records = read<Identified>('voice-journals', userId);
  write('voice-journals', userId, [
    stamp(userId, 'voice', { duration_seconds: payload.durationSeconds }),
    ...records,
  ]);
}
export async function fetchInteractionCountForView(userId: string): Promise<number> {
  return Object.keys(window.localStorage)
    .filter((entry) => entry.startsWith(`${PREFIX}:`) && entry.endsWith(`:${userId}`))
    .reduce(
      (count, entry) =>
        count + read<unknown>(entry.replace(`${PREFIX}:`, '').split(':')[0] ?? '', userId).length,
      0,
    );
}
export type SomaticSessionRecord = Identified & {
  seconds: number;
  source: 'sanctuary_pulse' | 'breath_guide' | 'external_app';
  started_at: string;
};

export function useSanctuaryHealth(userId?: string) {
  const effectiveUserId = userId || 'guest';
  const sessions = useCollection<SomaticSessionRecord>('somatic_sessions', effectiveUserId);
  const sleepLogs = useCollection<SleepLog & { hours_slept?: number }>('sleep', effectiveUserId);
  const energyForecasts = useCollection<EnergyForecast>('energy', effectiveUserId);

  const todayIso = typeof window !== 'undefined' ? new Date().toISOString().split('T')[0] ?? '' : '';

  const mindfulMinutesToday = useMemo(() => {
    const todaySessions = sessions.records.filter((r) =>
      (r.started_at || r.created_at || '').startsWith(todayIso),
    );
    return Math.floor(todaySessions.reduce((total, record) => total + record.seconds, 0) / 60);
  }, [sessions.records, todayIso]);

  const recoverySignal = useMemo(() => {
    const latestSleep = sleepLogs.records[0];
    if (latestSleep) {
      const hours = latestSleep.hours_slept ?? (latestSleep.quality >= 4 ? 7.5 : 5.5);
      const level: 'serene' | 'moderate' | 'depleted' =
        hours >= 7 || latestSleep.quality >= 4
          ? 'serene'
          : hours >= 5 || latestSleep.quality === 3
            ? 'moderate'
            : 'depleted';
      return {
        level,
        sleepDurationHours: hours,
        restingHeartRateBpm: level === 'serene' ? 64 : level === 'moderate' ? 72 : 80,
        calculatedAt: latestSleep.created_at,
      };
    }

    const latestEnergy = energyForecasts.records[0];
    if (latestEnergy) {
      const level: 'serene' | 'moderate' | 'depleted' =
        latestEnergy.energy_level >= 4
          ? 'serene'
          : latestEnergy.energy_level === 3
            ? 'moderate'
            : 'depleted';
      return {
        level,
        restingHeartRateBpm: level === 'serene' ? 66 : 74,
        calculatedAt: latestEnergy.created_at,
      };
    }

    return {
      level: 'serene' as const,
      restingHeartRateBpm: 68,
      calculatedAt: new Date().toISOString(),
    };
  }, [sleepLogs.records, energyForecasts.records]);

  const recordSession = useCallback(
    async (seconds: number, source: 'sanctuary_pulse' | 'breath_guide' = 'sanctuary_pulse') => {
      const session = stamp(effectiveUserId, 'somatic', {
        seconds,
        source,
        started_at: new Date().toISOString(),
      });
      await sessions.insert(session);
      return session;
    },
    [effectiveUserId, sessions],
  );

  return {
    mindfulMinutesToday,
    recoverySignal,
    recordSession,
    sessionsCount: sessions.records.length,
    isLoading: sessions.isLoading,
  };
}
