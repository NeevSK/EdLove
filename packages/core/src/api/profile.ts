import { profile } from '../logic/managers/factory';
import { SocialLink } from '../types';
import { TemporalScale } from '../store/useTemporalStore';

/**
 * PROFILE API (Sovereign Architecture)
 * 
 * Thin delegation layer to the Global Profile Manager.
 */
export const profileAPI = {
  async getUserProfile(userId: string) {
    return profile.getUserProfile(userId);
  },

  async getUserProfileAsOf(userId: string, at: string) {
    return profile.getUserProfileAsOf(userId, at);
  },

  async getUserProfileHistory(userId: string, limit?: number) {
    return profile.getUserProfileHistory(userId, limit);
  },

  async getJourneySnapshot(
    userId: string,
    params?: {
      at?: string;
      view_date?: string;
      view_scale?: TemporalScale;
    },
  ) {
    return profile.getJourneySnapshot(userId, {
      asOf: params?.at,
      viewDate: params?.view_date,
      viewScale: params?.view_scale,
    });
  },

  async getJourneyHistory(
    userId: string,
    params: {
      view_date: string;
      view_scale?: TemporalScale;
      limit?: number;
    },
  ) {
    return profile.getJourneyHistory(userId, {
      viewDate: params.view_date,
      viewScale: params.view_scale,
      limit: params.limit,
    });
  },

  async updateProfile(userId: string, updates: Record<string, any>) {
    return profile.updateProfile(userId, updates);
  },

  async isAnonymous(userId: string) {
    const isAnonymous = await profile.isAnonymous(userId);
    return { is_anonymous: isAnonymous };
  },

  async uploadAvatar(userId: string, localUri: string) {
    return profile.uploadAvatar(userId, localUri);
  },

  async getSocialLinks(userId: string) {
    return profile.getSocialLinks(userId);
  },

  async upsertSocialLink(userId: string, link: Partial<SocialLink>) {
    return profile.upsertSocialLink(userId, link);
  },

  async deleteSocialLink(linkId: string) {
    return profile.deleteSocialLink(linkId);
  },

  async updateSocialLinksOrder(
    _userId: string,
    params: { links: { id: string; order_index: number }[] },
  ) {
    await profile.updateSocialLinksOrder(_userId, params.links);
    return { ok: true };
  },

  async getCommunityProfile(communityId: string) {
    return profile.getCommunityProfile(communityId);
  },

  async getCommunityProfileAsOf(communityId: string, at: string) {
    return profile.getCommunityProfileAsOf(communityId, at);
  },

  async getCommunityProfileHistory(communityId: string, limit?: number) {
    return profile.getCommunityProfileHistory(communityId, limit);
  },

  async updateCommunityProfile(
    communityId: string,
    field: 'name' | 'description',
    value: string,
  ) {
    return profile.updateCommunityProfile(communityId, field, value);
  },

  async getSchoolPulse(
    schoolId: string,
    params: {
      view_date: string;
      view_scale?: TemporalScale;
    },
  ) {
    return profile.getSchoolPulse(schoolId, {
      viewDate: params.view_date,
      viewScale: params.view_scale,
    });
  },
};
