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

export interface IRealtimeSubscription {
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
}
