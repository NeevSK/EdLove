import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sacredMissionsAPI, SanctuaryManifesto } from '../lib/api/sacredMissions';

export const MANIFESTO_KEYS = {
    all: ['manifestos'] as const,
    school: (schoolId: string) => [...MANIFESTO_KEYS.all, 'school', schoolId] as const,
};

export const useManifestos = (schoolId: string, userId?: string) => {
    const queryClient = useQueryClient();

    const manifestosQuery = useQuery({
        queryKey: MANIFESTO_KEYS.school(schoolId),
        queryFn: () => sacredMissionsAPI.getManifestos(schoolId, userId),
        enabled: !!schoolId,
    });

    const endorseMutation = useMutation({
        mutationFn: ({ manifestoId, commitment }: { manifestoId: string; commitment?: string }) =>
            sacredMissionsAPI.endorseManifesto(manifestoId, userId!, commitment),
        onMutate: async ({ manifestoId }) => {
            await queryClient.cancelQueries({ queryKey: MANIFESTO_KEYS.school(schoolId) });
            const previousManifestos = queryClient.getQueryData<SanctuaryManifesto[]>(MANIFESTO_KEYS.school(schoolId));

            if (previousManifestos) {
                queryClient.setQueryData<SanctuaryManifesto[]>(MANIFESTO_KEYS.school(schoolId), (old) =>
                    old?.map(m => m.id === manifestoId
                        ? { ...m, has_endorsed: true, endorsement_count: (m.endorsement_count || 0) + 1 }
                        : m
                    )
                );
            }
            return { previousManifestos };
        },
        onError: (err, newTodo, context) => {
            if (context?.previousManifestos) {
                queryClient.setQueryData(MANIFESTO_KEYS.school(schoolId), context.previousManifestos);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: MANIFESTO_KEYS.school(schoolId) });
        },
    });

    const unendorseMutation = useMutation({
        mutationFn: (manifestoId: string) =>
            sacredMissionsAPI.unendorseManifesto(manifestoId, userId!),
        onMutate: async (manifestoId) => {
            await queryClient.cancelQueries({ queryKey: MANIFESTO_KEYS.school(schoolId) });
            const previousManifestos = queryClient.getQueryData<SanctuaryManifesto[]>(MANIFESTO_KEYS.school(schoolId));

            if (previousManifestos) {
                queryClient.setQueryData<SanctuaryManifesto[]>(MANIFESTO_KEYS.school(schoolId), (old) =>
                    old?.map(m => m.id === manifestoId
                        ? { ...m, has_endorsed: false, endorsement_count: Math.max((m.endorsement_count || 0) - 1, 0) }
                        : m
                    )
                );
            }
            return { previousManifestos };
        },
        onError: (err, newTodo, context) => {
            if (context?.previousManifestos) {
                queryClient.setQueryData(MANIFESTO_KEYS.school(schoolId), context.previousManifestos);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: MANIFESTO_KEYS.school(schoolId) });
        },
    });

    return {
        manifestos: manifestosQuery.data || [],
        isLoading: manifestosQuery.isLoading,
        error: manifestosQuery.error,
        refetch: manifestosQuery.refetch,
        endorse: endorseMutation.mutate,
        unendorse: unendorseMutation.mutate,
        isEndorsing: endorseMutation.isPending,
    };
};
