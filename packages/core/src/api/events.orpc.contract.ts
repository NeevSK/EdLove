import { z } from 'zod';

export const eventDispatchInputSchema = z.object({
  name: z.string().min(1),
  data: z.record(z.string(), z.unknown()),
});

export const eventDispatchOutputSchema = z.object({
  success: z.boolean(),
  event: z.string(),
});

export const eventsORPCContract = {
  dispatch: {
    method: 'post',
    path: '/events/dispatch',
    request: {
      body: eventDispatchInputSchema,
    },
    responses: {
      200: {
        schema: eventDispatchOutputSchema,
        description: 'Dispatched event to sovereign Inngest event bridge',
      },
    },
    metadata: {
      policy: {
        action: 'create',
        subject: 'User',
      },
    },
  },
} as const;
