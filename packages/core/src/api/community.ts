import { APIError } from '@repo/core/types/API';
import { type AppType, createSovereignClient, SOVEREIGN_API_URL } from '@repo/core/api/base';

/**
 * COMMUNITY API (Sovereign RPC Proxy)
 *
 * This module siphons Community requests (Posts, Reactions, Comments, Polls) to the Sanctuary API.
 */

const client = createSovereignClient<AppType>(SOVEREIGN_API_URL);

export const communityAPI = {
  /**
   * Retrieves a list of posts based on filters.
   */
  async getPosts(filters: { limit: number; offset: number; groupId?: string; viewDate?: string }) {
    const res = await (client.api as any).community.posts.$get({
      query: {
        groupId: filters.groupId,
        limit: filters.limit.toString(),
        offset: filters.offset.toString(),
        viewDate: filters.viewDate,
      },
    });

    if (!res.ok) {
      throw new APIError('Failed to fetch posts', res.status.toString());
    }

    return await res.json();
  },

  async getGroupMessages(groupId: string, limit = 60, viewDate?: string) {
    const res = await (client.api as any).community.groups[':groupId'].messages.$get({
      param: { groupId },
      query: { limit, viewDate },
    });
    if (!res.ok) throw new APIError('Failed to fetch group messages', res.status.toString());
    return await res.json();
  },

  async sendGroupMessage(groupId: string, content: string) {
    const res = await (client.api as any).community.groups[':groupId'].messages.$post({
      param: { groupId },
      json: { content },
    });
    if (!res.ok) throw new APIError('Failed to send group message', res.status.toString());
    return await res.json();
  },

  async updateMemberStatus(groupId: string, userId: string, status: 'active' | 'rejected' | 'pending') {
    const res = await (client.api as any).community.groups[':groupId'].members.status.$patch({
      param: { groupId },
      json: { groupId, userId, status },
    });
    if (!res.ok) throw new APIError('Failed to update member status', res.status.toString());
    return await res.json();
  },

  async updateGroupPolicy(groupId: string, joinPolicy: string) {
    const res = await (client.api as any).community.groups[':groupId'].policy.$patch({
      param: { groupId },
      json: { groupId, joinPolicy },
    });
    if (!res.ok) throw new APIError('Failed to update group policy', res.status.toString());
    return await res.json();
  },

  async getGroupMembers(groupId: string, status?: string) {
    const res = await (client.api as any).community.groups[':groupId'].members.$get({
      param: { groupId },
      query: { status },
    });
    if (!res.ok) throw new APIError('Failed to fetch group members', res.status.toString());
    return await res.json();
  },

  async updateMemberRole(groupId: string, userId: string, role: string) {
    const res = await (client.api as any).community.groups[':groupId'].members.role.$patch({
      param: { groupId },
      json: { groupId, userId, role },
    });
    if (!res.ok) throw new APIError('Failed to update member role', res.status.toString());
    return await res.json();
  },

  async approveAllMembers(groupId: string) {
    const res = await (client.api as any).community.groups[':groupId'].members['approve-all'].$post({
      param: { groupId },
      json: { groupId },
    });
    if (!res.ok) throw new APIError('Failed to approve group members', res.status.toString());
    return await res.json();
  },

  async getCommunityResonance(userId: string, options: { viewDate?: string } = {}) {
    const res = await (client.api as any).community.resonance[':userId'].$get({
      param: { userId },
      query: { viewDate: options.viewDate },
    });
    if (!res.ok) {
      throw new APIError('Failed to fetch community resonance', res.status.toString());
    }
    return await res.json();
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
    const res = await (client.api as any).community.report.$post({
      json: params,
    });
    if (!res.ok) {
      throw new APIError('Failed to report community content', res.status.toString());
    }
    return await res.json();
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
    const res = await (client.api as any).community.posts.$post({
      json: params,
    });

    if (!res.ok) {
      throw new APIError('Failed to create post', res.status.toString());
    }

    return await res.json();
  },

  /**
   * Toggles a reaction on a post.
   */
  async togglePostReaction(postId: string, userId: string) {
    const res = await (client.api as any).community.posts[':postId'].reactions.$post({
      param: { postId },
      json: { user_id: userId },
    });

    if (!res.ok) {
      throw new APIError('Failed to toggle reaction', res.status.toString());
    }

    const { active } = await res.json();
    return active;
  },

  /**
   * Retrieves comments for a post.
   */
  async getComments(postId: string, limit?: number) {
    const res = await (client.api as any).community.posts[':postId'].comments.$get({
      param: { postId },
      query: { limit: limit?.toString() },
    });

    if (!res.ok) {
      throw new APIError('Failed to fetch comments', res.status.toString());
    }

    return await res.json();
  },

  /**
   * Creates a comment on a post.
   */
  async createComment(
    postId: string,
    params: { content: string; author_tier?: string; isAnonymous?: boolean },
  ) {
    const res = await (client.api as any).community.posts[':postId'].comments.$post({
      param: { postId },
      json: {
        postId,
        content: params.content,
        isAnonymous: params.isAnonymous,
      },
    });

    if (!res.ok) {
      throw new APIError('Failed to create comment', res.status.toString());
    }

    return await res.json();
  },

  /**
   * Deletes a comment.
   */
  async deleteComment(commentId: string) {
    const res = await (client.api as any).community.comments[':commentId'].$delete({
      param: { commentId },
      json: { commentId },
    });

    if (!res.ok) {
      throw new APIError('Failed to delete comment', res.status.toString());
    }

    return await res.json();
  },

  /**
   * Toggles upvote on a comment.
   */
  async toggleCommentUpvote(commentId: string) {
    const res = await (client.api as any).community.comments[':commentId'].upvote.$post({
      param: { commentId },
      json: { commentId },
    });

    if (!res.ok) {
      throw new APIError('Failed to toggle upvote', res.status.toString());
    }

    return await res.json();
  },

  /**
   * Marks a comment as the official answer.
   */
  async markOfficialAnswer(commentId: string, isOfficial?: boolean) {
    const res = await (client.api as any).community.comments[':commentId'].official.$post({
      param: { commentId },
      json: { commentId, isOfficial },
    });

    if (!res.ok) {
      throw new APIError('Failed to mark official answer', res.status.toString());
    }

    return await res.json();
  },

  /**
   * Retrieves poll status for a post.
   */
  async getPollStatus(postId: string) {
    const res = await (client.api as any).community.polls[':postId'].$get({
      param: { postId },
    });

    if (!res.ok) {
      throw new APIError('Failed to fetch poll status', res.status.toString());
    }

    return await res.json();
  },

  /**
   * Votes in a poll.
   */
  async voteInPoll(postId: string, optionId: string, allowMultiple = false) {
    const res = await (client.api as any).community.polls[':postId'].vote.$post({
      param: { postId },
      json: { optionId, allowMultiple },
    });

    if (!res.ok) {
      throw new APIError('Failed to record vote', res.status.toString());
    }

    return await res.json();
  },

  async updatePost(postId: string, content: string) {
    const res = await (client.api as any).community.posts[':postId'].$patch({
      param: { postId },
      json: { postId, content: content.trim() },
    });
    if (!res.ok) throw new APIError('Failed to update post', res.status.toString());
    return await res.json();
  },

  async deletePost(postId: string) {
    const res = await (client.api as any).community.posts[':postId'].$delete({
      param: { postId },
      json: { postId },
    });
    if (!res.ok) throw new APIError('Failed to delete post', res.status.toString());
    return await res.json();
  },
};
