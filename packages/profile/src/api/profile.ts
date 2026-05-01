import { assertContractCoverage, createTemporalPOAProxy, defineContractCoverage, profileContract } from '@repo/core/api';
import { TemporalScale } from '@repo/core/store';
import { profileServices } from '../domains/profile/runtime';

const rawProfileAPI = {
  async getUserProfile(userId: string) {
    return profileServices.getUserProfile(userId);
  },

  async getUserProfileAsOf(userId: string, asOf: string) {
    return profileServices.getUserProfileAsOf(userId, asOf);
  },

  async getUserProfileHistory(userId: string, limit?: number) {
    return profileServices.getUserProfileHistory(userId, limit);
  },

  async getJourneySnapshot(
    userId: string,
    options?: { asOf?: string; viewDate?: string; viewScale?: TemporalScale },
  ) {
    return profileServices.getJourneySnapshot(userId, options);
  },

  async getJourneyHistory(
    userId: string,
    options?: { viewDate?: string; viewScale?: TemporalScale; limit?: number },
  ) {
    return profileServices.getJourneyHistory(userId, options);
  },

  async updateProfile(userId: string, updates: Record<string, any>) {
    return profileServices.updateProfile(userId, updates);
  },

  async isAnonymous(userId: string): Promise<boolean> {
    return profileServices.isAnonymous(userId);
  },

  async uploadAvatar(userId: string, localUri: string) {
    return profileServices.uploadAvatar(userId, localUri);
  },

  async getCommunityProfile(communityId: string) {
    return profileServices.getCommunityProfile(communityId);
  },

  async getCommunityProfileAsOf(communityId: string, asOf: string) {
    return profileServices.getCommunityProfileAsOf(communityId, asOf);
  },

  async getCommunityProfileHistory(communityId: string, limit?: number) {
    return profileServices.getCommunityProfileHistory(communityId, limit);
  },

  async updateCommunityProfile(communityId: string, field: 'name' | 'description', value: string) {
    return profileServices.updateCommunityProfile(communityId, field, value);
  },

  async getSchoolPulse(schoolId: string, options: { viewDate: string; viewScale?: TemporalScale }) {
    return profileServices.getSchoolPulse(schoolId, options);
  },
};

const profileCoverage = assertContractCoverage(
  rawProfileAPI,
  defineContractCoverage({
    moduleName: 'profile',
    contract: profileContract,
  }),
);

export const profileAPI = createTemporalPOAProxy(
  'profile',
  rawProfileAPI,
  profileCoverage.contract,
  profileCoverage.methodMapping,
  { strictUnmappedMethods: true },
);
