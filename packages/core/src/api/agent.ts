import { type AgentSystemStatus, AgentSystemStatusSchema } from '@repo/core/api/agent.contract';
import { orpcClient } from '@repo/core/api/orpcClient';
import { APIError } from '@repo/core/types/API';

export const agentAPI = {
  async getSystemStatus(): Promise<AgentSystemStatus> {
    try {
      const data = await orpcClient.agent.getSystemStatus();
      const parsed = AgentSystemStatusSchema.safeParse(data);
      if (!parsed.success) {
        throw new APIError(
          'Agent system status response failed contract validation',
          'INVALID_RESPONSE',
        );
      }
      return parsed.data;
    } catch (error: any) {
      if (error instanceof APIError) throw error;
      throw new APIError(
        error.message || 'Failed to resolve agent system status',
        error.status?.toString() || error.code || 'AGENT_STATUS_FAILED',
      );
    }
  },
};
