import { z } from 'zod';

export const durableAgentRequestSchema = z.object({
  mode: z.enum(['demo', 'live']),
  classroomId: z.uuid(),
  studentId: z.uuid().optional(),
  demoScenario: z.string().optional(),
  focusPrompt: z.string().min(1).max(500).optional(),
  evidenceScopes: z.array(z.string()).min(1).max(4),
  reviewMode: z.literal('draft_only'),
});

export const durableAgentRunSchema = z.object({
  runId: z.uuid(),
  status: z.enum(['queued', 'running', 'completed', 'failed']),
  runType: z.string().nullable(),
  mode: z.string().nullable(),
  summaryDraft: z.string().nullable(),
  error: z.string().nullable(),
});

export type DurableAgentRequest = z.infer<typeof durableAgentRequestSchema>;
export type DurableAgentRun = z.infer<typeof durableAgentRunSchema>;
