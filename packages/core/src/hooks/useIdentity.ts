import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { authAPI } from '../api/auth';
import { identityAPI } from '../api/identity';

/**
 * Sovereign Identity Hook
 *
 * This is the primary gateway for getting the current logged-in user's
 * internal ID and profile. It abstracts away the Supabase auth layer.
 */
export function useIdentity() {
  const {
    data: internalId,
    isLoading: isLoadingId,
    error: idError,
    refetch: refetchId,
  } = useQuery({
    queryKey: ['identity', 'my-internal-id'],
    queryFn: () => identityAPI.getMyInternalId(),
    staleTime: Infinity, // ID shouldn't change during session
  });

  const {
    data: profile,
    isLoading: isLoadingProfile,
    error: profileError,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ['identity', 'profile', internalId],
    queryFn: () => (internalId ? identityAPI.getProfile(internalId) : null),
    enabled: !!internalId,
  });

  const isLoading = isLoadingId || isLoadingProfile;
  const error = idError || profileError;

  const refresh = useCallback(async () => {
    await refetchId();
    await refetchProfile();
  }, [refetchId, refetchProfile]);

  const signOut = useCallback(() => authAPI.signOut(), []);

  return useMemo(
    () => ({
      internalId,
      profile,
      isLoading,
      error,
      isAuthenticated: !!internalId,
      refresh,
      signOut,
    }),
    [internalId, profile, isLoading, error, refresh, signOut],
  );
}
