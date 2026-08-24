import type {
  IRealtimePort,
  RealtimeCallback,
  RealtimeSubscriptionOptions,
} from '@repo/core/logic/ports/realtime.port';

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
