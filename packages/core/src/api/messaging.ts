import { applyTemporalFilter } from '@repo/core/logic/utils/temporalUtils';
import type { TemporalScale } from '@repo/core/store/useTemporalStore';
import { identityAPI } from '@repo/core/api/identity';
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from '@repo/core/api/supabase';

/**
 * Messaging API
 *
 * Handles direct conversations and peer-to-peer messaging.
 */
export const messagingAPI = {
  /**
   * @policy read User
   */
  async getDirectConversations() {
    const identity = await identityAPI.identifyActiveCitizen();
    if (!identity) throw new Error('Not authenticated');

    const { data, error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .from('direct_conversations')
      .select(`
                *,
                user1:users!direct_conversations_user1_id_fkey(full_name, avatar_url),
                user2:users!direct_conversations_user2_id_fkey(full_name, avatar_url)
            `)
      .or(`user1_id.eq.${identity.id},user2_id.eq.${identity.id}`)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((conv: any) => {
      const otherUser = conv.user1_id === identity.id ? conv.user2 : conv.user1;
      return {
        ...conv,
        other_user_name: otherUser?.full_name || 'Anonymous User',
        other_user_avatar: otherUser?.avatar_url,
      };
    });
  },

  /**
   * @policy create User
   */
  async getOrCreateDirectConversation(targetUserId: string): Promise<string> {
    const { data, error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__.rpc(
      'get_or_create_direct_conversation',
      {
        target_user_id: targetUserId,
      },
    );

    if (error) throw error;
    return data;
  },

  /**
   * @policy read User
   */
  async getDirectMessages(
    conversationId: string,
    limit = 60,
    viewDate?: string,
    viewScale?: TemporalScale,
  ) {
    let query = __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .from('direct_messages')
      .select('*, author:users!direct_messages_author_id_fkey(full_name, avatar_url)')
      .eq('conversation_id', conversationId);

    if (viewDate) {
      query = applyTemporalFilter(query, {
        column: 'created_at',
        mode: 'event_time',
        capability: 'event_stream',
        scale: viewScale,
      });
    } else {
      query = query.order('created_at', { ascending: false }).limit(limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).reverse();
  },

  /**
   * @policy create User
   */
  async sendDirectMessage(conversationId: string, content: string) {
    const identity = await identityAPI.identifyActiveCitizen();
    if (!identity) throw new Error('Not authenticated');

    const { data, error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .from('direct_messages')
      .insert([
        {
          conversation_id: conversationId,
          author_id: identity.id,
          content: content.trim(),
        },
      ])
      .select('*, author:users!direct_messages_author_id_fkey(full_name, avatar_url)')
      .single();

    if (error) throw error;
    return data;
  },
};
