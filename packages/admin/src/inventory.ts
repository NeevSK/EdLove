import {
  inventoryAPI,
  supabase,
  type InstitutionalAsset,
  type InventoryRequest,
  type ResourceNeedSummary,
} from '@repo/core';

function isMissingTable(error: unknown): boolean {
  const message = (error as any)?.message ?? '';
  return typeof message === 'string' && message.includes('does not exist');
}

export type { InstitutionalAsset, InventoryRequest, ResourceNeedSummary };

export const adminInventoryAPI = {
  async listInstitutionalAssets(schoolId: string): Promise<InstitutionalAsset[]> {
    const { data, error } = await supabase
      .from('school_inventory')
      .select('*')
      .eq('school_id', schoolId)
      .order('name', { ascending: true });

    if (error) {
      if (isMissingTable(error)) return [];
      throw error;
    }

    return (data ?? []) as InstitutionalAsset[];
  },

  async getSchoolRequests(schoolId: string): Promise<InventoryRequest[]> {
    return inventoryAPI.getSchoolRequests(schoolId);
  },

  async getResourceNeeds(schoolId: string): Promise<ResourceNeedSummary[]> {
    return (await inventoryAPI.getSchoolResourceNeeds(schoolId)) as ResourceNeedSummary[];
  },
};
