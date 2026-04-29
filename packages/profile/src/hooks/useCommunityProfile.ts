import { useStore, useTemporalStore } from '@repo/core/logic';

import { useCallback, useEffect, useState } from 'react';
import { profileAPI } from '../api/profile';
import type { CommunityProfile } from '../domains/profile/ports';

type EditableCommunityField = 'name' | 'description';

export function useCommunityProfile(communityId: string) {
  const userId = useStore((state) => state.user?.id);
  const viewDate = useTemporalStore((state) => state.viewDate);
  const phase = useTemporalStore((state) => state.phase);
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
      const data =
        phase === 'past'
          ? await profileAPI.getCommunityProfileAsOf(communityId, viewDate)
          : await profileAPI.getCommunityProfile(communityId);
      setCommunity(data ?? null);
    } catch {
      setCommunity(null);
    } finally {
      setLoading(false);
    }
  }, [communityId, phase, viewDate]);

  useEffect(() => {
    void loadCommunity();
  }, [loadCommunity]);

  const updateField = useCallback(
    async (field: EditableCommunityField, value: string) => {
      if (!communityId) return;
      const data = await profileAPI.updateCommunityProfile(communityId, field, value);
      setCommunity(data ?? null);
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
