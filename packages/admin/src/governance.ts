import { supabase } from '@repo/core';

export const governanceAPI = {
  async getCommunityHQGroupId(schoolId: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('community_groups')
      .select('id')
      .eq('school_id', schoolId)
      .limit(1);

    if (error) throw error;
    return data?.[0]?.id ?? null;
  },
};
