import { orpcClient } from '@repo/core/api/orpcClient';
import { mappingContract, mappingTopology } from '@repo/core/api/mapping.contract';
import { KnowledgeTopologySchema } from '@repo/core/logic/schemas/dashboard.schema';
import { APIError } from '@repo/core/types/API';
import type { KnowledgeTopology } from '@repo/core/types/topology';

export type MappingTopology = ReturnType<typeof mappingTopology.parse>;

export const mappingAPI = {
  async getById(id: string): Promise<MappingTopology | null> {
    try {
      const res = await orpcClient.mapping.getById({ params: { id } });
      return mappingTopology.nullable().parse(res);
    } catch (error: any) {
      throw new APIError(
        error.message || 'Failed to fetch topology',
        error.status?.toString() || error.code || 'TOPOLOGY_FETCH_FAILED',
      );
    }
  },

  async getSchoolPulse(schoolId: string, viewDate?: string): Promise<KnowledgeTopology | null> {
    try {
      const res = await orpcClient.mapping.getSchoolPulse({
        params: { schoolId },
        query: viewDate ? { viewDate } : {},
      });
      return KnowledgeTopologySchema.parse(res);
    } catch (error: any) {
      throw new APIError(
        error.message || 'Failed to fetch school mapping pulse',
        error.status?.toString() || error.code || 'TOPOLOGY_FETCH_FAILED',
      );
    }
  },

  async upsert(topology: Partial<MappingTopology>): Promise<MappingTopology> {
    if (!topology.id) throw new APIError('A topology id is required', '400');
    try {
      const res = await orpcClient.mapping.upsert({
        params: { id: topology.id },
        body: {
          nodes: topology.nodes,
          links: topology.links,
          supportedPerspectives: topology.supportedPerspectives,
          context: topology.context,
          name: topology.name,
          description: topology.description,
          isPublic: topology.is_public,
        },
      });
      return mappingTopology.parse(res);
    } catch (error: any) {
      throw new APIError(
        error.message || 'Failed to save topology',
        error.status?.toString() || error.code || 'TOPOLOGY_SAVE_FAILED',
      );
    }
  },

  async createShareLink(id: string, expiresDays = 7): Promise<string> {
    try {
      const res = await orpcClient.mapping.createShareLink({
        params: { id },
        body: { expiresDays },
      });
      return (res as any).token as string;
    } catch (error: any) {
      throw new APIError(
        error.message || 'Failed to create topology share link',
        error.status?.toString() || error.code || 'TOPOLOGY_SHARE_FAILED',
      );
    }
  },
};

void mappingContract;
