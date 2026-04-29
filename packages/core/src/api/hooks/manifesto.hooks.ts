import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { sacredMissionsAPI } from '../sacredMissions';

export const manifestoKeys = {
  all: ['manifestos'] as const,
  school: (schoolId: string) => [...manifestoKeys.all, 'school', schoolId] as const,
};

/**
 * Hook for managing school manifestos, promoted to @repo/core.
 */
export function useManifestoHooks(schoolId: string | undefined, userId?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: manifestoKeys.school(schoolId!),
    queryFn: () => sacredMissionsAPI.getManifestos(schoolId!, userId),
    enabled: !!schoolId,
  });

  const endorseMutation = useMutation({
    mutationFn: ({ manifestoId, commitment }: { manifestoId: string; commitment?: string }) =>
      sacredMissionsAPI.endorseManifesto(manifestoId, userId!, commitment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manifestoKeys.school(schoolId!) });
    },
  });

  const unendorseMutation = useMutation({
    mutationFn: (manifestoId: string) => sacredMissionsAPI.unendorseManifesto(manifestoId, userId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manifestoKeys.school(schoolId!) });
    },
  });

  return {
    manifestos: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    endorse: endorseMutation.mutate,
    unendorse: unendorseMutation.mutate,
    isEndorsing: endorseMutation.isPending,
  };
}
