'use client';

import type { NetworkSnapshot } from '@repo/core/logic/interfaces/network.port';
import { network } from '@repo/core/effect/bindings/network';
import { useSyncExternalStore } from 'react';

const SERVER_SNAPSHOT: NetworkSnapshot = Object.freeze({
  status: 'unknown',
  source: 'none',
  connection: null,
});

export interface OfflineStatus extends NetworkSnapshot {
  isOnline: boolean;
  isOffline: boolean;
}

/** Reads the shared platform observation; unknown stays distinct from offline. */
export function useOfflineStatus(): OfflineStatus {
  const snapshot = useSyncExternalStore(
    network.subscribe,
    network.getSnapshot,
    () => SERVER_SNAPSHOT,
  );

  return {
    ...snapshot,
    isOnline: snapshot.status === 'online',
    isOffline: snapshot.status === 'offline',
  };
}
