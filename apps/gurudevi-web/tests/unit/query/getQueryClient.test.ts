import type { NetworkSnapshot } from '@repo/core/logic/interfaces/network.port';
import { networkManager } from '@repo/core/logic/managers/NetworkManager';
import { onlineManager } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';
import {
  getQueryClient,
  makeQueryClient,
  resetBrowserQueryClient,
} from '../../../lib/query/getQueryClient';

describe('getQueryClient', () => {
  it('schedules from the shared network snapshot and keeps unknown distinct from offline', () => {
    let snapshot: NetworkSnapshot = {
      status: 'unknown',
      source: 'browser-navigator',
      connection: null,
    };
    const listeners = new Set<() => void>();
    networkManager.registerAdapter({
      getSnapshot: () => snapshot,
      subscribe: (listener) => {
        listeners.add(listener);
        return () => {
          listeners.delete(listener);
        };
      },
    });
    const stop = onlineManager.subscribe(() => {});
    try {
      expect(onlineManager.isOnline()).toBe(true);
      snapshot = { ...snapshot, status: 'offline' };
      for (const listener of listeners) listener();
      expect(onlineManager.isOnline()).toBe(false);
      snapshot = { ...snapshot, status: 'unknown' };
      for (const listener of listeners) listener();
      expect(onlineManager.isOnline()).toBe(true);
    } finally {
      stop();
    }
  });

  it('instantiates QueryClient with production defaults', () => {
    const client = makeQueryClient();
    const defaultQueries = client.getDefaultOptions().queries;
    const defaultMutations = client.getDefaultOptions().mutations;

    expect(defaultQueries?.staleTime).toBe(5 * 60 * 1000);
    expect(defaultQueries?.gcTime).toBe(10 * 60 * 1000);
    expect(defaultQueries?.retry).toBe(2);
    expect(defaultQueries?.networkMode).toBe('offlineFirst');
    expect(defaultMutations?.networkMode).toBe('offlineFirst');
  });

  it('provides persistent singleton in browser environment', () => {
    resetBrowserQueryClient();
    const clientA = getQueryClient();
    const clientB = getQueryClient();

    expect(clientA).toBe(clientB);
  });

  it('resets browser singleton when explicitly cleared', () => {
    resetBrowserQueryClient();
    const clientA = getQueryClient();
    resetBrowserQueryClient();
    const clientB = getQueryClient();

    expect(clientA).not.toBe(clientB);
  });
});
