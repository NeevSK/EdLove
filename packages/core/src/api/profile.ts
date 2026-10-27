import { orpcClient } from '@repo/core/api/orpcClient';
import { profile } from '@repo/core/logic/managers/factory';
import { UserProfilePatchSchema } from '@repo/core/logic/schemas/profileUpdate.schema';
import { useAuthStore } from '@repo/core/store/useAuthStore';
import { APIError, type SocialLink } from '@repo/core/types';
import { SovereignError } from '@repo/core/types/Errors';

export const profileAPI = {
  async getUserProfile(id: string) {
    try {
      const res = await orpcClient.profile.getUserProfile({
        params: { id },
      });

      return res;
    } catch (error: any) {
      if (error?.status === 404 || error?.code === 'NOT_FOUND') return null;
      console.warn(
        `[profileAPI] Offline or unreachable when fetching user profile for ${id}:`,
        error,
      );
      return null;
    }
  },

  async updateProfile(id: string, updates: Record<string, any>) {
    const state = useAuthStore.getState();
    if (!state.user || state.user.is_anonymous) {
      throw SovereignError.unauthorized('update', 'User');
    }

    try {
      const res = await orpcClient.profile.updateProfile({
        params: { id },
        body: UserProfilePatchSchema.parse(updates),
      });

      return res;
    } catch (error) {
      if (error instanceof APIError || error instanceof SovereignError) throw error;
      console.warn(`[profileAPI] Offline or unreachable when updating profile for ${id}:`, error);
      throw error;
    }
  },

  async getJourneySnapshot(
    id: string,
    params?: {
      at?: string;
      view_date?: string;
      view_scale?: any;
    },
  ) {
    try {
      const res = await orpcClient.profile.getJourneySnapshot({
        params: { id },
        query: {
          at: params?.at,
          view_date: params?.view_date,
          view_scale: params?.view_scale,
        },
      });

      return res;
    } catch (error) {
      console.warn(
        `[profileAPI] Offline or unreachable when fetching journey snapshot for ${id}:`,
        error,
      );
      return null;
    }
  },

  async getSchoolPulse(
    id: string,
    params: {
      view_date: string;
      view_scale?: any;
    },
  ) {
    try {
      const res = await orpcClient.profile.getSchoolPulse({
        params: { id },
        query: {
          view_date: params.view_date,
          view_scale: params.view_scale,
        },
      });

      return res;
    } catch (error) {
      console.warn(
        `[profileAPI] Offline or unreachable when fetching school pulse for ${id}:`,
        error,
      );
      return null;
    }
  },

  // --- Sovereign Domain Manager Delegation ---

  async getCommunityProfileAsOf(communityId: string, asOf: string) {
    return profile.getCommunityProfileAsOf(communityId, asOf);
  },

  async getCommunityProfile(communityId: string) {
    return profile.getCommunityProfile(communityId);
  },

  async updateCommunityProfile(communityId: string, field: 'name' | 'description', value: string) {
    return profile.updateCommunityProfile(communityId, field, value);
  },

  async getCommunityProfileHistory(communityId: string, limit?: number) {
    return profile.getCommunityProfileHistory(communityId, limit);
  },

  async getUserProfileAsOf(userId: string, asOf: string) {
    return profile.getUserProfileAsOf(userId, asOf);
  },

  async uploadAvatar(userId: string, localUri: string) {
    return profile.uploadAvatar(userId, localUri);
  },

  async getUserProfileHistory(userId: string, limit?: number) {
    return profile.getUserProfileHistory(userId, limit);
  },

  async getSocialLinks(userId: string) {
    return profile.getSocialLinks(userId);
  },

  async upsertSocialLink(userId: string, link: Partial<SocialLink>) {
    const state = useAuthStore.getState();
    if (!state.user || state.user.is_anonymous) {
      throw new APIError('Forbidden', '403');
    }
    return profile.upsertSocialLink(userId, link);
  },

  async deleteSocialLink(linkId: string) {
    const state = useAuthStore.getState();
    if (!state.user || state.user.is_anonymous) {
      throw new APIError('Forbidden', '403');
    }
    return profile.deleteSocialLink(linkId);
  },
};
