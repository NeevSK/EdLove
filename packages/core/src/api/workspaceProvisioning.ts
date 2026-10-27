import type { CreateTuitionBatchInput } from '../adapters/supabase/tuitionBatchRepository';
import type { GuardianIdentity } from '../logic/schemas/guardian.schema';
import { orpcClient } from './orpcClient';

export type GuardianLinkProvisionInput = {
  wardUserId: string;
  relationship: GuardianIdentity['relationship_type'];
  schoolId?: string;
  wardName: string;
};

/** Server commands are the only provisioning writers. The client merely owns durable intent. */
export const workspaceProvisioningClient = {
  commercialBatch: (input: CreateTuitionBatchInput & { idempotencyKey: string }) =>
    orpcClient.workspaceProvisioning.provisionCommercialBatch({
      body: {
        ...input,
        instituteId: input.instituteId ?? null,
        monthlyFee: input.monthlyFee ?? null,
        customAlias: input.customAlias ?? null,
      },
    }),
  guardianLink: (input: GuardianLinkProvisionInput & { idempotencyKey: string }) =>
    orpcClient.workspaceProvisioning.requestGuardianLink({
      body: {
        idempotencyKey: input.idempotencyKey,
        studentId: input.wardUserId,
        relationship: input.relationship,
        schoolId: input.schoolId ?? null,
        wardName: input.wardName,
      },
    }),
};
