import { supabase } from '@repo/core/api';
import { useSocialShieldHooks } from '@repo/core/api/hooks';

import { useStore } from '@repo/core/store';
import { useCallback, useState } from 'react';

export type ReportTarget = 'teacher' | 'principal' | 'platform';

export function useSocialShield() {
  const user = useStore((state) => state.user);
  const [loading, setLoading] = useState(false);
  const { reportMutation, blockMutation, unblockMutation } = useSocialShieldHooks();

  const blockUser = useCallback(
    async (blockedId: string) => {
      setLoading(true);
      try {
        await blockMutation.mutateAsync(blockedId);
        return { success: true };
      } catch (error) {
        console.error('[SocialShield] Block Error:', error);
        return { success: false, error };
      } finally {
        setLoading(false);
      }
    },
    [blockMutation],
  );

  const unblockUser = useCallback(
    async (blockedId: string) => {
      setLoading(true);
      try {
        await unblockMutation.mutateAsync(blockedId);
        return { success: true };
      } catch (error) {
        console.error('[SocialShield] Unblock Error:', error);
        return { success: false, error };
      } finally {
        setLoading(false);
      }
    },
    [unblockMutation],
  );

  const toggleMute = useCallback(
    async (params: { conversationId?: string; groupId?: string; isMuted: boolean }) => {
      if (!user) return { success: false };
      setLoading(true);
      try {
        const { error } = await supabase.from('conversation_settings').upsert(
          [
            {
              user_id: user.id,
              conversation_id: params.conversationId,
              group_id: params.groupId,
              is_muted: params.isMuted,
            },
          ],
          { onConflict: 'user_id, conversation_id, group_id' },
        );

        if (error) throw error;
        return { success: true };
      } catch (error) {
        console.error('[SocialShield] Mute Error:', error);
        return { success: false, error };
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  const submitReport = useCallback(
    async (params: {
      postId?: string;
      groupId?: string;
      targetUserId?: string;
      reason: string;
      target: ReportTarget;
    }) => {
      setLoading(true);
      try {
        await reportMutation.mutateAsync({
          postId: params.postId,
          groupId: params.groupId,
          targetUserId: params.targetUserId,
          reason: params.reason,
          report_target: params.target,
        });
        return { success: true };
      } catch (error) {
        console.error('[SocialShield] Report Error:', error);
        return { success: false, error };
      } finally {
        setLoading(false);
      }
    },
    [reportMutation],
  );

  return {
    blockUser,
    unblockUser,
    toggleMute,
    submitReport,
    loading,
  };
}
