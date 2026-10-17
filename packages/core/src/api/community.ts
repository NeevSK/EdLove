import { orpcClient } from '@repo/core/api/orpcClient';
import { APIError } from '@repo/core/types/API';

/**
 * COMMUNITY API (Sovereign oRPC Client)
 *
 * This module routes Community requests (Posts, Reactions, Comments, Polls)
 * directly through the typed Sanctuary oRPC client.
 */

export const communityAPI = {
  /**
   * Retrieves a list of posts based on filters.
   */
  async getPosts(filters: { limit: number; offset: number; groupId?: string; viewDate?: string }) {
    try {
      return await orpcClient.community.getPosts({
        query: {
          groupId: filters.groupId,
          limit: filters.limit,
          offset: filters.offset,
          viewDate: filters.viewDate,
        },
      });
    } catch (error: any) {
      throw new APIError(error?.message || 'Failed to fetch posts', error?.code || 'POSTS_FETCH_FAILED');
    }
  },

  async getGroupMessages(groupId: string, limit = 60, viewDate?: string) {
    try {
      return await orpcClient.community.getGroupMessages({
        params: { groupId },
        query: { limit, viewDate },
      });
    } catch (error: any) {
      throw new APIError(error?.message || 'Failed to fetch group messages', error?.code || 'MESSAGES_FETCH_FAILED');
    }
  },

  async sendGroupMessage(groupId: string, content: string) {
    try {
      return await orpcClient.community.sendGroupMessage({
        params: { groupId },
        body: { content },
      });
    } catch (error: any) {
      throw new APIError(error?.message || 'Failed to send group message', error?.code || 'MESSAGE_SEND_FAILED');
    }
  },

  async updateMemberStatus(
    groupId: string,
    userId: string,
    status: 'active' | 'rejected' | 'pending',
  ) {
    try {
      return await orpcClient.community.updateMemberStatus({
        params: { groupId },
        body: { userId, status },
      });
    } catch (error: any) {
      throw new APIError(error?.message || 'Failed to update member status', error?.code || 'MEMBER_STATUS_FAILED');
    }
  },

  async updateGroupPolicy(groupId: string, joinPolicy: string) {
    try {
      return await orpcClient.community.updateGroupPolicy({
        params: { groupId },
        body: { joinPolicy },
      });
    } catch (error: any) {
      throw new APIError(error?.message || 'Failed to update group policy', error?.code || 'GROUP_POLICY_FAILED');
    }
  },

  async getGroupMembers(groupId: string, status?: string) {
    try {
      return await orpcClient.community.getGroupMembers({
        params: { groupId },
        query: { status },
      });
    } catch (error: any) {
      throw new APIError(error?.message || 'Failed to fetch group members', error?.code || 'GROUP_MEMBERS_FAILED');
    }
  },

  async updateMemberRole(groupId: string, userId: string, role: string) {
    try {
      return await orpcClient.community.updateMemberRole({
        params: { groupId },
        body: { userId, role },
      });
    } catch (error: any) {
      throw new APIError(error?.message || 'Failed to update member role', error?.code || 'MEMBER_ROLE_FAILED');
    }
  },

  async approveAllMembers(groupId: string) {
    try {
      return await orpcClient.community.approveAllMembers({
        params: { groupId },
      });
    } catch (error: any) {
      throw new APIError(error?.message || 'Failed to approve group members', error?.code || 'APPROVE_MEMBERS_FAILED');
    }
  },

  async getCommunityResonance(userId: string, options: { viewDate?: string } = {}) {
    try {
      return await orpcClient.community.getCommunityResonance({
        params: { userId },
        query: { viewDate: options.viewDate },
      });
    } catch (error: any) {
      throw new APIError(error?.message || 'Failed to fetch community resonance', error?.code || 'RESONANCE_FETCH_FAILED');
    }
  },

  async reportContent(params: {
    postId?: string;
    groupId?: string;
    targetUserId?: string;
    reason: string;
    report_target: 'teacher' | 'principal' | 'platform';
    reporter_id?: string;
    details?: string;
  }) {
    try {
      return await orpcClient.community.reportContent({
        body: {
          postId: params.postId,
          groupId: params.groupId,
          targetUserId: params.targetUserId ?? null,
          reason: params.reason,
          details: params.details ?? null,
          reportTarget: params.report_target,
        },
      });
    } catch (error: any) {
      throw new APIError(error?.message || 'Failed to report community content', error?.code || 'REPORT_FAILED');
    }
  },

  /**
   * Creates a new post.
   */
  async createPost(params: {
    group_id: string;
    content: string;
    post_type: string;
    visibility: string;
    author_tier: string;
  }) {
    try {
      return await orpcClient.community.createPost({
        body: {
          groupId: params.group_id,
          content: params.content,
          postType: params.post_type || 'discussion',
          authorTier: params.author_tier || 'standard',
        },
      });
    } catch (error: any) {
      throw new APIError(error?.message || 'Failed to create post', error?.code || 'POST_CREATE_FAILED');
    }
  },

  /**
   * Toggles a reaction on a post.
   */
  async togglePostReaction(postId: string, _userId?: string) {
    try {
      const res = await orpcClient.community.toggleReaction({
        params: { postId },
      });
      return res.active;
    } catch (error: any) {
      throw new APIError(error?.message || 'Failed to toggle reaction', error?.code || 'REACTION_TOGGLE_FAILED');
    }
  },

  /**
   * Retrieves comments for a post.
   */
  async getComments(postId: string, limit?: number) {
    try {
      return await orpcClient.community.getComments({
        params: { postId },
        query: { limit },
      });
    } catch (error: any) {
      throw new APIError(error?.message || 'Failed to fetch comments', error?.code || 'COMMENTS_FETCH_FAILED');
    }
  },

  /**
   * Creates a comment on a post.
   */
  async createComment(
    postId: string,
    params: { content: string; author_tier?: string; isAnonymous?: boolean },
  ) {
    try {
      return await orpcClient.community.createComment({
        params: { postId },
        body: {
          content: params.content,
          isAnonymous: params.isAnonymous ?? false,
        },
      });
    } catch (error: any) {
      throw new APIError(error?.message || 'Failed to create comment', error?.code || 'COMMENT_CREATE_FAILED');
    }
  },

  /**
   * Deletes a comment.
   */
  async deleteComment(commentId: string) {
    try {
      return await orpcClient.community.deleteComment({
        params: { commentId },
      });
    } catch (error: any) {
      throw new APIError(error?.message || 'Failed to delete comment', error?.code || 'COMMENT_DELETE_FAILED');
    }
  },

  /**
   * Toggles upvote on a comment.
   */
  async toggleCommentUpvote(commentId: string) {
    try {
      return await orpcClient.community.toggleCommentUpvote({
        params: { commentId },
      });
    } catch (error: any) {
      throw new APIError(error?.message || 'Failed to toggle upvote', error?.code || 'UPVOTE_TOGGLE_FAILED');
    }
  },

  /**
   * Marks a comment as the official answer.
   */
  async markOfficialAnswer(commentId: string, _isOfficial?: boolean) {
    try {
      return await orpcClient.community.markOfficialAnswer({
        params: { commentId },
      });
    } catch (error: any) {
      throw new APIError(error?.message || 'Failed to mark official answer', error?.code || 'OFFICIAL_ANSWER_FAILED');
    }
  },

  /**
   * Retrieves poll status for a post.
   */
  async getPollStatus(postId: string) {
    try {
      return await orpcClient.community.getPollStatus({
        params: { postId },
      });
    } catch (error: any) {
      throw new APIError(error?.message || 'Failed to fetch poll status', error?.code || 'POLL_STATUS_FAILED');
    }
  },

  /**
   * Votes in a poll.
   */
  async voteInPoll(postId: string, optionId: string, allowMultiple = false) {
    try {
      return await orpcClient.community.voteInPoll({
        params: { postId },
        body: { optionId, allowMultiple },
      });
    } catch (error: any) {
      throw new APIError(error?.message || 'Failed to record vote', error?.code || 'POLL_VOTE_FAILED');
    }
  },

  async updatePost(postId: string, content: string) {
    try {
      return await orpcClient.community.updatePost({
        params: { postId },
        body: { content: content.trim() },
      });
    } catch (error: any) {
      throw new APIError(error?.message || 'Failed to update post', error?.code || 'POST_UPDATE_FAILED');
    }
  },

  async deletePost(postId: string) {
    try {
      return await orpcClient.community.deletePost({
        params: { postId },
      });
    } catch (error: any) {
      throw new APIError(error?.message || 'Failed to delete post', error?.code || 'POST_DELETE_FAILED');
    }
  },
};
