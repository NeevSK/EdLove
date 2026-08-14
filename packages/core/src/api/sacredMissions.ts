import { type AppType, createSovereignClient, SOVEREIGN_API_URL } from '@repo/core/api/base';
import { APIError } from '@repo/core/types/API';

const client = createSovereignClient<AppType>(SOVEREIGN_API_URL);

export const sacredMissionsAPI = {
  async getManifestos(schoolId: string, userId?: string) {
    void userId;
    return this.list({ school_id: schoolId, status: 'active' });
  },

  async list(options: { school_id?: string; status?: string; limit?: number } = {}) {
    const res = await (client.api as any).sacredMissions.list.$post({
      json: {
        school_id: options.school_id,
        status: options.status,
        limit: options.limit ?? 50,
      },
    });
    if (!res.ok) throw new APIError('Failed to fetch sacred missions', res.status.toString());
    return await res.json();
  },

  async create(input: {
    school_id?: string;
    title: string;
    content: string;
    vibe?: string;
    target_date?: string | null;
  }) {
    const res = await (client.api as any).sacredMissions.create.$post({ json: input });
    if (!res.ok) throw new APIError('Failed to create sacred mission', res.status.toString());
    return await res.json();
  },

  async createManifesto(input: {
    school_id: string;
    creator_id?: string;
    title: string;
    content: string;
    vibe: string;
    target_date?: string;
  }) {
    const { creator_id: _creatorId, ...manifestoInput } = input;
    return this.create(manifestoInput);
  },

  async endorse(manifestoId: string, commitment_text?: string) {
    const res = await (client.api as any).sacredMissions.endorse.$post({
      json: { manifestoId, commitment_text },
    });
    if (!res.ok) throw new APIError('Failed to endorse sacred mission', res.status.toString());
    return await res.json();
  },

  async endorseManifesto(manifestoId: string, userId: string, commitmentText?: string) {
    void userId;
    return this.endorse(manifestoId, commitmentText);
  },

  async unendorse(manifestoId: string) {
    const res = await (client.api as any).sacredMissions.unendorse.$post({ json: { manifestoId } });
    if (!res.ok)
      throw new APIError('Failed to remove sacred mission endorsement', res.status.toString());
    return await res.json();
  },

  async unendorseManifesto(manifestoId: string, userId: string) {
    void userId;
    return this.unendorse(manifestoId);
  },
};
