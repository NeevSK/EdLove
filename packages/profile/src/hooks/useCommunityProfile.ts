import { useCallback, useEffect, useState } from 'react';
import { communityAPI, supabase, useStore } from '@repo/core';

type CommunityProfile = {
  id: string;
  name: string;
  description?: string | null;
  visibility?: string | null;
  member_count?: number | null;
  creator_id?: string | null;
};

type EditableCommunityField = 'name' | 'description';

export function useCommunityProfile(communityId: string) {
  const userId = useStore((state) => state.user?.id);
  const [community, setCommunity] = useState<CommunityProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadCommunity = useCallback(async () => {
    if (!communityId) {
      setCommunity(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await communityAPI.getGroupById(communityId);
      setCommunity((data as CommunityProfile) ?? null);
    } catch {
      setCommunity(null);
    } finally {
      setLoading(false);
    }
  }, [communityId]);

  useEffect(() => {
    void loadCommunity();
  }, [loadCommunity]);

  const updateField = useCallback(
    async (field: EditableCommunityField, value: string) => {
      if (!communityId) return;
      const { data, error } = await supabase
        .from('community_groups')
        .update({ [field]: value, updated_at: new Date().toISOString() })
        .eq('id', communityId)
        .select('*')
        .single();

      if (error) throw error;
      setCommunity((data as CommunityProfile) ?? null);
    },
    [communityId],
  );

  return {
    community,
    loading,
    updateField,
    isEditable: Boolean(userId && community?.creator_id === userId),
  };
}
