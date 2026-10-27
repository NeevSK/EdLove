import { CanonicalAccountIdSchema } from '@repo/core/logic/schemas/identity.schema';
import { z } from 'zod';

export const PasswordChangeRequestSchema = z.strictObject({
  password: z.string().min(6).max(1024),
  currentPassword: z.string().max(1024).optional(),
  nonce: z.string().min(1).max(256).optional(),
});
export const PasswordChangeReceiptSchema = z.strictObject({
  accountId: CanonicalAccountIdSchema,
  operationId: z.uuid(),
  receiptId: z.uuid(),
  status: z.literal('confirmed'),
  user: z.strictObject({ id: z.uuid() }),
});

export const PasswordChangeFailureSchema = z.strictObject({
  error: z.enum([
    'RECENT_MFA_REQUIRED',
    'PASSWORD_REAUTHENTICATION_REQUIRED',
    'PASSWORD_REAUTHENTICATION_INVALID',
    'PASSWORD_UNCHANGED',
    'PASSWORD_TOO_WEAK',
    'PASSWORD_CHANGE_NOT_CONFIRMED',
  ]),
  operationId: z.uuid().optional(),
});
