import { supabaseClient } from '@repo/core/adapters/supabaseClient';

export interface PresenceSessionOptions {
  userId: string;
  userCapacity: string;
  userVibe?: string;
  channelName: string;
  onCountChange: (count: number) => void;
  onOfflineChange: (offline: boolean) => void;
}

/**
 * Intentional realtime adapter. Channel membership is not an API CRUD call;
 * the heartbeat write itself is delegated to Sanctuary through markSeen.
 */
export function startPresenceRealtime(
  options: PresenceSessionOptions,
  markSeen: (userId: string) => Promise<void>,
): () => void {
  const selfChannel = supabaseClient.channel(`presence:self:${options.userCapacity}`);
  const watcherChannel = supabaseClient.channel(options.channelName);

  selfChannel.subscribe((status) => {
    if (status !== 'SUBSCRIBED') return;
    void (async () => {
      try {
        await markSeen(options.userId);
        await selfChannel.track({
          user_id: options.userId,
          vibe: options.userVibe ?? 'active',
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
      options.onCountChange(Object.values(state).flat().length);
      options.onOfflineChange(false);
    })
    .on('presence', { event: 'join' }, () => options.onOfflineChange(false))
    .subscribe((status) => {
      if (status === 'CLOSED' || status === 'CHANNEL_ERROR') options.onOfflineChange(true);
    });

  return () => {
    supabaseClient
      .removeChannel(selfChannel)
      .catch((error) => console.error('Presence cleanup failed', error));
    supabaseClient
      .removeChannel(watcherChannel)
      .catch((error) => console.error('Presence cleanup failed', error));
  };
}
