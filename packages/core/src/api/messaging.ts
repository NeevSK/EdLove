import { applyTemporalFilter } from '../logic/utils/temporalUtils';
import type { TemporalScale } from '../store/useTemporalStore';
import { identityAPI } from './identity';
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from './supabase';

/**
 * Messaging API
 *
 * Handles direct conversations and peer-to-peer messaging.
 */
export const messagingAPI = {
  /**
   * @authority read User
   */
  async getDirectConversations() {
    const userId = await identityAPI.getMyInternalId();
    if (!userId) throw new Error('Not authenticated');

    const { data, error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .from('direct_conversations')
      .select(`
                *,
                user1:users!direct_conversations_user1_id_fkey(full_name, avatar_url),
                user2:users!direct_conversations_user2_id_fkey(full_name, avatar_url)
            `)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((conv: any) => {
      const otherUser = conv.user1_id === userId ? conv.user2 : conv.user1;
      return {
        ...conv,
        other_user_name: otherUser?.full_name || 'Anonymous User',
        other_user_avatar: otherUser?.avatar_url,
      };
    });
  },

  /**
   * @authority create User
   */
  async getOrCreateDirectConversation(targetUserId: string): Promise<string> {
    const { data, error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__.rpc('get_or_create_direct_conversation', {
      target_user_id: targetUserId,
    });

    if (error) throw error;
    return data;
  },

  /**
   * @authority read User
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
   * @authority create User
   */
  async sendDirectMessage(conversationId: string, content: string) {
    const userId = await identityAPI.getMyInternalId();
    if (!userId) throw new Error('Not authenticated');

    const { data, error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .from('direct_messages')
      .insert([
        {
          conversation_id: conversationId,
          author_id: userId,
          content: content.trim(),
        },
      ])
      .select('*, author:users!direct_messages_author_id_fkey(full_name, avatar_url)')
      .single();

    if (error) throw error;
    return data;
  },
};
