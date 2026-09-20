/**
 * IRealtimePort
 *
 * Port for real-time subscriptions (WebSockets, SSE, Supabase Realtime).
 */

export interface RealtimeSubscriptionOptions {
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  schema?: string;
  table: string;
  filter?: string;
}

export type RealtimeCallback<T = any> = (payload: { event: string; new: T; old?: T }) => void;

export interface RealtimeSubscription {
  unsubscribe(): Promise<void>;
}

export type IRealtimeSubscription = RealtimeSubscription;

export interface RealtimePresenceSubscription<T = any> {
  track(state: T): Promise<void>;
  unsubscribe(): Promise<void>;
}

export interface IRealtimePort {
  /**
   * Subscribe to changes on a specific resource.
   */
  subscribe<T>(
    channelName: string,
    options: RealtimeSubscriptionOptions,
    callback: RealtimeCallback<T>,
  ): IRealtimeSubscription;

  /**
   * Subscribe to presence state across a channel.
   */
  subscribePresence<T>(
    channelName: string,
    callbacks: {
      onSync?: (presences: T[]) => void;
      onJoin?: (key: string, newPresences: T[]) => void;
      onLeave?: (key: string, leftPresences: T[]) => void;
    },
  ): RealtimePresenceSubscription<T>;
}
