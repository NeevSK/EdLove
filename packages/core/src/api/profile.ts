/**
 * PROFILE API (Protocol-Oriented Authority)
 */

import { profileServices } from './runtimes/profile.runtime';

/**
 * API methods for User and Institutional Profiles.
 * Following Protocol-Oriented Authority.
 */
export const profileAPI = {
  async getUserProfile(userId: string) {
    return profileServices.getUserProfile(userId);
  },

  async getUserProfileAsOf(userId: string, at: string) {
    return profileServices.getUserProfileAsOf(userId, at);
  },

  async getUserProfileHistory(userId: string, limit?: number) {
    return profileServices.getUserProfileHistory(userId, limit);
  },

  async getJourneySnapshot(
    userId: string,
    params?: {
      at?: string;
      view_date?: string;
      view_scale?: 'day' | 'week' | 'month' | 'year' | 'custom';
    },
  ) {
    return profileServices.getJourneySnapshot(userId, {
      asOf: params?.at,
      viewDate: params?.view_date,
      viewScale: params?.view_scale,
    });
  },

  async getJourneyHistory(
    userId: string,
    params: {
      view_date: string;
      view_scale?: 'day' | 'week' | 'month' | 'year' | 'custom';
      limit?: number;
    },
  ) {
    return profileServices.getJourneyHistory(userId, {
      viewDate: params.view_date,
      viewScale: params.view_scale,
      limit: params.limit,
    });
  },

  async updateProfile(userId: string, updates: Record<string, any>) {
    return profileServices.updateProfile(userId, updates);
  },

  async isAnonymous(userId: string) {
    const isAnonymous = await profileServices.isAnonymous(userId);
    return { is_anonymous: isAnonymous };
  },

  async uploadAvatar(userId: string, params: { local_uri: string }) {
    return profileServices.uploadAvatar(userId, params.local_uri);
  },

  async getSocialLinks(userId: string) {
    return profileServices.getSocialLinks(userId);
  },

  async upsertSocialLink(userId: string, link: Record<string, any>) {
    return profileServices.upsertSocialLink(userId, link as any);
  },

  async deleteSocialLink(linkId: string) {
    return profileServices.deleteSocialLink(linkId);
  },

  async updateSocialLinksOrder(
    _userId: string,
    params: { links: { id: string; order_index: number }[] },
  ) {
    await profileServices.updateSocialLinksOrder(_userId, params.links);
    return { ok: true };
  },

  async getCommunityProfile(communityId: string) {
    return profileServices.getCommunityProfile(communityId);
  },

  async getCommunityProfileAsOf(communityId: string, at: string) {
    return profileServices.getCommunityProfileAsOf(communityId, at);
  },

  async getCommunityProfileHistory(communityId: string, limit?: number) {
    return profileServices.getCommunityProfileHistory(communityId, limit);
  },

  async updateCommunityProfile(
    communityId: string,
    params: { field: 'name' | 'description'; value: string },
  ) {
    return profileServices.updateCommunityProfile(communityId, params.field, params.value);
  },

  async getSchoolPulse(
    schoolId: string,
    params: {
      view_date: string;
      view_scale?: 'day' | 'week' | 'month' | 'year' | 'custom';
    },
  ) {
    return profileServices.getSchoolPulse(schoolId, {
      viewDate: params.view_date,
      viewScale: params.view_scale,
    });
  },
};
