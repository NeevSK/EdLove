import { SafeZustandStorage } from '@repo/core/lib/storageWrapper';
import { selfAPI } from '@repo/self/api/self';
import type { EnergyForecast } from '@repo/self/types';

export interface PresenceFallbackCountOptions {
  targetRoles: string[];
  isCumulative: boolean;
  userId?: string;
  windowMs?: number;
}

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
      id: payload.existingId ?? `energy_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
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
  void options;
  try {
    const [moods, burned] = await Promise.all([
      selfAPI.getMoodHistory(userId, 50).catch(() => []),
      selfAPI.getBurnedHistory(userId, 50).catch(() => []),
    ]);
    return (moods?.length ?? 0) + (burned?.length ?? 0);
  } catch {
    return 0;
  }
}

export async function fetchPresenceFallbackCount(
  options: PresenceFallbackCountOptions,
): Promise<number> {
  try {
    const { orpcClient } = await import('@repo/core/api/orpcClient');
    const res = await orpcClient.presence.getFallbackCount({
      query: {
        targetCapacities: options.targetRoles.join(','),
        cumulative: options.isCumulative,
        windowMs: options.windowMs,
      },
    });
    return res.count ?? 0;
  } catch {
    return 0;
  }
}

export async function markUserPresenceSeen(userId: string): Promise<void> {
  void userId;
  try {
    const { orpcClient } = await import('@repo/core/api/orpcClient');
    await orpcClient.presence.markSeen({ body: {} });
  } catch {
    // Non-blocking telemetry
  }
}

export function startPresenceSession(options: PresenceSessionOptions): () => void {
  let unsubscribed = false;
  void markUserPresenceSeen(options.userId);

  let sub: { unsubscribe: () => Promise<void> } | null = null;
  void import('@repo/core/logic/managers/misc.factory')
    .then(({ realtime }) => {
      if (unsubscribed) return;
      sub = realtime.subscribePresence<any>(options.channelName, {
        onSync: (presences) => {
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
