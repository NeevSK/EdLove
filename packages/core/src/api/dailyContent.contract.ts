import type { SovereignContract } from '@repo/core/api/contracts';
import { z } from 'zod';

const DailyContentSchema = z.strictObject({
  id: z.string(),
  type: z.enum(['motivation', 'did_you_know']),
  content: z.string(),
  author: z.string().optional(),
  date: z.string(),
  active: z.boolean(),
  created_at: z.string(),
});

const DailyContentListSchema = z.array(DailyContentSchema);

export const dailyContentContract = {
  getToday: {
    method: 'get',
    path: '/daily-content/today',
    responses: {
      200: {
        schema: z.strictObject({
          motivation: DailyContentSchema.nullable(),
          didYouKnow: DailyContentSchema.nullable(),
        }),
        description: 'Daily content for today',
      },
    },
    metadata: {
      policy: {
        action: 'read',
        subject: 'DailyContent',
      },
    },
  },
  getForDate: {
    method: 'get',
    path: '/daily-content/:date',
    request: {
      params: z.strictObject({
        date: z.string(),
      }),
    },
    responses: {
      200: {
        schema: DailyContentListSchema,
        description: 'Daily content for a specific date',
      },
    },
    metadata: {
      policy: {
        action: 'read',
        subject: 'DailyContent',
      },
    },
  },
  getRecent: {
    method: 'get',
    path: '/daily-content/recent/:days',
    request: {
      params: z.strictObject({
        days: z.coerce.number().int().positive(),
      }),
    },
    responses: {
      200: {
        schema: DailyContentListSchema,
        description: 'Recent daily content',
      },
    },
    metadata: {
      policy: {
        action: 'read',
        subject: 'DailyContent',
      },
    },
  },
} as const satisfies SovereignContract;

export type DailyContent = z.infer<typeof DailyContentSchema>;
