import { principalWorkspaceContract } from './principalWorkspace.contract';
import { principalWorkspaceServices } from '../domains/principalWorkspace/runtime';
import type {
  InviteCodeZod,
  PrincipalGovernanceEventZod,
  PrincipalInviteEventCreate,
  PrincipalInviteRole,
  PrincipalObservationFollowUpCreate,
  PrincipalObservationCreate,
  PrincipalObservationZod,
} from './schemas/principal-workspace.schema';

export type { PrincipalGovernanceEventZod } from './schemas/principal-workspace.schema';

export const principalWorkspaceAPI = {
  /**
   * @authority read SchoolInvite
   */
  async listInviteCodes(schoolId: string): Promise<InviteCodeZod[]> {
    return principalWorkspaceServices.listInviteCodes(schoolId);
  },

  /**
   * @authority read SchoolInvite
   */
  async getInviteCodes(schoolId: string): Promise<InviteCodeZod[]> {
    return principalWorkspaceServices.listInviteCodes(schoolId);
  },

  /**
   * @authority create SchoolInvite
   */
  async generateInviteCode(
    schoolId: string,
    role: PrincipalInviteRole,
    createdBy: string,
  ): Promise<InviteCodeZod> {
    return principalWorkspaceServices.generateInviteCode(schoolId, role, createdBy);
  },

  /**
   * @authority read PrincipalObservation
   */
  async listObservationsByDate(
    principalId: string,
    viewDate: string,
    limit = 10,
  ): Promise<PrincipalObservationZod[]> {
    return principalWorkspaceServices.listObservationsByDate(principalId, viewDate, limit);
  },

  /**
   * @authority read PrincipalObservation
   */
  async listRecentObservations(principalId: string, limit = 5): Promise<PrincipalObservationZod[]> {
    return principalWorkspaceServices.listRecentObservations(principalId, limit);
  },

  /**
   * @authority create PrincipalObservation
   */
  async createObservation(input: PrincipalObservationCreate): Promise<PrincipalObservationZod> {
    return principalWorkspaceServices.createObservation(input);
  },

  /**
   * @authority update SchoolInvite
   */
  async recordInviteEvent(input: PrincipalInviteEventCreate): Promise<PrincipalGovernanceEventZod> {
    return principalWorkspaceServices.recordInviteEvent(input);
  },

  /**
   * @authority update PrincipalObservation
   */
  async recordObservationFollowUp(input: PrincipalObservationFollowUpCreate): Promise<PrincipalGovernanceEventZod> {
    return principalWorkspaceServices.recordObservationFollowUp(input);
  },

  /**
   * @authority read PrincipalObservation
   */
  async getGovernanceTimeline(
    principalId: string,
    viewDate: string,
    limit = 25,
  ): Promise<PrincipalGovernanceEventZod[]> {
    return principalWorkspaceServices.getGovernanceTimeline(principalId, viewDate, limit);
  },

  /**
   * @authority read PrincipalObservation
   */
  async getGovernanceSnapshotAsOf(
    principalId: string,
    viewDate: string,
    limit = 100,
  ): Promise<PrincipalGovernanceEventZod[]> {
    return principalWorkspaceServices.getGovernanceSnapshotAsOf(principalId, viewDate, limit);
  },
};

void principalWorkspaceContract;
