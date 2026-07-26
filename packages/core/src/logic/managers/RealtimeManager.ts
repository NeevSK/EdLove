import type {
  IRealtimePort,
  RealtimeCallback,
  RealtimeSubscriptionOptions,
} from '@/logic/ports/realtime.port';

/**
 * RealtimeManager
 *
 * Domain manager for real-time operations.
 * Wraps the Realtime Port to provide a clean API for the platform.
 */
export class RealtimeManager {
  constructor(private port: IRealtimePort) {}

  subscribe<T>(
    channelName: string,
    options: RealtimeSubscriptionOptions,
    callback: RealtimeCallback<T>,
  ) {
    return this.port.subscribe<T>(channelName, options, callback);
  }
}
