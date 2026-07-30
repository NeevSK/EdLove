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
  async getPosts(filters: { limit: number; offset: number; groupId?: string }) {
    const res = await (client.api as any).community.posts.$get({
      query: {
        groupId: filters.groupId,
        limit: filters.limit.toString(),
        offset: filters.offset.toString(),
      },
    });

    if (!res.ok) {
      throw new APIError('Failed to fetch posts', res.status.toString());
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
  async createComment(postId: string, params: { content: string; author_tier: string }) {
    const res = await (client.api as any).community.posts[':postId'].comments.$post({
      param: { postId },
      json: params,
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
    });

    if (!res.ok) {
      throw new APIError('Failed to toggle upvote', res.status.toString());
    }

    return await res.json();
  },

  /**
   * Marks a comment as the official answer.
   */
  async markOfficialAnswer(commentId: string) {
    const res = await (client.api as any).community.comments[':commentId'].official.$post({
      param: { commentId },
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
  async voteInPoll(postId: string, optionId: string) {
    const res = await (client.api as any).community.polls[':postId'].vote.$post({
      param: { postId },
      json: { option_id: optionId },
    });

    if (!res.ok) {
      throw new APIError('Failed to record vote', res.status.toString());
    }

    return await res.json();
  },
};
