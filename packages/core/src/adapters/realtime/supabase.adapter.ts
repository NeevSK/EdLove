import type { IRealtimePort } from '@repo/core/logic/ports/realtime.port';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * SupabaseRealtimeAdapter
 *
 * Implementation of IRealtimePort for Supabase.
 */
export const createSupabaseRealtimeAdapter = (supabase: SupabaseClient): IRealtimePort => ({
  subscribe(channelName, options, callback) {
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: options.event,
          schema: options.schema || 'public',
          table: options.table,
          filter: options.filter,
        } as any,
        (payload: any) => {
          callback({
            event: payload.eventType,
            new: payload.new,
            old: payload.old,
          });
        },
      )
      .subscribe();

    return {
      async unsubscribe() {
        await supabase.removeChannel(channel);
      },
    };
  },

  subscribePresence<T>(
    channelName: string,
    callbacks: {
      onSync?: (presences: T[]) => void;
      onJoin?: (key: string, newPresences: T[]) => void;
      onLeave?: (key: string, leftPresences: T[]) => void;
    },
  ) {
    const channel = supabase.channel(channelName);

    if (callbacks.onSync) {
      channel.on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const presences = Object.values(state).flat() as T[];
        callbacks.onSync?.(presences);
      });
    }

    if (callbacks.onJoin) {
      channel.on('presence', { event: 'join' }, ({ key, newPresences }: any) => {
        callbacks.onJoin?.(key, newPresences as T[]);
      });
    }

    if (callbacks.onLeave) {
      channel.on('presence', { event: 'leave' }, ({ key, leftPresences }: any) => {
        callbacks.onLeave?.(key, leftPresences as T[]);
      });
    }

    channel.subscribe();

    return {
      async track(state: T) {
        await channel.track(state as any);
      },
      async unsubscribe() {
        await supabase.removeChannel(channel);
      },
    };
  },
});
