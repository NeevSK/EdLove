import { useQuerySnapshotHydration } from '@repo/core/hooks/useQuerySnapshotHydration';
import { isLocalOnlyIdentity } from '@repo/core/logic/auth/identityState';
import { useOfflineStatus } from '@repo/core/offline/useOfflineStatus';
import {
  decodeGrowthSnapshot,
  growthQueryKey,
  growthSnapshotKey,
  readGrowth,
} from '@repo/core/store/queries/growthQuery';
import { useAuthStore } from '@repo/core/store/useAuthStore';
import { useTemporalStore } from '@repo/core/store/useTemporalStore';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

/** The signed-in account's growth view: the saved copy first, then live when online. */
export function useGrowthQuery() {
  const user = useAuthStore((state) => state.user);
  const principalId = user?.id ?? null;
  const enabled = Boolean(principalId && !isLocalOnlyIdentity(user));
  const { isOnline } = useOfflineStatus();
  const readPolicy = useTemporalStore((state) => state.readPolicy);
  const remoteEnabled = enabled && isOnline && readPolicy === 'live';
  const key = useMemo(() => growthQueryKey(principalId), [principalId]);
  const decode = useCallback((raw: string) => decodeGrowthSnapshot(raw, principalId), [principalId]);
  const isHydrated = useQuerySnapshotHydration(key, growthSnapshotKey(principalId), decode, enabled);
  const query = useQuery({
    queryKey: key,
    enabled: remoteEnabled,
    retry: false,
    staleTime: 60_000,
    placeholderData: undefined,
    queryFn: ({ signal }) => readGrowth(principalId, signal),
  });

  return {
    data: enabled ? query.data : undefined,
    error: enabled ? query.error : null,
    isLoading: enabled && (!isHydrated || query.isLoading),
    refresh: async () => {
      if (remoteEnabled) await query.refetch();
    },
  };
}
