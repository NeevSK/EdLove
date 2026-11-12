import { useTemporalStore } from '@repo/core/logic';
import { SafeZustandStorage } from '@repo/core/storage-wrapper';
import { fetchInteractionCountForView } from '@repo/self/data/selfInsights.data';
import { useQuery } from '@tanstack/react-query';

const PROGRESS_TREE_CACHE_KEY = 'gurudevi-progtree-cache';

/**
 * Cache-then-network: the count stored on the device shows at once, the live count replaces it
 * when the device is online, and the live count is saved for next time. TanStack Query pauses the
 * live read while offline (its online manager), so the stored count simply stays.
 */
export function useProgressTree(userId?: string) {
  const viewDate = useTemporalStore((s) => s.viewDate);
  const isPastView = useTemporalStore((s) => s.isPastView);
  const storageKey = `${PROGRESS_TREE_CACHE_KEY}-${userId}-${viewDate}`;
  const queryKey = ['self', 'progressTree', userId, viewDate, isPastView] as const;
  const enabled = Boolean(userId);

  const stored = useQuery({
    queryKey: [...queryKey, 'device'],
    queryFn: async () => {
      const value = await SafeZustandStorage.getItem(storageKey);
      return value === null ? null : Number(value);
    },
    enabled,
    networkMode: 'always',
    staleTime: Number.POSITIVE_INFINITY,
  });

  const live = useQuery({
    queryKey,
    queryFn: async () => {
      if (!userId) throw new Error('useProgressTree: the live read needs a user.');
      const count = await fetchInteractionCountForView(userId, { viewDate, isPastView });
      await SafeZustandStorage.setItem(storageKey, String(count));
      return count;
    },
    enabled,
    placeholderData: stored.data ?? undefined,
  });

  return {
    interactionCount: live.data ?? stored.data ?? 0,
    isLoading: enabled && stored.isPending && live.isPending,
    error: live.isError ? 'Progress could not be refreshed.' : null,
    refreshData: live.refetch,
  };
}
