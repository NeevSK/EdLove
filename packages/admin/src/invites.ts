import { api } from '@repo/core';

export type InviteCode = Awaited<ReturnType<typeof api.principalWorkspace.listInviteCodes>>[number];

export const invitesAPI = {
  async listInviteCodes(schoolId: string): Promise<InviteCode[]> {
    return api.principalWorkspace.listInviteCodes(schoolId);
  },

  async generateInviteCode(schoolId: string, role: 'teacher' | 'principal', createdBy: string): Promise<InviteCode> {
    return api.principalWorkspace.generateInviteCode(schoolId, role, createdBy);
  },
};
