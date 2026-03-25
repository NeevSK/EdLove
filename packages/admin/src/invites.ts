import { schoolAPI, type InviteCode, type AuthorityTier } from '@repo/core';
export type { InviteCode };

export const invitesAPI = {
  async listInviteCodes(schoolId: string): Promise<InviteCode[]> {
    return schoolAPI.getInviteCodes(schoolId);
  },

  async generateInviteCode(schoolId: string, role: AuthorityTier, createdBy: string): Promise<InviteCode> {
    return schoolAPI.generateInviteCode(schoolId, role, createdBy);
  },
};
