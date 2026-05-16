import { ICommunityRepository, PostFilters } from '../../logic/domains/community/ports';
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from '../../api/supabase';
import { CommunityPostSchema } from '../../logic/schemas/community.schema';
import { applyTemporalFilter } from '../../logic/utils/temporalUtils';
import { Post, Comment, PollStatus } from '../../types';
import { APIError } from '../../types/API';

export class SupabaseCommunityRepository implements ICommunityRepository {
  private get client() {
    return __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__;
  }

  async getPosts(filters: PostFilters): Promise<Post[]> {
    let query = this.client
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
    if (error) throw new APIError('Failed to fetch posts', error.code, error);
    return (data || []).map((p) => CommunityPostSchema.parse(p)) as Post[];
  }

  async createPost(params: {
    post: Partial<Post>;
    userId: string;
    capacity: string;
    schoolId: string;
  }): Promise<Post> {
    const { data, error } = await this.client
      .from('community_posts')
      .insert([
        {
          ...params.post,
          author_id: params.userId,
          author_tier: params.capacity,
          school_id: params.schoolId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw new APIError('Failed to create post', error.code, error);
    return CommunityPostSchema.parse(data) as Post;
  }

  async togglePostReaction(postId: string, userId: string): Promise<boolean> {
    const { data: existing } = await this.client
      .from('community_reactions')
      .select('user_id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      await this.client
        .from('community_reactions')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);
      return false;
    } else {
      await this.client
        .from('community_reactions')
        .insert([{ post_id: postId, user_id: userId, emoji: 'd' }]);
      return true;
    }
  }

  async getComments(postId: string, limit = 60, options: { viewDate?: string; viewScale?: any } = {}): Promise<Comment[]> {
    let query = this.client
      .from('community_comments')
      .select('*, author:users!community_comments_author_id_fkey(full_name, avatar_url, capacity)')
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
    if (error) throw new APIError('Failed to fetch comments', error.code, error);

    return (data || []).reverse() as Comment[];
  }

  async createComment(params: {
    postId: string;
    content: string;
    userId: string;
    isAnonymous?: boolean;
  }): Promise<Comment> {
    const { data, error } = await this.client
      .from('community_comments')
      .insert({
        post_id: params.postId,
        author_id: params.userId,
        content: params.content.trim(),
        is_anonymous: params.isAnonymous ?? false,
      })
      .select('*, author:users!community_comments_author_id_fkey(full_name, avatar_url, capacity)')
      .single();

    if (error) throw new APIError('Failed to create comment', error.code, error);

    // Async increment
    void this.client.rpc('increment_comment_count', { p_post_id: params.postId });

    return data as Comment;
  }

  async deleteComment(commentId: string): Promise<void> {
    const { error } = await this.client.from('community_comments').delete().eq('id', commentId);
    if (error) throw new APIError('Failed to delete comment', error.code, error);
  }

  async toggleCommentUpvote(commentId: string, userId: string): Promise<boolean> {
    const { data: existing } = await this.client
      .from('community_comment_upvotes')
      .select('comment_id')
      .eq('comment_id', commentId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      await this.client
        .from('community_comment_upvotes')
        .delete()
        .eq('comment_id', commentId)
        .eq('user_id', userId);
      return false;
    }

    const { error } = await this.client
      .from('community_comment_upvotes')
      .insert({ comment_id: commentId, user_id: userId });
    
    if (error) throw new APIError('Failed to upvote comment', error.code, error);
    return true;
  }

  async getPollStatus(postId: string, userId?: string): Promise<PollStatus> {
    const { data: countData, error: countError } = await this.client
      .from('community_poll_votes')
      .select('option_id')
      .eq('post_id', postId);

    if (countError) throw new APIError('Failed to fetch poll counts', countError.code, countError);

    const counts: Record<string, number> = {};
    let total = 0;
    (countData ?? []).forEach((v: any) => {
      counts[v.option_id] = (counts[v.option_id] ?? 0) + 1;
      total++;
    });

    let userVotes: string[] = [];
    if (userId) {
      const { data: myVotesData, error: myVotesError } = await this.client
        .from('community_poll_votes')
        .select('option_id')
        .eq('post_id', postId)
        .eq('user_id', userId);

      if (myVotesError) throw new APIError('Failed to fetch user votes', myVotesError.code, myVotesError);
      userVotes = (myVotesData ?? []).map((v: any) => v.option_id);
    }

    return {
      counts,
      totalVotes: total,
      userVotes,
    };
  }

  async voteInPoll(params: {
    postId: string;
    optionId: string;
    userId: string;
    allowMultiple?: boolean;
  }): Promise<string[]> {
    const { data: existing, error: fetchErr } = await this.client
      .from('community_poll_votes')
      .select('option_id')
      .eq('post_id', params.postId)
      .eq('user_id', params.userId);

    if (fetchErr) throw new APIError('Failed to fetch existing votes', fetchErr.code, fetchErr);

    const existingIds: string[] = (existing ?? []).map((r: any) => r.option_id);
    const alreadyVotedThis = existingIds.includes(params.optionId);

    if (params.allowMultiple) {
      if (alreadyVotedThis) {
        await this.client
          .from('community_poll_votes')
          .delete()
          .eq('post_id', params.postId)
          .eq('user_id', params.userId)
          .eq('option_id', params.optionId);
        return existingIds.filter((id) => id !== params.optionId);
      } else {
        await this.client
          .from('community_poll_votes')
          .insert({ post_id: params.postId, user_id: params.userId, option_id: params.optionId });
        return [...existingIds, params.optionId];
      }
    } else {
      // Toggle single vote
      if (alreadyVotedThis) {
        await this.client
          .from('community_poll_votes')
          .delete()
          .eq('post_id', params.postId)
          .eq('user_id', params.userId);
        return [];
      } else {
        // Remove other votes first
        await this.client
          .from('community_poll_votes')
          .delete()
          .eq('post_id', params.postId)
          .eq('user_id', params.userId);
        
        await this.client
          .from('community_poll_votes')
          .insert({ post_id: params.postId, user_id: params.userId, option_id: params.optionId });
        return [params.optionId];
      }
    }
  }

  async markOfficialAnswer(commentId: string, isOfficial: boolean): Promise<void> {
    const { error } = await this.client
      .from('community_comments')
      .update({ is_official_answer: isOfficial })
      .eq('id', commentId);
    if (error) throw new APIError('Failed to mark official answer', error.code, error);
  }

  async getAnnouncements(schoolId: string) {
    const { data, error } = await this.client
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

    if (error) throw new APIError('Failed to fetch announcements', error.code, error);

    return (data || []).map((announcement: any) => ({
      ...announcement,
      author_name: announcement.author?.full_name,
      author_avatar: announcement.author?.avatar_url,
    }));
  }

  async createAnnouncement(params: {
    schoolId: string;
    authorId: string;
    content: string;
    isPinned?: boolean;
  }) {
    const { data, error } = await this.client
      .from('announcements')
      .insert([
        {
          school_id: params.schoolId,
          author_id: params.authorId,
          content: params.content,
          is_pinned: params.isPinned ?? false,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw new APIError('Failed to create announcement', error.code, error);
    return data;
  }

  async getCommunityGroupByClassroom(classroomId: string) {
    const { data, error } = await this.client
      .from('community_groups')
      .select('*')
      .eq('classroom_id', classroomId)
      .maybeSingle();

    if (error) throw new APIError('Failed to fetch community group', error.code, error);
    return data;
  }

  async createGroupMembership(params: { groupId: string; userId: string; capacity: string; status: string }) {
    const { error } = await this.client
      .from('group_members')
      .insert([
        {
          group_id: params.groupId,
          user_id: params.userId,
          capacity: params.capacity,
          status: params.status,
        },
      ]);

    if (error) throw new APIError('Failed to create group membership', error.code, error);
  }

  async updateGroupMembership(groupId: string, userId: string, updates: { status?: string; capacity?: string }) {
    const { error } = await this.client
      .from('group_members')
      .update(updates)
      .eq('group_id', groupId)
      .eq('user_id', userId);

    if (error) throw new APIError('Failed to update group membership', error.code, error);
  }

  async deleteGroupMembership(groupId: string, userId: string) {
    const { error } = await this.client
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId);

    if (error) throw new APIError('Failed to delete group membership', error.code, error);
  }
}
