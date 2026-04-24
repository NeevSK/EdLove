import type {
  InviteCodeZod,
  PrincipalGovernanceEventZod,
  PrincipalInviteEventCreate,
  PrincipalInviteRole,
  PrincipalObservationCreate,
  PrincipalObservationFollowUpCreate,
  PrincipalObservationZod,
} from '../../schemas/principal-workspace.schema';

export interface PrincipalWorkspaceRepository {
  listInviteCodes(schoolId: string): Promise<InviteCodeZod[]>;
  generateInviteCode(
    schoolId: string,
    role: PrincipalInviteRole,
    createdBy: string,
  ): Promise<InviteCodeZod>;
  listObservationsByDate(
    principalId: string,
    viewDate: string,
    limit: number,
  ): Promise<PrincipalObservationZod[]>;
  listRecentObservations(principalId: string, limit: number): Promise<PrincipalObservationZod[]>;
  createObservation(input: PrincipalObservationCreate): Promise<PrincipalObservationZod>;
  recordInviteEvent(input: PrincipalInviteEventCreate): Promise<PrincipalGovernanceEventZod>;
  recordObservationFollowUp(
    input: PrincipalObservationFollowUpCreate,
  ): Promise<PrincipalGovernanceEventZod>;
  getGovernanceTimeline(
    principalId: string,
    viewDate: string,
    limit: number,
  ): Promise<PrincipalGovernanceEventZod[]>;
  getGovernanceSnapshotAsOf(
    principalId: string,
    viewDate: string,
    limit: number,
  ): Promise<PrincipalGovernanceEventZod[]>;
}
