import { useMutation } from '@tanstack/react-query';
import { useStore } from '@/store/useStore';
import { socialAPI } from '@/api/social';

/**
 * Hook for social shielding (blocking, reporting) promoted to @repo/core.
 * Uses TanStack Query Mutations for better state handling and architectural parity.
 */
export function useSocialShieldHooks() {
  const { user } = useStore();

  const reportMutation = useMutation({
    mutationFn: (params: {
      postId?: string;
      groupId?: string;
      targetUserId?: string;
      reason: string;
      report_target: 'teacher' | 'principal' | 'platform';
    }) => {
      if (!user) throw new Error('Unauthorized');
      return socialAPI.reportContent(params, user.id);
    },
  });

  const blockMutation = useMutation({
    mutationFn: async (blockedId: string) => {
      if (!user) throw new Error('Unauthorized');
      return socialAPI.blockUser(blockedId);
    },
  });

  const unblockMutation = useMutation({
    mutationFn: async (blockedId: string) => {
      if (!user) throw new Error('Unauthorized');
      return socialAPI.unblockUser(blockedId);
    },
  });

  return {
    reportMutation,
    blockMutation,
    unblockMutation,
  };
}
