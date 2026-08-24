import { communityAPI } from '@repo/core/api/community';
import { groupsAPI } from '@repo/core/api/groups';
import { growthSignalsAPI } from '@repo/core/api/growthSignals';
import { identityAPI } from '@repo/core/api/identity';
import {
  CommunityGroupSchema,
  GroupMemberSchema,
  GroupMessageSchema,
} from '@repo/core/logic/schemas/community.schema';
import type { TemporalScale } from '@repo/core/store/useTemporalStore';
import type { Group } from '@repo/core/types';
import { APIError } from '@repo/core/types/API';

/**
 * Circles API (formerly Groups)
 *
 * Handles group management, membership, and internal group messaging.
 */
export const circleAPI = {
  /**
   * @policy read Group
   */
  async getGroups(filters: {
    limit: number;
    offset: number;
    school_id?: string;
    search?: string;
    is_public?: boolean;
    type?: string;
  }) {
    const data = await groupsAPI.getAll(filters);
    return (data || []).map((g: unknown) => CommunityGroupSchema.parse(g));
  },

  /**
   * @policy create Group
   */
  async createGroupWithOwner(group: Partial<Group>, userId: string) {
    const data = await groupsAPI.create({
      name: String(group.name ?? ''),
      description: group.description,
      school_id: group.school_id,
      type: group.type,
      visibility: group.visibility,
      is_public: group.is_public,
    });

    growthSignalsAPI.emitSilent({
      user_id: userId,
      event_type: 'circle_facilitated',
      event_metadata: {
        group_id: (data as any)?.id,
      },
    });

    return CommunityGroupSchema.parse(data);
  },

  /**
   * @policy create Group
   */
  async joinGroup(groupId: string, userId: string, capacity: string) {
    const data = await groupsAPI.join(groupId, userId, capacity);

    growthSignalsAPI.emitSilent({
      user_id: userId,
      event_type: 'group_joined',
      event_metadata: {
        group_id: groupId,
      },
    });

    return GroupMemberSchema.parse(data);
  },

  /**
   * @policy read Group
   */
  async getGroupById(groupId: string) {
    return CommunityGroupSchema.parse(await groupsAPI.get(groupId));
  },

  /**
   * @policy read Group
   */
  async getGroupMessages(
    groupId: string,
    limit = 60,
    viewDate?: string,
    viewScale?: TemporalScale,
  ) {
    const data = await communityAPI.getGroupMessages(groupId, limit, viewDate);
    return (data || []).map((m: unknown) => GroupMessageSchema.parse(m));
  },

  /**
   * @policy create Group
   */
  async sendGroupMessage(groupId: string, content: string) {
    const identity = await identityAPI.identifyActiveCitizen();
    if (!identity) throw new APIError('Not authenticated', 'AUTH_REQUIRED');
    const data = await communityAPI.sendGroupMessage(groupId, content);

    growthSignalsAPI.emitSilent({
      user_id: identity.id,
      event_type: 'group_message_sent',
      event_metadata: {
        group_id: groupId,
      },
    });

    return GroupMessageSchema.parse(data);
  },

  /**
   * @policy update Group
   */
  async handleMemberRequest(groupId: string, userId: string, status: 'active' | 'rejected') {
    return GroupMemberSchema.parse(await communityAPI.updateMemberStatus(groupId, userId, status));
  },

  /**
   * @policy update Group
   */
  async updateJoiningPolicy(groupId: string, newPolicy: string) {
    return CommunityGroupSchema.parse(await communityAPI.updateGroupPolicy(groupId, newPolicy));
  },
};
