import { type AppType, createSovereignClient, SOVEREIGN_API_URL } from '@repo/core/api/base';
import { mappingContract, mappingTopology } from '@repo/core/api/mapping.contract';
import { KnowledgeTopologySchema } from '@repo/core/logic/schemas/dashboard.schema';
import { APIError } from '@repo/core/types/API';
import type { KnowledgeTopology } from '@repo/core/types/topology';

const client = createSovereignClient<AppType>(SOVEREIGN_API_URL);

export type MappingTopology = ReturnType<typeof mappingTopology.parse>;

export const mappingAPI = {
  async getById(id: string): Promise<MappingTopology | null> {
    const res = await (client.api as any).mapping.topologies[':id'].$get({ param: { id } });
    if (!res.ok) throw new APIError('Failed to fetch topology', res.status.toString());
    return mappingTopology.nullable().parse(await res.json());
  },

  async getSchoolPulse(schoolId: string, viewDate?: string): Promise<KnowledgeTopology | null> {
    const res = await (client.api as any).mapping.schools[':schoolId'].pulse.$get({
      param: { schoolId },
      query: viewDate ? { viewDate } : {},
    });
    if (!res.ok) throw new APIError('Failed to fetch school mapping pulse', res.status.toString());
    return KnowledgeTopologySchema.parse(await res.json());
  },

  async upsert(topology: Partial<MappingTopology>): Promise<MappingTopology> {
    if (!topology.id) throw new APIError('A topology id is required', '400');
    const res = await (client.api as any).mapping.topologies[':id'].$put({
      param: { id: topology.id },
      json: {
        nodes: topology.nodes,
        links: topology.links,
        supportedPerspectives: topology.supportedPerspectives,
        context: topology.context,
        name: topology.name,
        description: topology.description,
        isPublic: topology.is_public,
      },
    });
    if (!res.ok) throw new APIError('Failed to save topology', res.status.toString());
    return mappingTopology.parse(await res.json());
  },

  async createShareLink(id: string, expiresDays = 7): Promise<string> {
    const res = await (client.api as any).mapping.topologies[':id'].share.$post({
      param: { id },
      json: { expiresDays },
    });
    if (!res.ok) throw new APIError('Failed to create topology share link', res.status.toString());
    return (await res.json()).token as string;
  },
};

void mappingContract;
