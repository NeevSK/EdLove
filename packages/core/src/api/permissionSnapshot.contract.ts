import { z } from 'zod';

export const permissionSnapshotContract = {
  refresh: {
    method: 'post',
    path: '/authorization/refresh',
    responses: {
      200: {
        schema: z.object({
          generatedAt: z.string(),
          expiresAt: z.string(),
          userId: z.string().uuid(),
          activeBondId: z.string().uuid(),
          activeEntityId: z.string().uuid(),
          activeEntityType: z.string(),
          schoolId: z.string().uuid().nullable(),
          policyVersion: z.string(),
          permissions: z.record(z.string(), z.record(z.string(), z.boolean())),
          temporalHints: z.record(
            z.string(),
            z.object({ deadline: z.string().optional(), availableFrom: z.string().optional() }),
          ),
          signature: z.string(),
        }),
        description: 'Refreshed authorization snapshot',
      },
    },
    metadata: { policy: { action: 'read', subject: 'User' } },
  },
};
