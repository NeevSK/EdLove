import { deviceAccounts } from '@repo/core/accounts/deviceAccounts';
import { assertHighway } from '@repo/core/api/highways';
import { identityAPI } from '@repo/core/api/identity';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

/**
 * Sovereign Identity Hook
 *
 * This is the primary gateway for getting the current logged-in user's
 * identity context. It abstracts away the Supabase auth layer and uses
 * the siphoned Sanctuary API.
 */
export function useIdentity() {
  const {
    data: identity,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['identity', 'active-citizen'],
    queryFn: () => {
      assertHighway('identity_bootstrap', 'direct-api');
      return identityAPI.identifyActiveCitizen();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const signOut = useCallback(() => deviceAccounts.signOutCurrentAccount(), []);

  return useMemo(
    () => ({
      internalId: identity?.id,
      profile: identity,
      isLoading,
      error,
      isAuthenticated: !!identity,
      refresh,
      signOut,
    }),
    [identity, isLoading, error, refresh, signOut],
  );
}
