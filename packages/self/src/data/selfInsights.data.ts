import { SafeZustandStorage } from '@repo/core/lib/storageWrapper.adapter';
import type { EnergyForecast } from '@repo/core/types/Wellbeing';
import {
  fetchFireJournalHistoryForView,
  fetchMoodHistoryForView,
} from '@repo/self/data/wellbeing.data';

export interface PresenceSessionOptions {
  userId: string;
  userRole: string;
  userVibe?: string;
  channelName: string;
  onCountChange: (count: number) => void;
  onOfflineChange: (offline: boolean) => void;
}

const getEnergyKey = (userId: string) => `energy_forecasts:${userId}`;

export async function fetchEnergyForecastsForView(
  userId: string,
  options: { viewDate: string; isPastView: boolean },
): Promise<EnergyForecast[]> {
  try {
    const raw = await SafeZustandStorage.getItem(getEnergyKey(userId));
    const all: EnergyForecast[] = raw ? JSON.parse(raw) : [];
    if (options.isPastView) {
      return all.filter((f) => f.forecast_date === options.viewDate);
    }
    return all.slice(0, 7);
  } catch {
    return [];
  }
}

export async function saveEnergyForecastForDate(
  userId: string,
  payload: {
    forecastDate: string;
    energyLevel: EnergyForecast['energy_level'];
    notes?: string;
    existingId?: string;
  },
): Promise<void> {
  const raw = await SafeZustandStorage.getItem(getEnergyKey(userId));
  const all: EnergyForecast[] = raw ? JSON.parse(raw) : [];

  const existingIndex = payload.existingId
    ? all.findIndex((f) => f.id === payload.existingId)
    : all.findIndex((f) => f.forecast_date === payload.forecastDate);

  if (existingIndex >= 0) {
    const current = all[existingIndex]!;
    all[existingIndex] = {
      ...current,
      energy_level: payload.energyLevel,
      notes: payload.notes ?? '',
    };
  } else {
    const newForecast: EnergyForecast = {
      id:
        payload.existingId ?? `energy_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: userId,
      forecast_date: payload.forecastDate,
      energy_level: payload.energyLevel,
      notes: payload.notes ?? '',
      created_at: new Date().toISOString(),
    };
    all.unshift(newForecast);
  }

  await SafeZustandStorage.setItem(getEnergyKey(userId), JSON.stringify(all));
}

export async function fetchInteractionCountForView(
  userId: string,
  options: { viewDate: string; isPastView: boolean },
): Promise<number> {
  const [moods, burned] = await Promise.all([
    fetchMoodHistoryForView(userId, { phase: options.isPastView ? options.viewDate : 'present' }),
    fetchFireJournalHistoryForView(userId, options),
  ]);
  return moods.length + burned.length;
}

export function startPresenceSession(options: PresenceSessionOptions): () => void {
  let unsubscribed = false;

  let sub: { unsubscribe: () => Promise<void> } | null = null;
  void import('@repo/core/adapters/realtime/supabase.adapter')
    .then(({ supabaseRealtimeAdapter: realtime }) => {
      if (unsubscribed) return;
      sub = realtime.subscribePresence<Record<string, unknown>>(options.channelName, {
        onSync: (presences: unknown[]) => {
          options.onCountChange(presences.length);
          options.onOfflineChange(false);
        },
        onJoin: () => {
          options.onOfflineChange(false);
        },
      });
    })
    .catch(() => {
      options.onOfflineChange(true);
    });

  return () => {
    unsubscribed = true;
    if (sub) void sub.unsubscribe();
  };
}
