import { useMutation } from '@tanstack/react-query';
import { useStore } from '../../store/useStore';
import { socialAPI } from '../social';
import { supabase } from '../supabase';

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
      const { error } = await supabase
        .from('user_blocks')
        .insert([{ blocker_id: user.id, blocked_id: blockedId }]);

      if (error) throw error;
      return { success: true };
    },
  });

  const unblockMutation = useMutation({
    mutationFn: async (blockedId: string) => {
      if (!user) throw new Error('Unauthorized');
      const { error } = await supabase
        .from('user_blocks')
        .delete()
        .eq('blocker_id', user.id)
        .eq('blocked_id', blockedId);

      if (error) throw error;
      return { success: true };
    },
  });

  return {
    reportMutation,
    blockMutation,
    unblockMutation,
  };
}
