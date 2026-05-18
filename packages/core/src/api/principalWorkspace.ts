import type {
  InviteCodeZod,
  PrincipalGovernanceEventZod,
  PrincipalInviteEventCreate,
  PrincipalInviteRole,
  PrincipalObservationCreate,
  PrincipalObservationFollowUpCreate,
  PrincipalObservationZod,
} from '../logic/schemas/principal-workspace.schema';
import { principalWorkspaceServices } from './runtimes/principalWorkspace.runtime';
import { principalWorkspaceContract } from './principalWorkspace.contract';

export type { PrincipalGovernanceEventZod } from '../logic/schemas/principal-workspace.schema';

export const principalWorkspaceAPI = {
  /**
   * @policy read SchoolInvite
   */
  async listInviteCodes(schoolId: string): Promise<InviteCodeZod[]> {
    return principalWorkspaceServices.listInviteCodes(schoolId);
  },

  /**
   * @policy read SchoolInvite
   */
  async getInviteCodes(schoolId: string): Promise<InviteCodeZod[]> {
    return principalWorkspaceServices.listInviteCodes(schoolId);
  },

  /**
   * @policy create SchoolInvite
   */
  async generateInviteCode(
    schoolId: string,
    capacity: PrincipalInviteRole,
    createdBy: string,
  ): Promise<InviteCodeZod> {
    return principalWorkspaceServices.generateInviteCode(schoolId, capacity, createdBy);
  },

  /**
   * @policy read PrincipalObservation
   */
  async listObservationsByDate(
    principalId: string,
    viewDate: string,
    limit = 10,
  ): Promise<PrincipalObservationZod[]> {
    return principalWorkspaceServices.listObservationsByDate(principalId, viewDate, limit);
  },

  /**
   * @policy read PrincipalObservation
   */
  async listRecentObservations(principalId: string, limit = 5): Promise<PrincipalObservationZod[]> {
    return principalWorkspaceServices.listRecentObservations(principalId, limit);
  },

  /**
   * @policy create PrincipalObservation
   */
  async createObservation(input: PrincipalObservationCreate): Promise<PrincipalObservationZod> {
    return principalWorkspaceServices.createObservation(input);
  },

  /**
   * @policy update SchoolInvite
   */
  async recordInviteEvent(input: PrincipalInviteEventCreate): Promise<PrincipalGovernanceEventZod> {
    return principalWorkspaceServices.recordInviteEvent(input);
  },

  /**
   * @policy update PrincipalObservation
   */
  async recordObservationFollowUp(
    input: PrincipalObservationFollowUpCreate,
  ): Promise<PrincipalGovernanceEventZod> {
    return principalWorkspaceServices.recordObservationFollowUp(input);
  },

  /**
   * @policy read PrincipalObservation
   */
  async getGovernanceTimeline(
    principalId: string,
    viewDate: string,
    limit = 25,
  ): Promise<PrincipalGovernanceEventZod[]> {
    return principalWorkspaceServices.getGovernanceTimeline(principalId, viewDate, limit);
  },

  /**
   * @policy read PrincipalObservation
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

