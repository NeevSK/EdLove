import { isLocalOnlyIdentity } from '@repo/core/logic/auth/identityState';
import { useOfflineStatus } from '@repo/core/offline/useOfflineStatus';
import { persistStorage as SafeZustandStorage } from '@repo/core/effect/bindings/state';
import { useAuthStore } from '@repo/core/store/useAuthStore';
import { useTemporalStore } from '@repo/core/store/useTemporalStore';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export interface UseLocalFirstQueryOptions<TData> {
  queryKey: string;
  userId?: string | null;
  enabled?: boolean;
  guestResolver?: () => Promise<TData | null> | TData | null;
  fetcher: (userId: string, viewDate: string) => Promise<TData | null>;
  initialData?: TData | null;
}

export type LocalFirstQueryOptions<TData> = UseLocalFirstQueryOptions<TData>;

interface Cached<TData> {
  readonly value: TData | null;
}

export interface LocalFirstQueryResult<TData> {
  data: TData | null;
  isLoading: boolean;
  isOffline: boolean;
  isAnonymous: boolean;
  refetch: () => Promise<void>;
  setData: (data: TData | null | ((prev: TData | null) => TData | null)) => void;
}

/**
 * useLocalFirstQuery
 *
 * Canonical foundation for product domain hooks (web and mobile), on TanStack Query:
 * 1. **Instant cache.** A device query reads the stored copy (or, for a local-only identity,
 *    `guestResolver`) without waiting for the network.
 * 2. **Guest isolation.** A local-only identity never calls `fetcher`.
 * 3. **Remote sync.** A live query runs `fetcher` when signed in; TanStack's online manager
 *    pauses it while offline, keeps only the newest response, and cancels superseded ones (the
 *    old hand-rolled sequence counter). Results are saved for next time.
 * 4. **Fault resilience.** A failed or empty fetch leaves the stored copy on screen; the
 *    QueryClient policy decides whether to retry (`worthRetrying`).
 */
export function useLocalFirstQuery<TData>({
  queryKey,
  userId: customUserId,
  enabled = true,
  guestResolver,
  fetcher,
  initialData = null,
}: UseLocalFirstQueryOptions<TData>): LocalFirstQueryResult<TData> {
  const user = useAuthStore((s) => s.user);
  const isAnonymous = Boolean(!user || user.is_anonymous);
  const isLocalOnly = isLocalOnlyIdentity(user);
  const { status: networkStatus } = useOfflineStatus();
  const viewDate = useTemporalStore((s) => s.viewDate);
  const queryClient = useQueryClient();

  const activeUserId = customUserId || user?.id || (isAnonymous ? 'guest' : null);
  const storageKey = `${queryKey}:${activeUserId ?? 'anon'}:${viewDate}`;
  const liveKey = ['localFirst', queryKey, activeUserId ?? 'anon', viewDate] as const;
  const deviceKey = [...liveKey, 'device'] as const;

  // Cached values are wrapped (`{ value }`), so a generic TData can never be mistaken for one of
  // TanStack's updater or placeholder functions.
  const stored = useQuery({
    queryKey: deviceKey,
    queryFn: async (): Promise<Cached<TData>> => {
      if (isLocalOnly && guestResolver) {
        const guest = await guestResolver();
        if (guest !== null && guest !== undefined) return { value: guest };
      }
      const raw = await SafeZustandStorage.getItem(storageKey);
      return { value: raw ? (JSON.parse(raw) as TData) : null };
    },
    enabled,
    networkMode: 'always',
    staleTime: Number.POSITIVE_INFINITY,
  });

  const live = useQuery({
    queryKey: liveKey,
    queryFn: async (): Promise<Cached<TData>> => {
      const remote = activeUserId ? await fetcher(activeUserId, viewDate) : null;
      if (remote === null || remote === undefined) {
        return queryClient.getQueryData<Cached<TData>>(deviceKey) ?? { value: null };
      }
      void SafeZustandStorage.setItem(storageKey, JSON.stringify(remote));
      return { value: remote };
    },
    enabled: enabled && !isLocalOnly && Boolean(activeUserId),
    placeholderData: stored.data,
    // The stored copy stays on screen; the screen shows `isOffline`, so no toast.
    meta: { feedback: 'silent', operation: `localFirst.${queryKey}` },
  });

  const data = live.data?.value ?? stored.data?.value ?? initialData;

  const setData = (updater: TData | null | ((prev: TData | null) => TData | null)) => {
    const next =
      typeof updater === 'function'
        ? (updater as (previous: TData | null) => TData | null)(data)
        : updater;
    queryClient.setQueryData<Cached<TData>>(deviceKey, { value: next });
    queryClient.setQueryData<Cached<TData>>(liveKey, { value: next });
    if (next !== null && next !== undefined) {
      void SafeZustandStorage.setItem(storageKey, JSON.stringify(next));
    }
  };

  const refetch = async () => {
    await (isLocalOnly ? stored.refetch() : live.refetch());
  };

  return {
    data,
    isLoading: enabled && stored.isPending,
    isOffline: live.isError || networkStatus === 'offline',
    isAnonymous,
    refetch,
    setData,
  };
}
