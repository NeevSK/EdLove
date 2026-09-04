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
});
