import { useMutation, useQueryClient } from '@tanstack/react-query';
import { presenceAPI } from '../presence';

/**
 * Hook for managing community presence logic.
 * Promoted to @repo/core to ensure unified tracking across platforms.
 */
export function usePresenceHooks() {
  const _queryClient = useQueryClient();

  /**
   * Mark the current user as seen.
   */
  const markSeen = useMutation({
    mutationFn: (userId: string) => presenceAPI.markUserPresenceSeen(userId),
    onSuccess: () => {
      // Invalidate related presence queries if we implement them later
    },
  });

  return {
    markSeen,
  };
}

/**
 * Re-exporting core presence logic from the API layer for easy hook consumption.
 */
export { presenceAPI } from '../presence';
