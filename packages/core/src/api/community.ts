import {
  CommunityPostSchema,
} from '../logic/schemas/community.schema';
import { applyTemporalFilter } from '../logic/utils/temporalUtils';
import type { TemporalScale } from '../store/useTemporalStore';
import type { Post } from '../types';
import { communityContract } from './community.contract';
import { growthSignalsAPI } from './growthSignals';
import { identityAPI } from './identity';
import { supabase } from './supabase';

/**
 * Community API (Posts & Comments)
 *
 * Primary API for community feed interactions.
 * Extracted domains: announcementAPI, circleAPI, messagingAPI, socialAPI.
 */
export const communityAPI = {
  /**
   * @authority read Post
   */
  async getPosts(filters: {
    limit: number;
    offset: number;
    groupId?: string;
    viewDate?: string;
    viewScale?: TemporalScale;
  }) {
    let query = supabase
      .from('community_posts_with_counts')
      .select('*')
      .range(filters.offset, filters.offset + filters.limit - 1);

    if (filters.viewDate) {
      query = applyTemporalFilter(query, {
        column: 'created_at',
        mode: 'event_time',
        capability: 'event_stream',
        scale: filters.viewScale,
      });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    if (filters.groupId && filters.groupId !== 'all') {
      query = query.eq('group_id', filters.groupId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map((p) => CommunityPostSchema.parse(p));
  },

  /**
   * @authority create Post
   */
  async createPost(post: Partial<Post>, userId: string, authorityTier: string, schoolId: string) {
    const { data, error } = await supabase
      .from('community_posts')
      .insert([
        {
          ...post,
          author_id: userId,
          author_tier: authorityTier,
          school_id: schoolId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;

    growthSignalsAPI.emitSilent({
      user_id: userId,
      event_type: 'community_post_created',
      event_metadata: {
        post_id: data?.id,
        school_id: schoolId,
      },
    });

    return CommunityPostSchema.parse(data);
  },

  /**
   * @authority create Post
   */
  async togglePostReaction(postId: string, userId: string): Promise<boolean> {
    const { data: existing } = await supabase
      .from('community_reactions')
      .select('user_id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('community_reactions')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);
      return false;
    } else {
      await supabase
        .from('community_reactions')
        .insert([{ post_id: postId, user_id: userId, emoji: 'd' }]);
      return true;
    }
  },

  /**
   * @authority create Post
   */
  async voteInPoll(
    postId: string,
    optionId: string,
    allowMultiple: boolean = false,
  ): Promise<string[]> {
    const myId = await identityAPI.getMyInternalId();
    if (!myId) throw new Error('Authentication required');

    const { data: existing, error: fetchErr } = await supabase
      .from('community_poll_votes')
      .select('option_id')
      .eq('post_id', postId)
      .eq('user_id', myId);

    if (fetchErr) throw new Error(fetchErr.message);

    const existingIds: string[] = (existing ?? []).map((r: any) => r.option_id);
    const alreadyVotedThis = existingIds.includes(optionId);

    if (allowMultiple) {
      if (alreadyVotedThis) {
        await supabase
          .from('community_poll_votes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', myId)
          .eq('option_id', optionId);
        return existingIds.filter((id) => id !== optionId);
      } else {
        await supabase
          .from('community_poll_votes')
          .insert({ post_id: postId, user_id: myId, option_id: optionId });
        return [...existingIds, optionId];
      }
    } else {
      if (alreadyVotedThis) {
        await supabase
          .from('community_poll_votes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', myId);
        return [];
      } else {
        await supabase
          .from('community_poll_votes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', myId);
        await supabase
          .from('community_poll_votes')
          .insert({ post_id: postId, user_id: myId, option_id: optionId });
        return [optionId];
      }
    }
  },

  /**
   * @authority read Post
   */
  async getComments(
    postId: string,
    limit = 60,
    options: { viewDate?: string; viewScale?: TemporalScale } = {},
  ) {
    let query = supabase
      .from('community_comments')
      .select('*, author:users!community_comments_author_id_fkey(full_name, avatar_url, role)')
      .eq('post_id', postId);

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

    return (data || []).reverse();
  },

  /**
   * @authority create Post
   */
  async createComment(postId: string, content: string, isAnonymous = false) {
    const myId = await identityAPI.getMyInternalId();
    if (!myId) throw new Error('Authentication required');

    const { data, error } = await supabase
      .from('community_comments')
      .insert({
        post_id: postId,
        author_id: myId,
        content: content.trim(),
        is_anonymous: isAnonymous,
      })
      .select('*, author:users!community_comments_author_id_fkey(full_name, avatar_url, role)')
      .single();

    if (error) throw error;

    supabase.rpc('increment_comment_count', { p_post_id: postId }).then(({ error: rpcError }) => {
      if (rpcError)
        console.warn('[communityAPI] increment_comment_count failed:', rpcError.message);
    });

    return data;
  },

  /**
   * @authority delete Post
   */
  async deleteComment(commentId: string) {
    const { error } = await supabase.from('community_comments').delete().eq('id', commentId);
    if (error) throw error;
  },

  /**
   * @authority update Post
   */
  async toggleCommentUpvote(commentId: string) {
    const myId = await identityAPI.getMyInternalId();
    if (!myId) throw new Error('Authentication required');

    const { data: existing } = await supabase
      .from('community_comment_upvotes')
      .select('comment_id')
      .eq('comment_id', commentId)
      .eq('user_id', myId)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('community_comment_upvotes')
        .delete()
        .eq('comment_id', commentId)
        .eq('user_id', myId);
      return false;
    }

    await supabase
      .from('community_comment_upvotes')
      .insert({ comment_id: commentId, user_id: myId });
    return true;
  },

  /**
   * @authority update Post
   */
  async markOfficialAnswer(commentId: string, isOfficial: boolean) {
    const { error } = await supabase
      .from('community_comments')
      .update({ is_official_answer: isOfficial })
      .eq('id', commentId);
    if (error) throw error;
  },
};

// Satisfy linter for architectural linking
void communityContract;
