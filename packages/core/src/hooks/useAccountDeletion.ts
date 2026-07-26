import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authAPI } from '@/api/auth';

/**
 * Hook for managing the account deletion workflow.
 * Handles the RPC call and cache clearing.
 */
export function useAccountDeletion() {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => authAPI.deleteAccount(),
    onSuccess: () => {
      // Clear all data from React Query cache
      queryClient.clear();
    },
  });

  return {
    deleteAccount: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    error: deleteMutation.error as Error | null,
    reset: deleteMutation.reset,
  };
}
