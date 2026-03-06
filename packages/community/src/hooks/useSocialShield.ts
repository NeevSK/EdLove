import { useState, useCallback } from 'react';
import { supabase, useStore } from '@repo/core';
import { communityAPI } from '../api/community';
import { useLotusToast, hapticSuccess, hapticError } from '@repo/ui';

export type ReportTarget = 'teacher' | 'principal' | 'platform';

export function useSocialShield() {
    const { user } = useStore();
    const { showToast } = useLotusToast();
    const [loading, setLoading] = useState(false);

    /**
     * Block a user
     */
    const blockUser = useCallback(async (blockedId: string) => {
        if (!user) return;
        setLoading(true);
        try {
            const { error } = await supabase
                .from('user_blocks')
                .insert([{ blocker_id: user.id, blocked_id: blockedId }]);

            if (error) throw error;

            hapticSuccess();
            showToast({
                message: "User has been blocked. They can no longer see your content or message you.",
                type: 'success'
            });
        } catch (error) {
            console.error('[SocialShield] Block Error:', error);
            hapticError();
            showToast({ message: "Failed to block user.", type: 'error' });
        } finally {
            setLoading(false);
        }
    }, [user, showToast]);

    /**
     * Unblock a user
     */
    const unblockUser = useCallback(async (blockedId: string) => {
        if (!user) return;
        setLoading(true);
        try {
            const { error } = await supabase
                .from('user_blocks')
                .delete()
                .eq('blocker_id', user.id)
                .eq('blocked_id', blockedId);

            if (error) throw error;

            hapticSuccess();
            showToast({ message: "User has been unblocked.", type: 'success' });
        } catch (error) {
            console.error('[SocialShield] Unblock Error:', error);
            hapticError();
            showToast({ message: "Failed to unblock user.", type: 'error' });
        } finally {
            setLoading(false);
        }
    }, [user, showToast]);

    /**
     * Mute a conversation or group
     */
    const toggleMute = useCallback(async (params: { conversationId?: string; groupId?: string; isMuted: boolean }) => {
        if (!user) return;
        setLoading(true);
        try {
            const { error } = await supabase
                .from('conversation_settings')
                .upsert([{
                    user_id: user.id,
                    conversation_id: params.conversationId,
                    group_id: params.groupId,
                    is_muted: params.isMuted
                }], { onConflict: 'user_id, conversation_id, group_id' });

            if (error) throw error;

            hapticSuccess();
            showToast({
                message: params.isMuted ? "Notifications silenced for this sanctuary." : "Notifications restored.",
                type: 'success'
            });
        } catch (error) {
            console.error('[SocialShield] Mute Error:', error);
            hapticError();
            showToast({ message: "Failed to update mute settings.", type: 'error' });
        } finally {
            setLoading(false);
        }
    }, [user, showToast]);

    /**
     * Submit a report with specific target
     */
    const submitReport = useCallback(async (params: {
        postId?: string;
        groupId?: string;
        targetUserId?: string;
        reason: string;
        target: ReportTarget;
    }) => {
        if (!user) return;
        setLoading(true);
        try {
            await communityAPI.reportContent({
                post_id: params.postId,
                group_id: params.groupId,
                target_user_id: params.targetUserId,
                reason: params.reason,
                report_target: params.target
            }, user.id);

            hapticSuccess();
            showToast({
                message: "Thank you for sharing your concern. Our guardians will review this shortly.",
                type: 'success'
            });
            return true;
        } catch (error) {
            console.error('[SocialShield] Report Error:', error);
            hapticError();
            showToast({ message: "Failed to submit report.", type: 'error' });
            return false;
        } finally {
            setLoading(false);
        }
    }, [user, showToast]);

    return {
        blockUser,
        unblockUser,
        toggleMute,
        submitReport,
        loading
    };
}
