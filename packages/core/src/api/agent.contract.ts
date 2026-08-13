import type { SovereignContract } from '@repo/core/api/contract';
import { z } from 'zod';

export const AgentSystemStatusSchema = z.object({
  request_id: z.string().min(1),
  api: z.object({
    status: z.literal('ok'),
    time_utc: z.string().min(1),
    version: z.string().nullable(),
  }),
  principal: z.object({
    user_id: z.string().min(1),
    capacity: z.string().nullable(),
    school_id: z.string().nullable(),
    active_bond_id: z.string().nullable(),
    active_entity_id: z.string().nullable(),
    active_entity_type: z.string().nullable(),
  }),
  authorization: z.object({
    evaluator: z.enum(['wasm', 'rust']),
    subject: z.literal('User'),
    action: z.literal('read'),
  }),
});

export const AgentApiErrorSchema = z.object({
  category: z.string().min(1),
  request_id: z.string().min(1),
});

const agentSystemStatusAuthority = () => ({ policy: { action: 'read', subject: 'User' } }) as const;

export const agentContract = {
  getSystemStatus: {
    method: 'get',
    path: '/agent/system-status',
    responses: {
      200: {
        schema: AgentSystemStatusSchema,
        description: 'Agent-visible system status snapshot for the authenticated principal',
      },
    },
    metadata: agentSystemStatusAuthority(),
  },
} as const satisfies SovereignContract;

export type AgentSystemStatus = z.infer<typeof AgentSystemStatusSchema>;
export type AgentApiError = z.infer<typeof AgentApiErrorSchema>;
