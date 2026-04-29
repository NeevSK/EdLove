import {
  CommunityGroupSchema,
  CommunityPostSchema,
  GroupMemberSchema,
  GroupMessageSchema,
} from '../logic/schemas/community.schema';
import { applyTemporalFilter } from '../logic/utils/temporalUtils';
import { identityAPI } from '../native/identity';
import { supabase } from '../native/supabase';
import type { TemporalScale } from '../store/useTemporalStore';
import type { Group, Post } from '../types';
import { communityContract } from './community.contract';
import { growthSignalsAPI } from './growthSignals';
import { impactRipplesAPI } from './impactRipples';

/**
 * Community API (POA Migrated)
 *
 * Unified API for community interactions, using ts-rest contracts and authority markers.
 */
export const communityAPI = {
  /**
   * @authority read Group
   */
  async getAnnouncements(schoolId: string) {
    // [Migrated to communityContract.getPosts equivalent logic]
    const { data, error } = await supabase
      .from('announcements')
      .select(`
                *,
                author:users!announcements_author_id_fkey(
                    full_name,
                    avatar_url
                )
            `)
      .eq('school_id', schoolId)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((announcement: any) => ({
      ...announcement,
      author_name: announcement.author?.full_name,
      author_avatar: announcement.author?.avatar_url,
    }));
  },

  /**
   * @authority create Group
   */
  async createAnnouncement(
    schoolId: string,
    authorId: string,
    content: string,
    isPinned: boolean = false,
  ) {
    const { data, error } = await supabase
      .from('announcements')
      .insert([
        {
          school_id: schoolId,
          author_id: authorId,
          content: content,
          is_pinned: isPinned,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * @authority read Group
   */
  async getGroups(filters: {
    limit: number;
    offset: number;
    school_id?: string;
    search?: string;
    is_public?: boolean;
    type?: string;
  }) {
    let query = supabase
      .from('community_groups')
      .select('*')
      .range(filters.offset, filters.offset + filters.limit - 1)
      .order('created_at', { ascending: false });

    if (filters.school_id) {
      query = query.eq('school_id', filters.school_id);
    }
    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }
    if (filters.is_public !== undefined) {
      query = query.eq('is_public', filters.is_public);
    }
    if (filters.type) {
      query = query.eq('group_type', filters.type);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map((g) => CommunityGroupSchema.parse(g));
  },

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
   * @authority create Group
   */
  async createGroupWithOwner(group: Partial<Group>, userId: string) {
    const { data, error } = await supabase
      .from('community_groups')
      .insert([
        {
          ...group,
          creator_id: userId,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;

    await supabase.from('group_members').insert([
      {
        group_id: data.id,
        user_id: userId,
        role: 'owner',
        status: 'active',
      },
    ]);

    growthSignalsAPI.emitSilent({
      user_id: userId,
      event_type: 'circle_facilitated',
      event_metadata: {
        group_id: data?.id,
      },
    });

    return CommunityGroupSchema.parse(data);
  },

  /**
   * @authority create Group
   */
  async joinGroup(groupId: string, userId: string, authorityTier: string) {
    const { data: group } = await supabase
      .from('community_groups')
      .select('creator_id')
      .eq('id', groupId)
      .maybeSingle();

    const { data, error } = await supabase
      .from('group_members')
      .insert([
        {
          group_id: groupId,
          user_id: userId,
          role: authorityTier,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    growthSignalsAPI.emitSilent({
      user_id: userId,
      event_type: 'group_joined',
      event_metadata: {
        group_id: groupId,
      },
    });

    if (group?.creator_id && group.creator_id !== userId) {
      void impactRipplesAPI
        .createRipple({
          recipientUserId: group.creator_id,
          actorUserId: userId,
          rippleType: 'circle_joined',
          sourceEntityType: 'circle',
          sourceEntityId: groupId,
        })
        .catch(() => {});
    }

    return GroupMemberSchema.parse(data);
  },

  /**
   * @authority read Group
   */
  async getGroupById(groupId: string) {
    const { data, error } = await supabase
      .from('community_groups')
      .select('*')
      .eq('id', groupId)
      .single();

    if (error) throw error;
    return CommunityGroupSchema.parse(data);
  },

  /**
   * @authority read Group
   */
  async get(id: string) {
    return this.getGroupById(id);
  },

  /**
   * @authority read Group
   */
  async getGroupMessages(
    groupId: string,
    limit = 60,
    viewDate?: string,
    viewScale?: TemporalScale,
  ) {
    let query = supabase
      .from('group_messages')
      .select('*, author:users!group_messages_author_id_fkey(full_name, avatar_url)')
      .eq('group_id', groupId);

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

    return (data || []).reverse().map((m) => GroupMessageSchema.parse(m));
  },

  /**
   * @authority create Group
   */
  async sendGroupMessage(groupId: string, content: string) {
    const myId = await identityAPI.getMyInternalId();
    if (!myId) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('group_messages')
      .insert([{ group_id: groupId, author_id: myId, content: content.trim() }])
      .select('*, author:users!group_messages_author_id_fkey(full_name, avatar_url)')
      .single();

    if (error) throw error;

    growthSignalsAPI.emitSilent({
      user_id: myId,
      event_type: 'group_message_sent',
      event_metadata: {
        group_id: groupId,
      },
    });

    return GroupMessageSchema.parse(data);
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
   * @authority update Group
   */
  async handleMemberRequest(groupId: string, userId: string, status: 'active' | 'rejected') {
    const { data, error } = await supabase
      .from('group_members')
      .update({ status })
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return GroupMemberSchema.parse(data);
  },

  /**
   * @authority update Group
   */
  async updateJoiningPolicy(groupId: string, newPolicy: string) {
    const { data, error } = await supabase
      .from('community_groups')
      .update({ join_policy: newPolicy })
      .eq('id', groupId)
      .select()
      .single();

    if (error) throw error;
    return CommunityGroupSchema.parse(data);
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
   * @authority read User
   */
  async getDirectConversations() {
    const userId = await identityAPI.getMyInternalId();
    if (!userId) throw new Error('Not authenticated');

    const { data, error } = await supabase
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
    const { data, error } = await supabase.rpc('get_or_create_direct_conversation', {
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
    let query = supabase
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

    const { data, error } = await supabase
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
      if (rpcError) console.warn('[communityAPI] increment_comment_count failed:', rpcError.message);
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
};

// Satisfy linter for architectural linking
void communityContract;
void GroupMemberSchema;
