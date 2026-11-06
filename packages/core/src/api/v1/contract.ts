import { oc, type RouterContract, type RouterContractClient } from '@orpc/contract';
import { z } from 'zod';
import { isEdloveAccountId } from '../../logic/utils/edloveUuidV8';

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
  },
  authority: {
    // Issues the signed offline permission snapshot for one bond. The snapshot itself
    // reaches the device through sync; this returns only when it was made.
    refreshSnapshot: foundation.input(z.strictObject({ bondId: z.uuid() })).output(
      z.strictObject({
        generatedAt: z.iso.datetime(),
        expiresAt: z.iso.datetime(),
        policyVersion: z.string().min(1),
      }),
    ),
  },
} satisfies RouterContract;

export type AppContract = typeof appContract;
export type AppContractClient = RouterContractClient<AppContract>;
