import type { TemporalScale } from '@repo/core/store/useTemporalStore';
import type { Comment, PollStatus, Post } from '@repo/core/types';

export interface PostFilters {
  limit: number;
  offset: number;
  groupId?: string;
  viewDate?: string;
  viewScale?: TemporalScale;
}

export interface ICommunityRepository {
  /**
   * Retrieves a list of posts based on filters.
   */
  getPosts(filters: PostFilters): Promise<Post[]>;

  /**
   * Creates a new post.
   */
  createPost(params: {
    post: Partial<Post>;
    userId: string;
    capacity: string;
    schoolId: string;
  }): Promise<Post>;

  /**
   * Toggles a reaction on a post.
   * Returns true if reacted, false if reaction removed.
   */
  togglePostReaction(postId: string, userId: string): Promise<boolean>;

  /**
   * Retrieves comments for a post.
   */
  getComments(
    postId: string,
    limit?: number,
    options?: { viewDate?: string; viewScale?: TemporalScale },
  ): Promise<Comment[]>;

  /**
   * Creates a comment on a post.
   */
  createComment(params: {
    postId: string;
    content: string;
    userId: string;
    isAnonymous?: boolean;
  }): Promise<Comment>;

  /**
   * Deletes a comment.
   */
  deleteComment(commentId: string): Promise<void>;

  /**
   * Toggles an upvote on a comment.
   */
  toggleCommentUpvote(commentId: string, userId: string): Promise<boolean>;

  /**
   * Gets the current status of a poll.
   */
  getPollStatus(postId: string, userId?: string): Promise<PollStatus>;

  /**
   * Votes in a poll.
   * Returns the updated list of option IDs the user has voted for.
   */
  voteInPoll(params: {
    postId: string;
    optionId: string;
    userId: string;
    allowMultiple?: boolean;
  }): Promise<string[]>;

  /**
   * Marks or unmarks a comment as an official answer.
   */
  markOfficialAnswer(commentId: string, isOfficial: boolean): Promise<void>;

  // Announcements
  getAnnouncements(schoolId: string): Promise<any[]>;
  createAnnouncement(params: {
    schoolId: string;
    authorId: string;
    content: string;
    isPinned?: boolean;
  }): Promise<any>;

  // Groups and Memberships
  getCommunityGroupByClassroom(classroomId: string): Promise<any>;
  createGroupMembership(params: {
    groupId: string;
    userId: string;
    capacity: string;
    status: string;
  }): Promise<void>;
  updateGroupMembership(
    groupId: string,
    userId: string,
    updates: { status?: string; capacity?: string },
  ): Promise<void>;
  deleteGroupMembership(groupId: string, userId: string): Promise<void>;
}
