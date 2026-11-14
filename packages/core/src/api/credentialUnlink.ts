import { CanonicalAccountIdSchema } from '@repo/core/logic/schemas/identity.schema';
import { z } from 'zod';

export const CredentialUnlinkRequestSchema = z.strictObject({ identityId: z.uuid() });
export const CredentialUnlinkFailureSchema = z.strictObject({
  error: z.enum([
    'RECENT_MFA_REQUIRED',
    'RECOVERY_CREDENTIAL_REQUIRED',
    'CREDENTIAL_UNLINK_NOT_ADMITTED',
    'CREDENTIAL_NOT_FOUND',
  ]),
  operationId: z.uuid().optional(),
});
export const CredentialUnlinkReceiptSchema = z.strictObject({
  accountId: CanonicalAccountIdSchema,
  operationId: z.uuid(),
  receiptId: z.uuid(),
  identityId: z.uuid(),
  provider: z.literal('google'),
  status: z.literal('confirmed'),
  user: z.strictObject({ id: z.uuid() }),
});
