import type { Comment, CommunityGroup, GroupFilters, Post } from '@repo/community/types';
import { supabaseClient as supabase } from '@repo/core/adapters/supabaseClient';
import { announcementAPI } from '@repo/core/api/announcements';
import { communityAPI as coreCommunityAPI, identityAPI } from '@repo/core/api/client';
import { groupsAPI } from '@repo/core/api/groups';
import { applyTemporalFilter } from '@repo/core/logic';

/**
 * Community API
 *
 * Canonical shared behavior lives in @repo/core.
 * This package keeps only community-specific extensions that are not yet
 * contract-backed in core, while delegating all shared reads/writes to the
 * canonical core API.
 */
const rawCommunityAPI = {
  ...coreCommunityAPI,
  async getAnnouncements(schoolId: string) {
    return announcementAPI.getAnnouncements(schoolId);
  },
  async createAnnouncement(
    schoolId: string,
    authorId: string,
    content: string,
    isPinned: boolean = false,
  ) {
    return announcementAPI.createAnnouncement(schoolId, authorId, content, isPinned);
  },
  async getGroups(filters: GroupFilters) {
    return groupsAPI.getAll({
      school_id: filters.school_id,
      limit: filters.limit ?? 10,
      offset: filters.offset ?? 0,
      search: filters.search,
      is_public: filters.is_public,
      type: filters.type,
    }) as Promise<CommunityGroup[]>;
  },
  async searchGroups(query: string, filters: Partial<GroupFilters> = {}) {
    return this.getGroups({ ...filters, search: query });
  },
  async getPosts(filters: {
    limit: number;
    offset: number;
    groupId?: string;
    viewDate?: string;
    viewScale?: import('@repo/core/store').TemporalScale;
  }) {
    return coreCommunityAPI.getPosts({
      limit: filters.limit,
      offset: filters.offset,
      groupId: filters.groupId === 'all' ? undefined : filters.groupId,
      viewDate: filters.viewDate,
    }) as Promise<Post[]>;
  },
  async createPost(post: any, userId: string, userCapacity: string, schoolId: string) {
    return coreCommunityAPI.createPost({
      group_id: post.group_id,
      content: post.content,
      post_type: post.post_type ?? 'discussion',
      visibility: post.visibility ?? 'school',
      author_tier: userCapacity,
    }) as Promise<Post>;
  },
  async createGroup(group: any, userId: string, _userCapacity: string) {
    return groupsAPI.create({
      name: group.name,
      description: group.description,
      school_id: group.school_id,
      type: group.group_type ?? group.type,
      visibility: group.visibility,
      is_public: group.is_public,
    }) as Promise<CommunityGroup>;
  },
  async createGroupWithOwner(group: any, userId: string): Promise<CommunityGroup> {
    return groupsAPI.create({
      name: group.name,
      description: group.description,
      school_id: group.school_id,
      type: group.group_type ?? 'general',
      visibility: group.visibility,
      is_public: group.is_public,
    }) as Promise<CommunityGroup>;
  },
  async joinGroup(groupId: string, userId: string, joinPolicy: string = 'open') {
    return groupsAPI.join(groupId, userId, 'member');
  },
  async getGroupById(groupId: string): Promise<CommunityGroup> {
    return groupsAPI.get(groupId) as Promise<CommunityGroup>;
  },
  async getGroupMessages(
    groupId: string,
    limit = 60,
    viewDate?: string,
    viewScale?: import('@repo/core/store').TemporalScale,
  ) {
    return coreCommunityAPI.getGroupMessages(groupId, limit, viewDate) as Promise<any[]>;
  },
  async sendGroupMessage(groupId: string, content: string) {
    return coreCommunityAPI.sendGroupMessage(groupId, content);
  },
  async togglePostReaction(postId: string, userId: string): Promise<boolean> {
    return coreCommunityAPI.togglePostReaction(postId, userId);
  },
  async handleMemberRequest(groupId: string, userId: string, status: 'active' | 'rejected') {
    return coreCommunityAPI.updateMemberStatus(groupId, userId, status);
  },
  async updateJoiningPolicy(groupId: string, newPolicy: string) {
    return coreCommunityAPI.updateGroupPolicy(groupId, newPolicy);
  },
  async getDirectConversations() {
    return coreCommunityAPI.getDirectConversations();
  },
  async getOrCreateDirectConversation(targetUserId: string): Promise<string> {
    return coreCommunityAPI.getOrCreateDirectConversation(targetUserId);
  },
  async getDirectMessages(
    conversationId: string,
    limit = 60,
    viewDate?: string,
    viewScale?: import('@repo/core/store').TemporalScale,
  ) {
    return coreCommunityAPI.getDirectMessages(conversationId, limit, viewDate, viewScale);
  },
  async sendDirectMessage(conversationId: string, content: string) {
    return coreCommunityAPI.sendDirectMessage(conversationId, content);
  },
  async voteInPoll(
    postId: string,
    optionId: string,
    allowMultiple: boolean = false,
  ): Promise<string[]> {
    const result = await coreCommunityAPI.voteInPoll(postId, optionId, allowMultiple);
    return (result as { selectedOptionIds: string[] }).selectedOptionIds;
  },
  async getPendingMembers(groupId: string) {
    return coreCommunityAPI.getGroupMembers(groupId, 'pending');
  },
  async getActiveMembers(groupId: string) {
    return coreCommunityAPI.getGroupMembers(groupId, 'active');
  },
  async updateMemberCapacity(groupId: string, userId: string, newCapacity: 'admin' | 'member') {
    return coreCommunityAPI.updateMemberRole(groupId, userId, newCapacity);
  },
  async approveAllPending(groupId: string) {
    return coreCommunityAPI.approveAllMembers(groupId);
  },
  async updateGroup(groupId: string, updates: Partial<CommunityGroup>) {
    if (updates.join_policy) {
      return coreCommunityAPI.updateGroupPolicy(
        groupId,
        updates.join_policy,
      ) as Promise<CommunityGroup>;
    }
    return groupsAPI.get(groupId) as Promise<CommunityGroup>;
  },
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
    return coreCommunityAPI.reportContent(params, reporterId);
  },
  async createSanctuaryGroup(input: any) {
    const { data, error } = await supabase
      .from('community_groups')
      .insert([
        {
          ...input,
          type: 'class',
          visibility: 'class',
          join_policy: 'restricted',
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();
    if (error) throw error;
    return data as CommunityGroup;
  },
  async retractAllVotes(postId: string): Promise<void> {
    const myId = await identityAPI.getMyInternalId();
    if (!myId) throw new Error('Authentication required');
    const { error } = await supabase
      .from('community_poll_votes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', myId);
    if (error) throw new Error(error.message);
  },
  async getComments(
    postId: string,
    limit = 60,
    options: {
      viewDate?: string;
      viewScale?: import('@repo/core/store').TemporalScale;
    } = {},
  ): Promise<Comment[]> {
    return coreCommunityAPI.getComments(postId, limit) as Promise<Comment[]>;
  },
  async createComment(postId: string, content: string, isAnonymous = false): Promise<Comment> {
    return coreCommunityAPI.createComment(postId, {
      content: content.trim(),
      isAnonymous,
    }) as Promise<Comment>;
  },
  async deleteComment(commentId: string): Promise<void> {
    await coreCommunityAPI.deleteComment(commentId);
  },
  async toggleCommentUpvote(commentId: string): Promise<boolean> {
    const result = await coreCommunityAPI.toggleCommentUpvote(commentId);
    return Boolean((result as { active: boolean }).active);
  },
  async markOfficialAnswer(commentId: string, isOfficial: boolean): Promise<void> {
    await coreCommunityAPI.markOfficialAnswer(commentId, isOfficial);
  },
  async deletePost(postId: string): Promise<void> {
    await coreCommunityAPI.deletePost(postId);
  },
  async updatePost(postId: string, content: string): Promise<void> {
    await coreCommunityAPI.updatePost(postId, content);
  },
  async toggleResonance(postId: string): Promise<boolean> {
    const myId = await identityAPI.getMyInternalId();
    if (!myId) throw new Error('Authentication required');
    const { data: existing } = await supabase
      .from('community_reactions')
      .select('user_id')
      .eq('post_id', postId)
      .eq('user_id', myId)
      .eq('reaction_code', '(')
      .maybeSingle();
    if (existing) {
      await supabase
        .from('community_reactions')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', myId)
        .eq('reaction_code', '(');
      return false;
    }
    await supabase
      .from('community_reactions')
      .insert({ post_id: postId, user_id: myId, reaction_code: '(' });
    return true;
  },
  async hasResonated(postId: string): Promise<boolean> {
    const myId = await identityAPI.getMyInternalId();
    if (!myId) return false;
    const { data } = await supabase
      .from('community_reactions')
      .select('user_id')
      .eq('post_id', postId)
      .eq('user_id', myId)
      .eq('reaction_code', '(')
      .maybeSingle();
    return !!data;
  },
  async getNotifications(
    limit = 30,
    options: {
      viewDate?: string;
      viewScale?: import('@repo/core/store').TemporalScale;
    } = {},
  ): Promise<import('../types/Community').Notification[]> {
    return coreCommunityAPI.getNotifications(limit, options) as Promise<
      import('../types/Community').Notification[]
    >;
  },
  async getUnreadNotificationCount(): Promise<number> {
    return coreCommunityAPI.getUnreadNotificationCount();
  },
  async markNotificationRead(notificationId: string): Promise<void> {
    return coreCommunityAPI.markNotificationRead(notificationId);
  },
  async markAllNotificationsRead(): Promise<void> {
    return coreCommunityAPI.markAllNotificationsRead();
  },
  async isBlockingActive(targetUserId: string): Promise<boolean> {
    return coreCommunityAPI.isBlockingActive(targetUserId);
  },
};

export const communityAPI = rawCommunityAPI;
