import { type SupabaseClient } from '@supabase/supabase-js';
import { 
  type IRealtimePort, 
  type RealtimeSubscriptionOptions, 
  type RealtimeCallback,
  type IRealtimeSubscription
} from '../../logic/ports/realtime.port';

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
        }
      )
      .subscribe();

    return {
      async unsubscribe() {
        await supabase.removeChannel(channel);
      }
    };
  }
});
