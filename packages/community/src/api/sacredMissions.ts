import type { ManifestoStatus, ManifestoVibe, SanctuaryManifesto } from '@repo/community/types';
import { sacredMissionsAPI as coreSacredMissionsAPI } from '@repo/core/api/sacredMissions';

export type { ManifestoStatus, ManifestoVibe, SanctuaryManifesto };

export const sacredMissionsAPI = {
  /**
   * Fetch manifestos for a school
   */
  async getManifestos(schoolId: string, userId?: string) {
    void userId;
    return (await coreSacredMissionsAPI.list({
      school_id: schoolId,
      status: 'active',
    })) as SanctuaryManifesto[];
  },

  /**
   * Create a new manifesto (Principals/Admins only)
   */
  async createManifesto(input: {
    school_id: string;
    creator_id: string;
    title: string;
    content: string;
    vibe: ManifestoVibe;
    target_date?: string;
  }) {
    return (await coreSacredMissionsAPI.create(input)) as SanctuaryManifesto;
  },

  /**
   * Endorse a manifesto
   */
  async endorseManifesto(manifestoId: string, userId: string, commitmentText?: string) {
    void userId;
    await coreSacredMissionsAPI.endorse(manifestoId, commitmentText);
    return true;
  },

  /**
   * Remove endorsement
   */
  async unendorseManifesto(manifestoId: string, userId: string) {
    void userId;
    await coreSacredMissionsAPI.unendorse(manifestoId);
    return true;
  },
};
