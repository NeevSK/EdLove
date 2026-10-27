import { subscribeToNetwork } from '@repo/core/adapters/subscribeToNetwork';
import { networkManager } from '@repo/core/logic/managers/NetworkManager';
import {
  defaultShouldDehydrateQuery,
  isServer,
  onlineManager,
  QueryClient,
} from '@tanstack/react-query';

if (!isServer) {
  onlineManager.setEventListener((setOnline) => {
    // This schedules reads; unknown must not strand startup or authorize a write.
    const update = () => setOnline(networkManager.getSnapshot().status !== 'offline');
    const unsubscribe = subscribeToNetwork(update);
    update();
    return unsubscribe;
  });
}

/**
 * Creates a configured QueryClient with robust defaults:
 * - 5 minute staleTime to eliminate immediate SSR hydration double-fetching
 * - 10 minute gcTime for background memory reclamation
 * - 'offlineFirst' networkMode to gracefully support offline usage
 * - Serialization inclusion for pending queries during SSR streaming
 */
export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: 2,
        networkMode: 'offlineFirst',
        refetchOnWindowFocus: false,
      },
      mutations: { networkMode: 'offlineFirst' },
      dehydrate: {
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) || query.state.status === 'pending',
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

/**
 * Isomorphic QueryClient accessor:
 * - On the server: always instantiates a fresh QueryClient to guarantee cross-request isolation.
 * - In the browser: retains a persistent singleton across renders and React Suspense boundaries.
 */
export function getQueryClient(): QueryClient {
  if (isServer) {
    return makeQueryClient();
  }
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}

/**
 * Clears the browser QueryClient singleton. Primarily used for unit testing.
 */
export function resetBrowserQueryClient(): void {
  browserQueryClient = undefined;
}
