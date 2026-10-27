import { useQuerySnapshotHydration } from '@repo/core/hooks/useQuerySnapshotHydration';
import { getAccountScopeRevision, getActiveAccountId } from '@repo/core/lib/accountScope';
import { storage } from '@repo/core/lib/storage';
import { isLocalOnlyIdentity } from '@repo/core/logic/auth/identityState';
import { growth } from '@repo/core/logic/managers/growth.factory';
import { useOfflineStatus } from '@repo/core/offline/useOfflineStatus';
import { useAuthStore } from '@repo/core/store/useAuthStore';
import { useTemporalStore } from '@repo/core/store/useTemporalStore';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { z } from 'zod';

// The database permits unopened paths to be null; the UI must not invent a stage.
const GrowthViewSchema = z.object({
  user_id: z.uuid(),
  banyan_stage: z
    .enum(['sapling', 'roots_spreading', 'canopy', 'shade_giver', 'forest_maker'])
    .nullable(),
  peer_mentored_count: z.number().int().nonnegative(),
  circles_facilitated_count: z.number().int().nonnegative(),
  river_stage: z.enum(['trickle', 'stream', 'river', 'delta']).nullable(),
  crystal_tier: z.enum(['spark', 'cluster', 'cave', 'fractal']).nullable(),
  crystals_found_count: z.number().int().nonnegative(),
  fractal_moments_count: z.number().int().nonnegative(),
});
const SavedGrowthSchema = z.object({
  savedAt: z.number().nonnegative(),
  data: GrowthViewSchema.nullable(),
});

export function useGrowthQuery() {
  const user = useAuthStore((state) => state.user);
  const principalId = user?.id ?? null;
  const enabled = Boolean(principalId && !isLocalOnlyIdentity(user));
  const { isOnline } = useOfflineStatus();
  const readPolicy = useTemporalStore((state) => state.readPolicy);
  const remoteEnabled = enabled && isOnline && readPolicy === 'live';
  const key = useMemo(() => ['growth-state', principalId] as const, [principalId]);
  const storageKey = `growth-snapshot:v1:${principalId}`;
  const decode = useCallback(
    (raw: string) => {
      const saved = SavedGrowthSchema.parse(JSON.parse(raw));
      if (saved.data && saved.data.user_id !== principalId)
        throw new Error('Saved growth belongs to another account.');
      return saved;
    },
    [principalId],
  );
  const isHydrated = useQuerySnapshotHydration(key, storageKey, decode, enabled);
  const query = useQuery({
    queryKey: key,
    enabled: remoteEnabled,
    retry: false,
    staleTime: 60_000,
    placeholderData: undefined,
    queryFn: async ({ signal }) => {
      const revision = getAccountScopeRevision();
      if (!principalId || getActiveAccountId() !== principalId)
        throw new Error('Growth account is not ready.');
      const result = await growth.getGrowthState(principalId);
      if (
        signal.aborted ||
        revision !== getAccountScopeRevision() ||
        getActiveAccountId() !== principalId
      )
        throw new Error('Growth account ended before its response arrived.');
      const data = result === null ? null : GrowthViewSchema.parse(result);
      if (data && data.user_id !== principalId)
        throw new Error('Growth response belongs to another account.');
      try {
        await storage.setAsync(storageKey, JSON.stringify({ savedAt: Date.now(), data }));
      } catch (error) {
        console.warn('[Growth] Offline snapshot could not be retained.', error);
      }
      if (
        signal.aborted ||
        revision !== getAccountScopeRevision() ||
        getActiveAccountId() !== principalId
      )
        throw new Error('Growth account ended before its snapshot completed.');
      return data;
    },
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
