import { type AgentSystemStatus, AgentSystemStatusSchema } from '@repo/core/api/agent.contract';
import { type AppType, createSovereignClient, SOVEREIGN_API_URL } from '@repo/core/api/base';
import { APIError } from '@repo/core/types/API';

const client = createSovereignClient<AppType>(SOVEREIGN_API_URL);

export const agentAPI = {
  async getSystemStatus(): Promise<AgentSystemStatus> {
    const res = await (client.api as any).agent['system-status'].$get();
    if (!res.ok) {
      throw new APIError('Failed to resolve agent system status', res.status.toString());
    }
    const data = await res.json();
    const parsed = AgentSystemStatusSchema.safeParse(data);
    if (!parsed.success) {
      throw new APIError(
        'Agent system status response failed contract validation',
        'INVALID_RESPONSE',
      );
    }
    return parsed.data;
  },
};
