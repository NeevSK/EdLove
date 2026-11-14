/**
 * @file packages/core/src/api/hooks/profile.hooks.ts
 * Sovereign TanStack Query v5 hooks bound to native oRPC v2 Profile contracts.
 */

import { orpc } from '../orpcClient';
import type { QueryClient } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';

export function useUserProfileQuery(userId?: string) {
  return useQuery<any>({
    ...orpc.profile.getUserProfile.queryOptions({
      input: { params: { id: userId || '00000000-0000-0000-0000-000000000000' } },
    }),
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSchoolPulseQuery(schoolId?: string, viewDate?: string) {
  const effectiveDate = viewDate || new Date().toISOString().split('T')[0]!;
  return useQuery<any>({
    ...orpc.profile.getSchoolPulse.queryOptions({
      input: {
        params: { id: schoolId || '00000000-0000-0000-0000-000000000000' },
        query: { view_date: effectiveDate },
      },
    }),
    enabled: Boolean(schoolId),
    staleTime: 60 * 1000,
  });
}

export function useJourneySnapshotQuery(userId?: string) {
  return useQuery<any>({
    ...orpc.profile.getJourneySnapshot.queryOptions({
      input: {
        params: { id: userId || '00000000-0000-0000-0000-000000000000' },
        query: {},
      },
    }),
    enabled: Boolean(userId),
    staleTime: 2 * 60 * 1000,
  });
}

export function useSocialLinksQuery(enabled = true) {
  return useQuery<any[]>({
    ...orpc.profile.getSocialLinks.queryOptions(),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Atomic invalidation for profile domain queries.
 */
export async function invalidateUserProfileQueries(queryClient: QueryClient, userId?: string) {
  if (userId) {
    await queryClient.invalidateQueries({
      queryKey: orpc.profile.getUserProfile.key({
        input: { params: { id: userId } },
      }),
    });
    await queryClient.invalidateQueries({
      queryKey: orpc.profile.getJourneySnapshot.key({
        input: { params: { id: userId }, query: {} },
      }),
    });
  } else {
    await queryClient.invalidateQueries({
      queryKey: orpc.profile.getUserProfile.key(),
    });
  }
}
