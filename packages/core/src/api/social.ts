import { applyTemporalFilter } from '@repo/core/logic/utils/temporalUtils';
import type { TemporalScale } from '@repo/core/store/useTemporalStore';
import { identityAPI } from '@repo/core/api/identity';
import { supabaseClient } from '@repo/core/adapters/supabaseClient';

/**
 * Social & Safety API
 *
 * Unified API for community interactions (resonance, notifications)
 * and safety interactions (blocking, reporting).
 */
export const socialAPI = {
  // --- Community Resonance & Notifications ---

  /**
   * @policy read Post
   */
  async getCommunityResonance(
    userId: string,
    options: { viewDate?: string; viewScale?: TemporalScale } = {},
  ) {
    let query = supabaseClient
      .from('community_posts_with_counts')
      .select('reaction_count, comment_count')
      .eq('author_id', userId);

    if (options.viewDate) {
      query = applyTemporalFilter(query, {
        column: 'created_at',
        mode: 'event_time',
        capability: 'event_stream',
        scale: options.viewScale,
      });
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).reduce(
      (acc, curr: any) => ({
        likes: acc.likes + (curr.reaction_count || 0),
        comments: acc.comments + (curr.comment_count || 0),
        shares: acc.shares,
      }),
      { likes: 0, comments: 0, shares: 0 },
    );
  },

  /**
   * @policy read User
   */
  async getNotifications(
    limit = 30,
    options: { viewDate?: string; viewScale?: TemporalScale } = {},
  ) {
    const identity = await identityAPI.identifyActiveCitizen();
    const myId = identity?.id;
    if (!myId) return [];

    let query = supabaseClient
      .from('notifications')
      .select('*')
      .eq('user_id', myId);

    if (options.viewDate) {
      query = applyTemporalFilter(query, {
        column: 'created_at',
        mode: 'event_time',
        capability: 'event_stream',
        scale: options.viewScale,
      });
    } else {
      query = query.order('created_at', { ascending: false }).limit(limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  /**
   * @policy read User
   */
  async getUnreadNotificationCount() {
    const identity = await identityAPI.identifyActiveCitizen();
    const myId = identity?.id;
    if (!myId) return 0;

    const { count, error } = await supabaseClient
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', myId)
      .eq('is_read', false);

    if (error) return 0;
    return count ?? 0;
  },

  /**
   * @policy update User
   */
  async markNotificationRead(notificationId: string) {
    const { error } = await supabaseClient
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId);
    if (error) throw error;
  },

  /**
   * @policy update User
   */
  async markAllNotificationsRead() {
    const identity = await identityAPI.identifyActiveCitizen();
    const myId = identity?.id;
    if (!myId) return;

    const { error } = await supabaseClient
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', myId)
      .eq('is_read', false);
    if (error) throw error;
  },

  // --- Safety & Moderation ---

  /**
   * Blocks a user.
   */
  async blockUser(targetUserId: string): Promise<void> {
    const identity = await identityAPI.identifyActiveCitizen();
    const myId = identity?.id;
    if (!myId) throw new Error('Authentication required');

    const { error } = await supabaseClient.from('user_blocks').insert([
      {
        blocker_id: myId,
        blocked_id: targetUserId,
      },
    ]);

    if (error && error.code !== '23505') throw error;
  },

  /**
   * Unblocks a user.
   */
  async unblockUser(targetUserId: string): Promise<void> {
    const identity = await identityAPI.identifyActiveCitizen();
    const myId = identity?.id;
    if (!myId) throw new Error('Authentication required');

    const { error } = await supabaseClient
      .from('user_blocks')
      .delete()
      .eq('blocker_id', myId)
      .eq('blocked_id', targetUserId);

    if (error) throw error;
  },

  /**
   * Checks if a blocking relationship exists between the current user and target user.
   */
  async isBlockingActive(targetUserId: string): Promise<boolean> {
    const identity = await identityAPI.identifyActiveCitizen();
    const myId = identity?.id;
    if (!myId) return false;

    const { data, error } = await supabaseClient
      .from('user_blocks')
      .select('blocker_id')
      .or(
        `and(blocker_id.eq.${myId},blocked_id.eq.${targetUserId}),and(blocker_id.eq.${targetUserId},blocked_id.eq.${myId})`,
      )
      .maybeSingle();

    if (error) throw error;
    return !!data;
  },

  /**
   * Fetches the list of users blocked by the current user.
   */
  async getMutedUsers() {
    const identity = await identityAPI.identifyActiveCitizen();
    const myId = identity?.id;
    if (!myId) return [];

    const { data, error } = await supabaseClient
      .from('user_blocks')
      .select(`
                blocked_id, 
                blocked:users(
                    id, 
                    full_name, 
                    avatar_url,
                    capacity
                )
            `)
      .eq('blocker_id', myId);

    if (error) throw error;
    return (data || []).map((b: any) => b.blocked).filter(Boolean);
  },

  /**
   * @policy create User
   */
  async reportContent(
    params: {
      postId?: string;
      groupId?: string;
      targetUserId?: string;
      reason: string;
      report_target: 'teacher' | 'principal' | 'platform';
    },
    reporterId: string,
  ) {
    const { data, error } = await supabaseClient
      .from('community_reports')
      .insert([
        {
          reporter_id: reporterId,
          post_id: params.postId,
          group_id: params.groupId,
          target_user_id: params.targetUserId,
          reason: params.reason,
          report_target: params.report_target,
          status: 'pending',
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
