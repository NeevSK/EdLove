import { applyTemporalFilter } from '../logic/utils/temporalUtils';
import type { TemporalScale } from '../store/useTemporalStore';
import { identityAPI } from './identity';
import { supabase } from './supabase';

/**
 * Social & Safety API
 *
 * Unified API for community interactions (resonance, notifications)
 * and safety interactions (blocking, reporting).
 */
export const socialAPI = {
  // --- Community Resonance & Notifications ---

  /**
   * @authority read Post
   */
  async getCommunityResonance(
    userId: string,
    options: { viewDate?: string; viewScale?: TemporalScale } = {},
  ) {
    let query = supabase
      .from('community_posts')
      .select('likes_count, comments_count, shares_count')
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
        likes: acc.likes + (curr.likes_count || 0),
        comments: acc.comments + (curr.comments_count || 0),
        shares: acc.shares + (curr.shares_count || 0),
      }),
      { likes: 0, comments: 0, shares: 0 },
    );
  },

  /**
   * @authority read User
   */
  async getNotifications(
    limit = 30,
    options: { viewDate?: string; viewScale?: TemporalScale } = {},
  ) {
    const myId = await identityAPI.getMyInternalId();
    if (!myId) return [];

    let query = supabase.from('notifications').select('*').eq('user_id', myId);

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
   * @authority read User
   */
  async getUnreadNotificationCount() {
    const myId = await identityAPI.getMyInternalId();
    if (!myId) return 0;

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', myId)
      .eq('is_read', false);

    if (error) return 0;
    return count ?? 0;
  },

  /**
   * @authority update User
   */
  async markNotificationRead(notificationId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId);
    if (error) throw error;
  },

  /**
   * @authority update User
   */
  async markAllNotificationsRead() {
    const myId = await identityAPI.getMyInternalId();
    if (!myId) return;

    const { error } = await supabase
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
    const myId = await identityAPI.getMyInternalId();
    if (!myId) throw new Error('Authentication required');

    const { error } = await supabase.from('user_blocks').insert([
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
    const myId = await identityAPI.getMyInternalId();
    if (!myId) throw new Error('Authentication required');

    const { error } = await supabase
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
    const myId = await identityAPI.getMyInternalId();
    if (!myId) return false;

    const { data, error } = await supabase
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
    const myId = await identityAPI.getMyInternalId();
    if (!myId) return [];

    const { data, error } = await supabase
      .from('user_blocks')
      .select(`
                blocked_id, 
                blocked:users(
                    id, 
                    full_name, 
                    avatar_url,
                    authority:role
                )
            `)
      .eq('blocker_id', myId);

    if (error) throw error;
    return (data || []).map((b: any) => b.blocked).filter(Boolean);
  },

  /**
   * @authority create User
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
    const { data, error } = await supabase
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
