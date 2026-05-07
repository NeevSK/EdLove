import {
  CommunityGroupSchema,
  GroupMemberSchema,
  GroupMessageSchema,
} from '../logic/schemas/community.schema';
import { applyTemporalFilter } from '../logic/utils/temporalUtils';
import type { TemporalScale } from '../store/useTemporalStore';
import type { Group } from '../types';
import { growthSignalsAPI } from './growthSignals';
import { identityAPI } from './identity';
import { impactRipplesAPI } from './impactRipples';
import { supabase } from './supabase';

/**
 * Circles API (formerly Groups)
 *
 * Handles group management, membership, and internal group messaging.
 */
export const circleAPI = {
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
};
