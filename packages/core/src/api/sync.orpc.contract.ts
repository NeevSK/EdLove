import { z } from 'zod';

const syncAuthority = (action: 'update') =>
  ({
    policy: { action, subject: 'User' },
  }) as const;

export const syncORPCContract = {
  uploadBatch: {
    method: 'post',
    path: '/powersync/upload',
    request: {
      body: z.object({
        idempotencyKey: z.string().min(1),
        crud: z.array(
          z.object({
            id: z.string(),
            op: z.enum(['PUT', 'PATCH', 'DELETE']),
            table: z.string(),
            opData: z.record(z.string(), z.any()).optional(),
          }),
        ),
      }),
    },
    responses: {
      200: {
        schema: z.object({
          success: z.boolean(),
          processedCount: z.number(),
          idempotent: z.boolean().optional(),
        }),
        description: 'PowerSync batch uploaded and processed successfully',
      },
    },
    metadata: syncAuthority('update'),
  },
};