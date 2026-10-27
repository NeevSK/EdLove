import { CanonicalAccountIdSchema } from '@repo/core/logic/schemas/identity.schema';
import { z } from 'zod';

export const SyncCredentialsSchema = z.strictObject({
  accountId: CanonicalAccountIdSchema,
  endpoint: z.url(),
  token: z.string().min(1),
  expiresAt: z.number().int().positive(),
});
