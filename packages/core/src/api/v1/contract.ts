import { oc, type RouterContract, type RouterContractClient } from '@orpc/contract';
import { z } from 'zod';
import { isEdloveAccountId } from '../../logic/schemas/edloveUuidV8';

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
} satisfies RouterContract;

export type AppContract = typeof appContract;
export type AppContractClient = RouterContractClient<AppContract>;
