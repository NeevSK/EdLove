import { orpcClient } from '@repo/core/api/orpcClient';

export const sacredMissionsAPI = {
  async getManifestos(schoolId: string, userId?: string) {
    void userId;
    return this.list({ school_id: schoolId, status: 'active' });
  },

  async list(options: { school_id?: string; status?: string; limit?: number } = {}) {
    return orpcClient.sacredMissions.list({
      query: {
        school_id: options.school_id,
        status: options.status as 'active' | 'archived' | 'fulfilled' | undefined,
        limit: options.limit ?? 50,
      },
    });
  },

  async create(input: {
    school_id?: string;
    title: string;
    content: string;
    vibe?: string;
    target_date?: string | null;
  }) {
    return orpcClient.sacredMissions.create({
      body: {
        ...input,
        vibe: input.vibe as 'visionary' | 'supportive' | 'academic' | 'wellbeing' | undefined,
      },
    });
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
    return orpcClient.sacredMissions.endorse({
      params: { manifestoId },
      body: { commitment_text },
    });
  },

  async endorseManifesto(manifestoId: string, userId: string, commitmentText?: string) {
    void userId;
    return this.endorse(manifestoId, commitmentText);
  },

  async unendorse(manifestoId: string) {
    return orpcClient.sacredMissions.unendorse({ params: { manifestoId } });
  },

  async unendorseManifesto(manifestoId: string, userId: string) {
    void userId;
    return this.unendorse(manifestoId);
  },
};
