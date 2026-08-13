import { api } from '@repo/core/api/client';
import type { PrincipalInviteRole } from '@repo/core/logic';

export type InviteCode = Awaited<
  ReturnType<(typeof api)['principalWorkspace']['listInviteCodes']>
>[number];

export const invitesAPI = {
  async listInviteCodes(schoolId: string): Promise<InviteCode[]> {
    return api.principalWorkspace.listInviteCodes(schoolId);
  },

  async getInviteCodesBySchool(schoolId: string): Promise<InviteCode[]> {
    return this.listInviteCodes(schoolId);
  },

  async generateInviteCode(
    schoolId: string,
    role: PrincipalInviteRole,
    createdBy: string,
  ): Promise<InviteCode> {
    return api.principalWorkspace.generateInviteCode(schoolId, role, createdBy);
  },

  async revokeInviteCode(schoolId: string, inviteCode: string, userId: string): Promise<void> {
    await api.principalWorkspace.recordInviteEvent({
      schoolId,
      principalId: userId,
      inviteCode,
      eventType: 'revoke',
    });
  },
};
