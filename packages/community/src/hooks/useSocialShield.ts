import { supabase } from '@repo/core/native';
import { useStore } from '@repo/core/store';
import { useCallback, useState } from 'react';
import { communityAPI } from '../api/community';

export type ReportTarget = 'teacher' | 'principal' | 'platform';

export function useSocialShield() {
  const { user } = useStore();
  const [loading, setLoading] = useState(false);

  /**
   * Block a user
   */
  const blockUser = useCallback(
    async (blockedId: string) => {
      if (!user) return;
      setLoading(true);
      try {
        const { error } = await supabase
          .from('user_blocks')
          .insert([{ blocker_id: user.id, blocked_id: blockedId }]);

        if (error) throw error;
        return { success: true };
      } catch (error) {
        console.error('[SocialShield] Block Error:', error);
        return { success: false, error };
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  /**
   * Unblock a user
   */
  const unblockUser = useCallback(
    async (blockedId: string) => {
      if (!user) return;
      setLoading(true);
      try {
        const { error } = await supabase
          .from('user_blocks')
          .delete()
          .eq('blocker_id', user.id)
          .eq('blocked_id', blockedId);

        if (error) throw error;
        return { success: true };
      } catch (error) {
        console.error('[SocialShield] Unblock Error:', error);
        return { success: false, error };
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  /**
   * Mute a conversation or group
   */
  const toggleMute = useCallback(
    async (params: { conversationId?: string; groupId?: string; isMuted: boolean }) => {
      if (!user) return;
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

  /**
   * Submit a report with specific target
   */
  const submitReport = useCallback(
    async (params: {
      postId?: string;
      groupId?: string;
      targetUserId?: string;
      reason: string;
      target: ReportTarget;
    }) => {
      if (!user) return;
      setLoading(true);
      try {
        await communityAPI.reportContent(
          {
            postId: params.postId,
            groupId: params.groupId,
            targetUserId: params.targetUserId,
            reason: params.reason,
            report_target: params.target,
          },
          user.id,
        );

        return { success: true };
      } catch (error) {
        console.error('[SocialShield] Report Error:', error);
        return { success: false, error };
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  return {
    blockUser,
    unblockUser,
    toggleMute,
    submitReport,
    loading,
  };
}
