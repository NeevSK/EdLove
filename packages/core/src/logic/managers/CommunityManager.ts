import type { ICommunityRepository, PostFilters } from '@repo/core/logic/domains/community/ports';
import type { GrowthManager } from '@repo/core/logic/managers/GrowthManager';
import type { Comment, PollStatus, Post } from '@repo/core/types';

/**
 * CommunityManager
 *
 * Domain manager for community interactions (Posts, Comments, Polls).
 * Orchestrates repository access and cross-domain side-effects (e.g. Growth Signals).
 */
export class CommunityManager {
  constructor(
    private repo: ICommunityRepository,
    private growth: GrowthManager,
  ) {}

  async getPosts(filters: PostFilters): Promise<Post[]> {
    return this.repo.getPosts(filters);
  }

  async createPost(params: {
    post: Partial<Post>;
    userId: string;
    capacity: string;
    schoolId: string;
  }): Promise<Post> {
    const post = await this.repo.createPost(params);

    // Side-effect: Emit growth signal
    void this.growth.emitSilent({
      user_id: params.userId,
      event_type: 'community_post_created',
      event_metadata: {
        post_id: post.id,
        school_id: params.schoolId,
      },
    });

    return post;
  }

  async togglePostReaction(postId: string, userId: string): Promise<boolean> {
    return this.repo.togglePostReaction(postId, userId);
  }

  async getComments(
    postId: string,
    limit?: number,
    options?: { viewDate?: string; viewScale?: any },
  ): Promise<Comment[]> {
    return this.repo.getComments(postId, limit, options);
  }

  async createComment(params: {
    postId: string;
    content: string;
    userId: string;
    isAnonymous?: boolean;
  }): Promise<Comment> {
    return this.repo.createComment(params);
  }

  async deleteComment(commentId: string): Promise<void> {
    return this.repo.deleteComment(commentId);
  }

  async toggleCommentUpvote(commentId: string, userId: string): Promise<boolean> {
    return this.repo.toggleCommentUpvote(commentId, userId);
  }

  async getPollStatus(postId: string, userId?: string): Promise<PollStatus> {
    return this.repo.getPollStatus(postId, userId);
  }

  async voteInPoll(params: {
    postId: string;
    optionId: string;
    userId: string;
    allowMultiple?: boolean;
  }): Promise<string[]> {
    return this.repo.voteInPoll(params);
  }

  async markOfficialAnswer(commentId: string, isOfficial: boolean): Promise<void> {
    return this.repo.markOfficialAnswer(commentId, isOfficial);
  }

  async getAnnouncements(schoolId: string): Promise<any[]> {
    return this.repo.getAnnouncements(schoolId);
  }

  async createAnnouncement(params: {
    schoolId: string;
    authorId: string;
    content: string;
    isPinned?: boolean;
  }): Promise<any> {
    return this.repo.createAnnouncement(params);
  }

  async getGroupByClassroom(classroomId: string): Promise<any> {
    return this.repo.getCommunityGroupByClassroom(classroomId);
  }

  async createMembership(params: {
    groupId: string;
    userId: string;
    capacity: string;
    status: string;
  }): Promise<void> {
    return this.repo.createGroupMembership(params);
  }

  async updateMembership(
    groupId: string,
    userId: string,
    updates: { status?: string; capacity?: string },
  ): Promise<void> {
    return this.repo.updateGroupMembership(groupId, userId, updates);
  }

  async deleteMembership(groupId: string, userId: string): Promise<void> {
    return this.repo.deleteGroupMembership(groupId, userId);
  }
}
