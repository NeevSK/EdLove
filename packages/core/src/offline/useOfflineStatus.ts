'use client';

import { subscribeToNetwork } from '@repo/core/adapters/subscribeToNetwork';
import type { NetworkSnapshot } from '@repo/core/logic/interfaces/network.port';
import { networkManager } from '@repo/core/logic/managers/NetworkManager';
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
    subscribeToNetwork,
    networkManager.getSnapshot,
    () => SERVER_SNAPSHOT,
  );

  return {
    ...snapshot,
    isOnline: snapshot.status === 'online',
    isOffline: snapshot.status === 'offline',
  };
}
