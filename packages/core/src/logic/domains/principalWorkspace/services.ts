import type { PrincipalWorkspaceRepository } from '@repo/core/logic/domains/principalWorkspace/ports';
import type {
  InviteCodeZod,
  PrincipalGovernanceEventZod,
  PrincipalInviteEventCreate,
  PrincipalInviteRole,
  PrincipalObservationCreate,
  PrincipalObservationFollowUpCreate,
  PrincipalObservationZod,
} from '@repo/core/logic/schemas/principal-workspace.schema';

export interface PrincipalWorkspaceServices {
  listInviteCodes(schoolId: string): Promise<InviteCodeZod[]>;
  generateInviteCode(
    schoolId: string,
    capacity: PrincipalInviteRole,
    createdBy: string,
    idempotencyKey?: string,
  ): Promise<InviteCodeZod>;
  listObservationsByDate(
    principalId: string,
    viewDate: string,
    limit?: number,
  ): Promise<PrincipalObservationZod[]>;
  listRecentObservations(principalId: string, limit?: number): Promise<PrincipalObservationZod[]>;
  createObservation(input: PrincipalObservationCreate): Promise<PrincipalObservationZod>;
  recordInviteEvent(input: PrincipalInviteEventCreate): Promise<PrincipalGovernanceEventZod>;
  recordObservationFollowUp(
    input: PrincipalObservationFollowUpCreate,
  ): Promise<PrincipalGovernanceEventZod>;
  getGovernanceTimeline(
    principalId: string,
    viewDate: string,
    limit?: number,
  ): Promise<PrincipalGovernanceEventZod[]>;
  getGovernanceSnapshotAsOf(
    principalId: string,
    viewDate: string,
    limit?: number,
  ): Promise<PrincipalGovernanceEventZod[]>;
}

export const createPrincipalWorkspaceServices = (
  repository: PrincipalWorkspaceRepository,
): PrincipalWorkspaceServices => ({
  listInviteCodes: (schoolId) => repository.listInviteCodes(schoolId),
  generateInviteCode: (schoolId, capacity, createdBy, idempotencyKey) =>
    repository.generateInviteCode(schoolId, capacity, createdBy, idempotencyKey),
  listObservationsByDate: (principalId, viewDate, limit = 10) =>
    repository.listObservationsByDate(principalId, viewDate, limit),
  listRecentObservations: (principalId, limit = 5) =>
    repository.listRecentObservations(principalId, limit),
  createObservation: (input) => repository.createObservation(input),
  recordInviteEvent: (input) => repository.recordInviteEvent(input),
  recordObservationFollowUp: (input) => repository.recordObservationFollowUp(input),
  getGovernanceTimeline: (principalId, viewDate, limit = 25) =>
    repository.getGovernanceTimeline(principalId, viewDate, limit),
  getGovernanceSnapshotAsOf: (principalId, viewDate, limit = 100) =>
    repository.getGovernanceSnapshotAsOf(principalId, viewDate, limit),
});
