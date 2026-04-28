import {
  assertContractCoverage,
  createTemporalPOAProxy,
  defineContractCoverage,
  profileContract,
  type SocialLink,
} from '@repo/core';
import { profileServices } from '../domains/profile/runtime';

const rawSocialAPI = {
  async getSocialLinks(userId: string) {
    return profileServices.getSocialLinks(userId);
  },

  async upsertSocialLink(link: Partial<SocialLink>) {
    const ownerId = link.user_id;
    if (!ownerId) {
      throw new Error('user_id is required for social link mutations');
    }
    return profileServices.upsertSocialLink(ownerId, link);
  },

  async deleteSocialLink(linkId: string) {
    await profileServices.deleteSocialLink(linkId);
    return true;
  },

  async updateOrder(userId: string, links: { id: string; order_index: number }[]) {
    await profileServices.updateSocialLinksOrder(userId, links);
    return true;
  },
};

const socialCoverage = assertContractCoverage(
  rawSocialAPI,
  defineContractCoverage({
    moduleName: 'profileSocial',
    contract: profileContract,
    methodMapping: {
      updateOrder: 'updateSocialLinksOrder',
    },
  }),
);

export const socialAPI = createTemporalPOAProxy(
  'profileSocial',
  rawSocialAPI,
  socialCoverage.contract,
  socialCoverage.methodMapping,
  { strictUnmappedMethods: true },
);
