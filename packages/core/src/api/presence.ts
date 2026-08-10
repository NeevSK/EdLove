import { supabaseClient } from '@repo/core/adapters/supabaseClient';

export interface PresenceFallbackCountOptions {
  targetCapacities: string[];
  isCumulative: boolean;
  userId?: string;
  windowMs?: number;
}

export interface PresenceSessionOptions {
  userId: string;
  userCapacity: string;
  userVibe?: string;
  channelName: string;
  onCountChange: (count: number) => void;
  onOfflineChange: (offline: boolean) => void;
}

export async function fetchPresenceFallbackCount(
  options: PresenceFallbackCountOptions,
): Promise<number> {
  const now = Date.now();
  const fiveMinutesAgo = new Date(now - (options.windowMs ?? 5 * 60 * 1000)).toISOString();
  let query = supabaseClient
    .from('users')
    .select('id', { count: 'exact', head: true })
    .gte('last_seen_at', fiveMinutesAgo);

  if (!options.isCumulative) {
    query = query.in('capacity', options.targetCapacities);
  } else if (options.userId && options.userId !== 'anonymous') {
    query = query.neq('id', options.userId);
  }

  const { count, error } = await query;

  if (error) throw error;
  return count ?? 0;
}

export async function markUserPresenceSeen(userId: string): Promise<void> {
  const { error } = await supabaseClient
    .from('users')
    .update({ last_seen_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) throw error;
}

export function startPresenceSession(options: PresenceSessionOptions): () => void {
  const selfChannel = supabaseClient.channel(
    `presence:self:${options.userCapacity}`,
  );
  const watcherChannel = supabaseClient.channel(options.channelName);

  selfChannel.subscribe((status) => {
    if (status !== 'SUBSCRIBED') return;

    void (async () => {
      try {
        await markUserPresenceSeen(options.userId);
        await selfChannel.track({
          user_id: options.userId,
          vibe: options.userVibe ?? 'active',
          // DETERMINISTIC_OK: Background side-effect for presence heartbeat.
          online_at: new Date().toISOString(),
        });
      } catch {
        options.onOfflineChange(true);
      }
    })();
  });

  watcherChannel
    .on('presence', { event: 'sync' }, () => {
      const state = watcherChannel.presenceState();
      const presences = Object.values(state).flat();
      options.onCountChange(presences.length);
      options.onOfflineChange(false);
    })
    .on('presence', { event: 'join' }, () => {
      options.onOfflineChange(false);
    })
    .subscribe((status) => {
      if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
        options.onOfflineChange(true);
      }
    });

  return () => {
    supabaseClient.removeChannel(selfChannel).catch((e) => {
      console.error('Presence: Failed to remove self channel', e);
    });
    supabaseClient.removeChannel(watcherChannel).catch((e) => {
      console.error('Presence: Failed to remove watcher channel', e);
    });
  };
}

export const presenceAPI = {
  fetchPresenceFallbackCount,
  markUserPresenceSeen,
  startPresenceSession,
};
