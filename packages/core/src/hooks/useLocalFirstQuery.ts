import { isLocalOnlyIdentity } from '@repo/core/logic/auth/identityState';
import { useOfflineStatus } from '@repo/core/offline/useOfflineStatus';
import { SafeZustandStorage } from '@repo/core/lib/storageWrapper';
import { useAuthStore } from '@repo/core/store/useAuthStore';
import { useTemporalStore } from '@repo/core/store/useTemporalStore';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface UseLocalFirstQueryOptions<TData> {
  queryKey: string;
  userId?: string | null;
  enabled?: boolean;
  guestResolver?: () => Promise<TData | null> | TData | null;
  fetcher: (userId: string, viewDate: string) => Promise<TData | null>;
  initialData?: TData | null;
}

export type LocalFirstQueryOptions<TData> = UseLocalFirstQueryOptions<TData>;

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
 * Canonical foundation for all product domain hooks (Web + Mobile).
 * 1. Instant Cache Hydration: Loads from SafeZustandStorage on mount with 0 delay.
 * 2. Guest-Mode Isolation: Executes guestResolver with zero cloud network calls.
 * 3. Remote Sync: Executes fetcher only when authenticated and online.
 * 4. Fault Resilience: Retains cached data on network failures without throwing.
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
  const { status: networkStatus, isOnline } = useOfflineStatus();
  const viewDate = useTemporalStore((s) => s.viewDate);

  const activeUserId = customUserId || user?.id || (isAnonymous ? 'guest' : null);

  const [data, setDataState] = useState<TData | null>(initialData);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOfflineState, setIsOfflineState] = useState(false);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const guestResolverRef = useRef(guestResolver);
  guestResolverRef.current = guestResolver;

  const storageKey = useMemo(() => {
    return `${queryKey}:${activeUserId ?? 'anon'}:${viewDate}`;
  }, [queryKey, activeUserId, viewDate]);

  // 1. Instant Cache Hydration
  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    let active = true;
    const hydrate = async () => {
      try {
        if (isLocalOnly && guestResolverRef.current) {
          const guestResult = await guestResolverRef.current();
          if (active && guestResult !== null && guestResult !== undefined) {
            setDataState(guestResult);
            setIsLoading(false);
            return;
          }
        }

        const raw = await SafeZustandStorage.getItem(storageKey);
        if (active && raw) {
          setDataState(JSON.parse(raw));
        }
      } catch (err) {
        console.warn(`[useLocalFirstQuery] Cache hydration error for ${storageKey}:`, err);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void hydrate();
    return () => {
      active = false;
    };
  }, [enabled, isLocalOnly, storageKey]);

  const sequenceRef = useRef(0);

  // 2. Background Sync / Remote Fetch
  const syncRemote = useCallback(async () => {
    if (!enabled) return;

    const currentSequence = ++sequenceRef.current;

    if (isLocalOnly) {
      if (guestResolverRef.current) {
        try {
          const guestResult = await guestResolverRef.current();
          if (
            currentSequence === sequenceRef.current &&
            guestResult !== null &&
            guestResult !== undefined
          ) {
            setDataState(guestResult);
          }
        } catch (e) {
          console.warn(`[useLocalFirstQuery] Guest resolver error for ${queryKey}:`, e);
        }
      }
      return;
    }

    if (!activeUserId) return;

    if (!isOnline) {
      setIsOfflineState(networkStatus === 'offline');
      return;
    }

    try {
      const remoteData = await fetcherRef.current(activeUserId, viewDate);
      // Discard stale out-of-order responses if a newer request was dispatched
      if (
        currentSequence === sequenceRef.current &&
        remoteData !== null &&
        remoteData !== undefined
      ) {
        setDataState(remoteData);
        setIsOfflineState(false);
        void SafeZustandStorage.setItem(storageKey, JSON.stringify(remoteData));
      }
    } catch (error) {
      if (currentSequence === sequenceRef.current) {
        console.warn(`[useLocalFirstQuery] Remote fetch error for ${queryKey}:`, error);
        setIsOfflineState(true);
      }
    }
  }, [activeUserId, enabled, isLocalOnly, isOnline, networkStatus, queryKey, storageKey, viewDate]);

  useEffect(() => {
    void syncRemote();
  }, [syncRemote]);

  const setData = useCallback(
    (updater: TData | null | ((prev: TData | null) => TData | null)) => {
      setDataState((prev) => {
        const next =
          typeof updater === 'function'
            ? (updater as (p: TData | null) => TData | null)(prev)
            : updater;
        if (next !== null && next !== undefined) {
          void SafeZustandStorage.setItem(storageKey, JSON.stringify(next));
        }
        return next;
      });
    },
    [storageKey],
  );

  return useMemo(
    () => ({
      data,
      isLoading,
      isOffline: isOfflineState || networkStatus === 'offline',
      isAnonymous,
      refetch: syncRemote,
      setData,
    }),
    [data, isLoading, isOfflineState, networkStatus, isAnonymous, syncRemote, setData],
  );
}
