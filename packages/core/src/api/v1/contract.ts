import { oc, type RouterContract, type RouterContractClient } from '@orpc/contract';
import { z } from 'zod';
import { isEdloveAccountId } from '../../logic/schemas/edloveUuidV8';
import { SchoolLevelSchema } from '../../logic/schemas/school.schema';

const foundation = oc.errors({
  UNAUTHORIZED: {},
  FORBIDDEN: {},
  SERVICE_UNAVAILABLE: {},
  TOO_MANY_REQUESTS: {},
});
// What a person may choose for themselves. Principals come by invite only; founder and
// admin bonds are provisioned by the server.
export const INITIAL_BOND_CAPACITIES = ['teacher', 'student', 'guardian'] as const;
export type InitialBondCapacity = (typeof INITIAL_BOND_CAPACITIES)[number];

export const InitialBondInput = z.strictObject({
  capacity: z.enum(INITIAL_BOND_CAPACITIES),
  displayName: z.string().trim().min(1).max(80),
});

// A sync grant: the signed token a device presents to the PowerSync service, for one account.
export const SyncGrant = z.strictObject({
  accountId: z.string().refine(isEdloveAccountId),
  endpoint: z.url(),
  token: z.string().min(1),
  expiresAt: z.number().int().positive(),
});
export type SyncGrant = z.infer<typeof SyncGrant>;

const scope = z.strictObject({
  bondId: z.uuid(),
  entityId: z.string(),
  entityType: z.string(),
  capacity: z.string(),
  citizenship: z.enum(['FIRST_CLASS', 'SECOND_CLASS', 'THIRD_CLASS']),
  admission: z.enum(['available', 'unsupported', 'denied']),
});

const DELETION_STATUSES = [
  'pending_verification',
  'scheduled',
  'cancelled',
  'completed',
  'blocked',
] as const;

/**
 * Where the account's deletion request stands. Requesting begins a review; it never erases the
 * account. `reason` says why the request is where it is (for example `fresh_authentication_required`).
 */
export const AccountDeletion = z.strictObject({
  status: z.enum(DELETION_STATUSES),
  requestId: z.uuid().nullable(),
  requestedAt: z.iso.datetime({ offset: true }).nullable(),
  scheduledFor: z.iso.datetime({ offset: true }).nullable(),
  reason: z.string(),
});
export type AccountDeletion = z.infer<typeof AccountDeletion>;

export const ProvisionSchoolInput = z.strictObject({
  name: z.string().trim().min(1).max(120),
  handle: z.string().trim().min(1).max(80),
  type: SchoolLevelSchema,
  idempotencyKey: z.string().uuid(),
});
export type ProvisionSchoolInput = z.infer<typeof ProvisionSchoolInput>;

export const ProvisionSchoolResult = z.strictObject({
  schoolId: z.string().uuid(),
  groupId: z.string().uuid().nullable().optional(),
  groupFailed: z.boolean().optional(),
});
export type ProvisionSchoolResult = z.infer<typeof ProvisionSchoolResult>;

export const HandleAvailableInput = z.strictObject({
  handle: z.string().trim().min(1).max(80),
});
export type HandleAvailableInput = z.infer<typeof HandleAvailableInput>;

export const HandleAvailableResult = z.strictObject({
  available: z.boolean(),
});
export type HandleAvailableResult = z.infer<typeof HandleAvailableResult>;

export const UpdateInstitutionInput = z.strictObject({
  schoolId: z.string().uuid(),
  name: z.string().trim().min(1).max(120).optional(),
  handle: z.string().trim().min(1).max(80).optional(),
  type: SchoolLevelSchema.optional(),
  avatarUrl: z.string().url().nullable().optional(),
  customBranding: z.record(z.string(), z.unknown()).nullable().optional(),
  timezone: z.string().min(1).max(80).optional(),
  guardianVerificationPolicy: z.enum(['open', 'strict']).optional(),
});
export type UpdateInstitutionInput = z.infer<typeof UpdateInstitutionInput>;

export const UpdateInstitutionResult = z.strictObject({
  success: z.boolean(),
  schoolId: z.string().uuid(),
});
export type UpdateInstitutionResult = z.infer<typeof UpdateInstitutionResult>;

export const CreateInviteCodeInput = z.strictObject({
  schoolId: z.string().uuid(),
  role: z.enum(['teacher', 'student', 'staff', 'guardian']),
  maxUses: z.number().int().positive().nullable().optional(),
  invitationText: z.string().max(255).optional(),
});
export type CreateInviteCodeInput = z.infer<typeof CreateInviteCodeInput>;

export const InviteCodeItem = z.strictObject({
  id: z.string().uuid(),
  schoolId: z.string().uuid(),
  code: z.string(),
  role: z.string(),
  maxUses: z.number().int().nullable(),
  usesCount: z.number().int(),
  invitationText: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.string(),
});
export type InviteCodeItem = z.infer<typeof InviteCodeItem>;

export const CreateInviteCodeResult = z.strictObject({
  inviteCode: InviteCodeItem,
});
export type CreateInviteCodeResult = z.infer<typeof CreateInviteCodeResult>;

export const ListInviteCodesInput = z.strictObject({
  schoolId: z.string().uuid(),
});
export type ListInviteCodesInput = z.infer<typeof ListInviteCodesInput>;

export const ListInviteCodesResult = z.strictObject({
  inviteCodes: z.array(InviteCodeItem),
});
export type ListInviteCodesResult = z.infer<typeof ListInviteCodesResult>;

export const RevokeInviteCodeInput = z.strictObject({
  schoolId: z.string().uuid(),
  codeId: z.string().uuid(),
});
export type RevokeInviteCodeInput = z.infer<typeof RevokeInviteCodeInput>;

export const RevokeInviteCodeResult = z.strictObject({
  success: z.boolean(),
});
export type RevokeInviteCodeResult = z.infer<typeof RevokeInviteCodeResult>;

export const appContract = {
  identity: {
    session: foundation.input(z.undefined()).output(
      z.strictObject({
        accountId: z.string().refine(isEdloveAccountId),
        expiresAt: z.number().int().positive(),
      }),
    ),
    scopes: foundation.input(z.undefined()).output(z.strictObject({ scopes: z.array(scope) })),
    // What a client reads to enter. Which bond is active stays the client's choice among these;
    // every command re-checks the bond it names.
    entry: foundation.input(z.undefined()).output(
      z.strictObject({
        accountId: z.string().refine(isEdloveAccountId),
        displayName: z.string().nullable(),
        onboardingCompleted: z.boolean(),
        scopes: z.array(scope),
      }),
    ),
    // The one way a signed-in person gets in. Returns the existing personal bond on retry.
    createInitialBond: foundation.input(InitialBondInput).output(scope),
    // The short-lived token a device presents to the PowerSync service. Never outlives the
    // session that asked for it; the device asks again when PowerSync needs a fresh one.
    syncGrant: foundation.input(z.undefined()).output(SyncGrant),
    // The account's own deletion request. Asking again returns the open request.
    deletion: {
      status: foundation.input(z.undefined()).output(AccountDeletion.nullable()),
      request: foundation.input(z.undefined()).output(AccountDeletion),
      cancel: foundation.input(z.undefined()).output(AccountDeletion),
    },
  },
  authority: {
    // Issues the signed offline permission snapshot for one bond. The device stores it and
    // checks the signature before use, so this works without sync.
    refreshSnapshot: foundation.input(z.strictObject({ bondId: z.uuid() })).output(
      z.strictObject({
        generatedAt: z.iso.datetime(),
        expiresAt: z.iso.datetime(),
        userId: z.string(),
        activeBondId: z.uuid(),
        activeEntityId: z.string(),
        activeEntityType: z.string(),
        schoolId: z.string().nullable(),
        policyVersion: z.string().min(1),
        permissions: z.record(z.string(), z.record(z.string(), z.boolean())),
        temporalHints: z.record(
          z.string(),
          z.strictObject({ deadline: z.string().optional(), availableFrom: z.string().optional() }),
        ),
        signature: z.string().min(1),
      }),
    ),
  },
  ops: {
    institutions: {
      handleAvailable: foundation.input(HandleAvailableInput).output(HandleAvailableResult),
      provision: foundation.input(ProvisionSchoolInput).output(ProvisionSchoolResult),
      update: foundation.input(UpdateInstitutionInput).output(UpdateInstitutionResult),
      createInviteCode: foundation.input(CreateInviteCodeInput).output(CreateInviteCodeResult),
      listInviteCodes: foundation.input(ListInviteCodesInput).output(ListInviteCodesResult),
      revokeInviteCode: foundation.input(RevokeInviteCodeInput).output(RevokeInviteCodeResult),
    },
  },
} satisfies RouterContract;

export type AppContract = typeof appContract;
export type AppContractClient = RouterContractClient<AppContract>;
