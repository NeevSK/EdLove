import { growth } from '../logic';
import { type SanctuaryManifesto, type ManifestoVibe } from '../types/Growth';
export * from '../types/Growth';

/**
 * sacredMissionsAPI (Legacy Proxy)
 */
export const sacredMissionsAPI = {
  async getManifestos(schoolId: string, userId?: string): Promise<SanctuaryManifesto[]> {
    return growth.getManifestos(schoolId, userId);
  },

  async createManifesto(input: {
    school_id: string;
    creator_id: string;
    title: string;
    content: string;
    vibe: ManifestoVibe;
    target_date?: string;
  }): Promise<SanctuaryManifesto> {
    return growth.createManifesto(input);
  },

  async endorseManifesto(manifestoId: string, userId: string, commitmentText?: string): Promise<boolean> {
    await growth.endorseManifesto(manifestoId, userId, commitmentText);
    return true;
  },

  async unendorseManifesto(manifestoId: string, userId: string): Promise<boolean> {
    await growth.unendorseManifesto(manifestoId, userId);
    return true;
  },
};
