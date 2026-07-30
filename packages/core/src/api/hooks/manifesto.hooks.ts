import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { sacredMissionsAPI } from '@repo/core/api/sacredMissions';

export const manifestoKeys = {
  all: ['manifestos'] as const,
  school: (schoolId: string) => [...manifestoKeys.all, 'school', schoolId] as const,
};

/**
 * Hook for managing school manifestos, promoted to @repo/core.
 */
export function useManifestoHooks(schoolId: string | undefined, userId?: string) {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: manifestoKeys.school(schoolId!),
    queryFn: () => sacredMissionsAPI.getManifestos(schoolId!, userId),
    enabled: !!schoolId,
  });

  const endorseMutation = useMutation({
    mutationFn: ({ manifestoId, commitment }: { manifestoId: string; commitment?: string }) =>
      sacredMissionsAPI.endorseManifesto(manifestoId, userId!, commitment),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: manifestoKeys.school(schoolId!),
      });
    },
  });

  const unendorseMutation = useMutation({
    mutationFn: (manifestoId: string) => sacredMissionsAPI.unendorseManifesto(manifestoId, userId!),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: manifestoKeys.school(schoolId!),
      });
    },
  });

  return useMemo(
    () => ({
      manifestos: data || [],
      isLoading,
      error,
      refetch,
      endorse: endorseMutation.mutate,
      unendorse: unendorseMutation.mutate,
      isEndorsing: endorseMutation.isPending,
    }),
    [data, isLoading, error, refetch, endorseMutation, unendorseMutation],
  );
}
