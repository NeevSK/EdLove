import { getTemporalRange, supabase } from '@repo/core';
import type { DailyPrepItem, Goal, GratitudeEntry, JoyMoment, SleepLog } from '../types';

export interface ReminderRecord {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  icon_type: string;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
}

export interface ReminderInput {
  title: string;
  description?: string;
  icon_type: string;
  is_default?: boolean;
  is_active?: boolean;
}

export async function fetchReminders(userId: string): Promise<ReminderRecord[]> {
  const { data, error } = await supabase
    .from('reminders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function createReminder(
  userId: string,
  input: ReminderInput,
): Promise<ReminderRecord> {
  const { data, error } = await supabase
    .from('reminders')
    .insert({
      user_id: userId,
      title: input.title,
      description: input.description,
      icon_type: input.icon_type,
      is_default: input.is_default ?? false,
      is_active: input.is_active ?? true,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateReminder(
  reminderId: string,
  updates: Partial<ReminderInput> & { is_active?: boolean },
): Promise<void> {
  const { error } = await supabase.from('reminders').update(updates).eq('id', reminderId);

  if (error) throw error;
}

export async function deleteReminder(reminderId: string): Promise<void> {
  const { error } = await supabase.from('reminders').delete().eq('id', reminderId);

  if (error) throw error;
}

export async function fetchSleepLogs(userId: string): Promise<SleepLog[]> {
  const { data, error } = await supabase
    .from('sleep_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(7);

  if (error) throw error;
  return data ?? [];
}

export async function createSleepLog(
  userId: string,
  quality: SleepLog['quality'],
): Promise<SleepLog> {
  const { data, error } = await supabase
    .from('sleep_logs')
    .insert({
      user_id: userId,
      quality,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function fetchJoyMoments(userId: string): Promise<JoyMoment[]> {
  const { data, error } = await supabase
    .from('joy_moments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw error;
  return data ?? [];
}

export async function createJoyMoment(
  userId: string,
  input: Pick<JoyMoment, 'student_name' | 'moment_description' | 'category'>,
): Promise<JoyMoment> {
  const { data, error } = await supabase
    .from('joy_moments')
    .insert({
      user_id: userId,
      student_name: input.student_name ?? null,
      moment_description: input.moment_description,
      category: input.category,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function fetchGratitudeEntries(userId: string): Promise<GratitudeEntry[]> {
  const { data, error } = await supabase
    .from('gratitude_entries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw error;
  return data ?? [];
}

export async function createGratitudeEntry(
  userId: string,
  input: Pick<GratitudeEntry, 'content' | 'category'>,
): Promise<GratitudeEntry> {
  const { data, error } = await supabase
    .from('gratitude_entries')
    .insert({
      user_id: userId,
      content: input.content,
      category: input.category,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function fetchStudentGoalsForView(
  userId: string,
  options: { viewDate: string; isPastView: boolean },
): Promise<Goal[]> {
  let query = supabase.from('student_goals').select('*').eq('user_id', userId);

  if (options.isPastView) {
    const range = getTemporalRange(options.viewDate, 'day');
    query = query.lte('created_at', range.end);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function createStudentGoal(userId: string, text: string): Promise<Goal> {
  const { data, error } = await supabase
    .from('student_goals')
    .insert({
      user_id: userId,
      text,
      progress: 0,
      is_completed: false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateStudentGoal(
  goalId: string,
  updates: Partial<Pick<Goal, 'text' | 'progress' | 'is_completed'>>,
): Promise<void> {
  const { error } = await supabase.from('student_goals').update(updates).eq('id', goalId);

  if (error) throw error;
}

export async function fetchTomorrowPrepItems(userId: string): Promise<DailyPrepItem[]> {
  const { data, error } = await supabase
    .from('daily_prep_items')
    .select('*')
    .eq('user_id', userId)
    .gte('prep_date', new Date().toISOString().split('T')[0])
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createTomorrowPrepItem(
  userId: string,
  itemText: string,
  prepDate: string,
): Promise<DailyPrepItem> {
  const { data, error } = await supabase
    .from('daily_prep_items')
    .insert({
      user_id: userId,
      item_text: itemText,
      prep_date: prepDate,
      is_completed: false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTomorrowPrepItem(
  itemId: string,
  updates: Partial<Pick<DailyPrepItem, 'is_completed' | 'item_text'>>,
): Promise<void> {
  const { error } = await supabase.from('daily_prep_items').update(updates).eq('id', itemId);

  if (error) throw error;
}

export async function deleteTomorrowPrepItem(itemId: string): Promise<void> {
  const { error } = await supabase.from('daily_prep_items').delete().eq('id', itemId);

  if (error) throw error;
}

export async function saveWindDownRitual(
  userId: string,
  payload: {
    went_well: string;
    to_release: string;
    tomorrow_intent: string;
  },
): Promise<void> {
  const { error } = await supabase.from('wind_down_rituals').insert({
    user_id: userId,
    ...payload,
    completed_at: new Date().toISOString(),
  });

  if (error) throw error;
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
  if (payload.blob) {
    const fileName = `voice_${userId}_${Date.now()}.${payload.extension ?? 'webm'}`;
    await supabase.storage
      .from('voice-journals')
      .upload(fileName, payload.blob, {
        contentType: payload.contentType ?? 'audio/webm',
        upsert: false,
      })
      .catch(() => {});
  }

  const { error } = await supabase.from('voice_journals').insert({
    user_id: userId,
    duration_seconds: payload.durationSeconds,
    created_at: new Date().toISOString(),
  });

  if (error) throw error;
}
