import { CanonicalAccountIdSchema } from '@repo/core/logic/schemas/identity.schema';
import { z } from 'zod';

export const CredentialInventorySchema = z.strictObject({
  accountId: CanonicalAccountIdSchema,
  provider: z.literal('supabase'),
  anonymous: z.boolean(),
  identities: z.array(
    z.strictObject({
      id: z.uuid(),
      provider: z.string().min(1).max(100),
    }),
  ),
});

export type CredentialInventory = z.infer<typeof CredentialInventorySchema>;

export const AuthenticatorIdSchema = z.uuid();
export const VerifiedAuthenticatorProjectionSchema = z.array(
  z.object({ id: AuthenticatorIdSchema, friendly_name: z.string().optional() }),
);
export const AuthenticatorAssuranceSchema = z.enum(['aal1', 'aal2']);
