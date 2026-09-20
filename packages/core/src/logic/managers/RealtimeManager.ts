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

  subscribePresence<T>(
    channelName: string,
    callbacks: {
      onSync?: (presences: T[]) => void;
      onJoin?: (key: string, newPresences: T[]) => void;
      onLeave?: (key: string, leftPresences: T[]) => void;
    },
  ) {
    return this.port.subscribePresence<T>(channelName, callbacks);
  }
}
