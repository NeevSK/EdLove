import { decisionJournalAPI } from '@repo/core/api/decisionJournal';
import { journalEntriesAPI } from '@repo/core/api/journalEntries';
import { SafeZustandStorage } from '@repo/core/lib/storageWrapper';
import { indexVoiceJournals, indexWisdomNotes } from '@repo/self/lib/selfFts';

import type {
  DailyPrepItem,
  DecisionLog,
  Goal,
  GratitudeEntry,
  JournalEntry,
  JoyMoment,
  Period,
  SleepLog,
  WisdomNote,
} from '@repo/self/types';

async function getCollection<T>(key: string): Promise<T[]> {
  try {
    const raw = await SafeZustandStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function setCollection<T>(key: string, items: T[]): Promise<void> {
  await SafeZustandStorage.setItem(key, JSON.stringify(items));
}

function uid(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

export interface ReminderRecord {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  icon_type: string;
  category?: 'water' | 'medication' | 'movement' | 'breathe' | 'custom';
  schedule?: 'hourly' | 'every-2-hours' | 'morning-and-night' | 'daily' | 'once';
  scheduled_time?: string;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
}

export interface ReminderInput {
  title: string;
  description?: string;
  icon_type: string;
  category?: 'water' | 'medication' | 'movement' | 'breathe' | 'custom';
  schedule?: 'hourly' | 'every-2-hours' | 'morning-and-night' | 'daily' | 'once';
  scheduled_time?: string;
  is_default?: boolean;
  is_active?: boolean;
}

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

export async function logReminderFeedback(
  userId: string,
  event: Omit<ReminderFeedbackEvent, 'id' | 'created_at'>,
): Promise<ReminderFeedbackEvent> {
  const all = await getCollection<ReminderFeedbackEvent>(`reminder_feedback:${userId}`);
  const record: ReminderFeedbackEvent = {
    ...event,
    id: uid('rfb'),
    created_at: new Date().toISOString(),
  };
  all.unshift(record);
  await setCollection(`reminder_feedback:${userId}`, all);

  // Somatic loop closure:
  if (event.action === 'done' && event.category === 'breathe') {
    const sessions = await getCollection<any>(`somatic_sessions:${userId}`);
    sessions.unshift({
      id: uid('som'),
      user_id: userId,
      seconds: 180,
      source: 'breath_guide',
      started_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    });
    await setCollection(`somatic_sessions:${userId}`, sessions);
  }

  return record;
}

export async function fetchReminderFeedback(userId: string): Promise<ReminderFeedbackEvent[]> {
  return getCollection<ReminderFeedbackEvent>(`reminder_feedback:${userId}`);
}

export async function fetchReminders(userId: string): Promise<ReminderRecord[]> {
  const all = await getCollection<ReminderRecord>(`reminders:${userId}`);
  return all.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function createReminder(
  userId: string,
  input: ReminderInput,
): Promise<ReminderRecord> {
  const all = await getCollection<ReminderRecord>(`reminders:${userId}`);
  const record: ReminderRecord = {
    id: uid('reminder'),
    user_id: userId,
    title: input.title,
    description: input.description,
    icon_type: input.icon_type,
    category: input.category,
    schedule: input.schedule,
    scheduled_time: input.scheduled_time,
    is_default: input.is_default ?? false,
    is_active: input.is_active ?? true,
    created_at: new Date().toISOString(),
  };
  all.unshift(record);
  await setCollection(`reminders:${userId}`, all);
  return record;
}

export async function updateReminder(
  reminderId: string,
  updates: Partial<ReminderInput> & { is_active?: boolean },
): Promise<void> {
  // Update across active user scopes
  const keys = ['reminders:current', 'reminders:guest'];
  for (const key of keys) {
    const all = await getCollection<ReminderRecord>(key);
    const index = all.findIndex((r) => r.id === reminderId);
    if (index >= 0) {
      const current = all[index]!;
      all[index] = { ...current, ...updates };
      await setCollection(key, all);
      return;
    }
  }
}

export async function deleteReminder(reminderId: string): Promise<void> {
  const keys = ['reminders:current', 'reminders:guest'];
  for (const key of keys) {
    const all = await getCollection<ReminderRecord>(key);
    const filtered = all.filter((r) => r.id !== reminderId);
    if (filtered.length !== all.length) {
      await setCollection(key, filtered);
      return;
    }
  }
}

export async function fetchSleepLogs(userId: string): Promise<SleepLog[]> {
  const all = await getCollection<SleepLog>(`sleep_logs:${userId}`);
  return all.slice(0, 7);
}

export async function createSleepLog(
  userId: string,
  quality: SleepLog['quality'],
): Promise<SleepLog> {
  const all = await getCollection<SleepLog>(`sleep_logs:${userId}`);
  const record: SleepLog = {
    id: uid('sleep'),
    user_id: userId,
    quality,
    created_at: new Date().toISOString(),
  };
  all.unshift(record);
  await setCollection(`sleep_logs:${userId}`, all);
  return record;
}

export async function fetchJoyMoments(userId: string): Promise<JoyMoment[]> {
  const all = await getCollection<JoyMoment>(`joy_moments:${userId}`);
  return all.slice(0, 20);
}

export async function createJoyMoment(
  userId: string,
  input: Pick<JoyMoment, 'student_name' | 'moment_description' | 'category'>,
): Promise<JoyMoment> {
  const all = await getCollection<JoyMoment>(`joy_moments:${userId}`);
  const record: JoyMoment = {
    id: uid('joy'),
    user_id: userId,
    student_name: input.student_name ?? undefined,
    moment_description: input.moment_description,
    category: input.category,
    created_at: new Date().toISOString(),
  };
  all.unshift(record);
  await setCollection(`joy_moments:${userId}`, all);
  return record;
}

export async function fetchGratitudeEntries(userId: string): Promise<GratitudeEntry[]> {
  const all = await getCollection<GratitudeEntry>(`gratitude:${userId}`);
  return all.slice(0, 20);
}

export async function createGratitudeEntry(
  userId: string,
  input: Pick<GratitudeEntry, 'content' | 'category'>,
): Promise<GratitudeEntry> {
  const all = await getCollection<GratitudeEntry>(`gratitude:${userId}`);
  const record: GratitudeEntry = {
    id: uid('gratitude'),
    user_id: userId,
    content: input.content,
    category: input.category,
    created_at: new Date().toISOString(),
  };
  all.unshift(record);
  await setCollection(`gratitude:${userId}`, all);
  return record;
}

export async function fetchStudentGoalsForView(
  userId: string,
  options: { viewDate: string; isPastView: boolean },
): Promise<Goal[]> {
  const all = await getCollection<Goal>(`student_goals:${userId}`);
  if (options.isPastView) {
    return all.filter((g) => new Date(g.created_at) <= new Date(`${options.viewDate}T23:59:59.999Z`));
  }
  return all;
}

export async function createStudentGoal(userId: string, text: string): Promise<Goal> {
  const all = await getCollection<Goal>(`student_goals:${userId}`);
  const record: Goal = {
    id: uid('goal'),
    user_id: userId,
    text,
    progress: 0,
    is_completed: false,
    created_at: new Date().toISOString(),
  } as Goal;
  all.unshift(record);
  await setCollection(`student_goals:${userId}`, all);
  return record;
}

export async function updateStudentGoal(
  goalId: string,
  updates: Partial<Pick<Goal, 'text' | 'progress' | 'is_completed'>>,
): Promise<void> {
  const keys = ['student_goals:current', 'student_goals:guest'];
  for (const key of keys) {
    const all = await getCollection<Goal>(key);
    const index = all.findIndex((g) => g.id === goalId);
    if (index >= 0) {
      const current = all[index]!;
      all[index] = { ...current, ...updates };
      await setCollection(key, all);
      return;
    }
  }
}

export async function fetchTomorrowPrepItems(userId: string): Promise<DailyPrepItem[]> {
  const all = await getCollection<DailyPrepItem>(`daily_prep:${userId}`);
  const today = new Date().toISOString().split('T')[0] ?? '';
  return all.filter((item) => (item.prep_date ?? '') >= today);
}

export async function createTomorrowPrepItem(
  userId: string,
  itemText: string,
  prepDate: string,
): Promise<DailyPrepItem> {
  const all = await getCollection<DailyPrepItem>(`daily_prep:${userId}`);
  const record: DailyPrepItem = {
    id: uid('prep'),
    user_id: userId,
    item_text: itemText,
    prep_date: prepDate,
    is_completed: false,
    created_at: new Date().toISOString(),
  };
  all.push(record);
  await setCollection(`daily_prep:${userId}`, all);
  return record;
}

export async function updateTomorrowPrepItem(
  itemId: string,
  updates: Partial<Pick<DailyPrepItem, 'is_completed' | 'item_text'>>,
): Promise<void> {
  const keys = ['daily_prep:current', 'daily_prep:guest'];
  for (const key of keys) {
    const all = await getCollection<DailyPrepItem>(key);
    const index = all.findIndex((item) => item.id === itemId);
    if (index >= 0) {
      const current = all[index]!;
      all[index] = { ...current, ...updates };
      await setCollection(key, all);
      return;
    }
  }
}

export async function deleteTomorrowPrepItem(itemId: string): Promise<void> {
  const keys = ['daily_prep:current', 'daily_prep:guest'];
  for (const key of keys) {
    const all = await getCollection<DailyPrepItem>(key);
    const filtered = all.filter((item) => item.id !== itemId);
    if (filtered.length !== all.length) {
      await setCollection(key, filtered);
      return;
    }
  }
}

export async function saveWindDownRitual(
  userId: string,
  payload: {
    went_well: string;
    to_release: string;
    tomorrow_intent: string;
  },
): Promise<void> {
  const all = await getCollection<any>(`wind_down:${userId}`);
  all.unshift({
    id: uid('wind_down'),
    user_id: userId,
    ...payload,
    completed_at: new Date().toISOString(),
  });
  await setCollection(`wind_down:${userId}`, all);
}

export async function saveVoiceJournalRecord(
  userId: string,
  payload: {
    durationSeconds: number;
    blob?: Blob;
    extension?: string;
    contentType?: string;
  },
): Promise<void> {
  const id = uid('voice');
  const all = await getCollection<any>(`voice_journals:${userId}`);
  all.unshift({
    id,
    user_id: userId,
    duration_seconds: payload.durationSeconds,
    created_at: new Date().toISOString(),
  });
  await setCollection(`voice_journals:${userId}`, all);

  void indexVoiceJournals([
    { id, duration_seconds: payload.durationSeconds },
  ]).catch(() => {});
}

export async function fetchDecisionLogs(
  userId: string,
  options?: { viewDate?: string; isPastView?: boolean },
): Promise<DecisionLog[]> {
  void userId;
  return (await decisionJournalAPI.list({
    limit: 20,
    view_date:
      options?.isPastView && options.viewDate
        ? new Date(`${options.viewDate}T00:00:00.000Z`).toISOString()
        : undefined,
  })) as DecisionLog[];
}

export async function createDecisionLog(userId: string, text: string): Promise<DecisionLog | null> {
  void userId;
  return (await decisionJournalAPI.create({ decision_text: text })) as DecisionLog;
}

export async function fetchTimetablePeriods(activeDay: number): Promise<Period[]> {
  const all = await getCollection<Period>('timetable:current');
  return all
    .filter((p) => p.day_of_week === activeDay)
    .sort((a, b) => (a.start_time ?? '').localeCompare(b.start_time ?? ''));
}

export async function createTimetablePeriod(
  userId: string,
  period: Omit<Period, 'id' | 'user_id'>,
): Promise<Period> {
  const all = await getCollection<Period>(`timetable:${userId}`);
  const record: Period = {
    id: uid('period'),
    user_id: userId,
    ...period,
  } as Period;
  all.push(record);
  await setCollection(`timetable:${userId}`, all);
  return record;
}

export async function updateTimetablePeriod(id: string, updates: Partial<Period>): Promise<void> {
  const keys = ['timetable:current', 'timetable:guest'];
  for (const key of keys) {
    const all = await getCollection<Period>(key);
    const index = all.findIndex((p) => p.id === id);
    if (index >= 0) {
      const current = all[index]!;
      all[index] = { ...current, ...updates };
      await setCollection(key, all);
      return;
    }
  }
}

export async function deleteTimetablePeriod(id: string): Promise<void> {
  const keys = ['timetable:current', 'timetable:guest'];
  for (const key of keys) {
    const all = await getCollection<Period>(key);
    const filtered = all.filter((p) => p.id !== id);
    if (filtered.length !== all.length) {
      await setCollection(key, filtered);
      return;
    }
  }
}

export async function fetchWisdomNotes(
  userId: string,
  options?: { viewDate?: string; isPastView?: boolean },
): Promise<WisdomNote[]> {
  void options;
  const all = await getCollection<WisdomNote>(`wisdom_notes:${userId}`);
  void indexWisdomNotes(
    all.map((r) => ({
      id: r.id,
      insight: r.insight,
    })),
  ).catch(() => {});
  return all.slice(0, 30);
}

export async function createWisdomNote(userId: string, insight: string): Promise<WisdomNote> {
  const all = await getCollection<WisdomNote>(`wisdom_notes:${userId}`);
  const record: WisdomNote = {
    id: uid('wisdom'),
    user_id: userId,
    insight,
    created_at: new Date().toISOString(),
  } as WisdomNote;
  all.unshift(record);
  await setCollection(`wisdom_notes:${userId}`, all);
  return record;
}

export async function fetchJournalEntries(
  userId: string,
  options?: { viewDate?: string },
): Promise<JournalEntry[]> {
  void userId;
  return (await journalEntriesAPI.list({
    limit: 50,
    view_date: options?.viewDate,
  })) as JournalEntry[];
}

export async function createJournalEntry(userId: string, content: string): Promise<JournalEntry> {
  void userId;
  return (await journalEntriesAPI.create(content)) as JournalEntry;
}
