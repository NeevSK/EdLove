import { profileAPI } from '@repo/core/api';
import type { CommunityProfile } from '@repo/core/logic';
import { handleAPIError, useStore, useTemporalStore } from '@repo/core/logic';
import { useCallback, useEffect, useReducer } from 'react';

type CommunityState = {
  community: CommunityProfile | null;
  loading: boolean;
};

type CommunityAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: CommunityProfile | null }
  | { type: 'FETCH_FAILURE' };

function communityReducer(state: CommunityState, action: CommunityAction): CommunityState {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, community: action.payload };
    case 'FETCH_FAILURE':
      return { ...state, loading: false, community: null };
    default:
      return state;
  }
}

type EditableCommunityField = 'name' | 'description';

export function useCommunityProfile(communityId: string) {
  const userId = useStore((state) => state.user?.id);
  const viewDate = useTemporalStore((state) => state.viewDate);
  const phase = useTemporalStore((state) => state.phase);
  const [state, dispatch] = useReducer(communityReducer, {
    community: null,
    loading: true,
  });

  const { community, loading } = state;

  const loadCommunity = useCallback(async () => {
    if (!communityId) {
      dispatch({ type: 'FETCH_SUCCESS', payload: null });
      return;
    }

    dispatch({ type: 'FETCH_START' });
    try {
      const data =
        phase === 'past'
          ? await profileAPI.getCommunityProfileAsOf(communityId, viewDate)
          : await profileAPI.getCommunityProfile(communityId);
      dispatch({ type: 'FETCH_SUCCESS', payload: data ?? null });
    } catch (error) {
      handleAPIError(error);
      dispatch({ type: 'FETCH_FAILURE' });
    }
  }, [communityId, phase, viewDate]);

  useEffect(() => {
    loadCommunity().catch(handleAPIError);
  }, [loadCommunity]);

  const updateField = useCallback(
    async (field: EditableCommunityField, value: string) => {
      if (!communityId) return;
      try {
        const data = await profileAPI.updateCommunityProfile(communityId, {
          field,
          value,
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: data ?? null });
      } catch (error) {
        handleAPIError(error);
      }
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
