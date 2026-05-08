import { community } from '../logic/managers/factory';
import { identityAPI } from './identity';
import { Post, Comment } from '../types';
import { TemporalScale } from '../store/useTemporalStore';

/**
 * Community API (Posts & Comments)
 * 
 * Thin delegation layer to the Sovereign Community Manager.
 */
export const communityAPI = {
  /**
   * Retrieves a list of posts based on filters.
   */
  async getPosts(filters: {
    limit: number;
    offset: number;
    groupId?: string;
    viewDate?: string;
    viewScale?: TemporalScale;
  }): Promise<Post[]> {
    return community.getPosts(filters);
  },

  /**
   * Creates a new post.
   */
  async createPost(post: Partial<Post>, userId: string, authorityTier: string, schoolId: string): Promise<Post> {
    return community.createPost({ post, userId, authorityTier, schoolId });
  },

  /**
   * Toggles a reaction on a post.
   */
  async togglePostReaction(postId: string, userId: string): Promise<boolean> {
    return community.togglePostReaction(postId, userId);
  },

  /**
   * Gets the current status of a poll.
   */
  async getPollStatus(postId: string) {
    const myId = await identityAPI.getMyInternalId();
    return community.getPollStatus(postId, myId || undefined);
  },

  /**
   * Votes in a poll.
   */
  async voteInPoll(
    postId: string,
    optionId: string,
    allowMultiple: boolean = false,
  ): Promise<string[]> {
    const myId = await identityAPI.getMyInternalId();
    if (!myId) throw new Error('Authentication required');

    return community.voteInPoll({
      postId,
      optionId,
      userId: myId,
      allowMultiple,
    });
  },

  /**
   * Retrieves comments for a post.
   */
  async getComments(
    postId: string,
    limit = 60,
    options: { viewDate?: string; viewScale?: TemporalScale } = {},
  ): Promise<Comment[]> {
    return community.getComments(postId, limit, options);
  },

  /**
   * Creates a comment on a post.
   */
  async createComment(postId: string, content: string, isAnonymous = false): Promise<Comment> {
    const myId = await identityAPI.getMyInternalId();
    if (!myId) throw new Error('Authentication required');

    return community.createComment({
      postId,
      content,
      userId: myId,
      isAnonymous,
    });
  },

  /**
   * Deletes a comment.
   */
  async deleteComment(commentId: string): Promise<void> {
    return community.deleteComment(commentId);
  },

  /**
   * Toggles an upvote on a comment.
   */
  async toggleCommentUpvote(commentId: string): Promise<boolean> {
    const myId = await identityAPI.getMyInternalId();
    if (!myId) throw new Error('Authentication required');

    return community.toggleCommentUpvote(commentId, myId);
  },

  /**
   * Marks or unmarks a comment as an official answer.
   */
  async markOfficialAnswer(commentId: string, isOfficial: boolean): Promise<void> {
    return community.markOfficialAnswer(commentId, isOfficial);
  },
};
