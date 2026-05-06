import { profileAPI } from '@repo/core/api';
import type { CommunityProfile, ProfileHistoryEntry } from '@repo/core/logic';
import { handleAPIError } from '@repo/core/logic';
import { useCallback, useEffect, useReducer } from 'react';

type HistoryState = {
  history: ProfileHistoryEntry<CommunityProfile>[];
  loading: boolean;
};

type HistoryAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: ProfileHistoryEntry<CommunityProfile>[] }
  | { type: 'FETCH_FAILURE' };

function historyReducer(state: HistoryState, action: HistoryAction): HistoryState {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, history: action.payload };
    case 'FETCH_FAILURE':
      return { ...state, loading: false };
    default:
      return state;
  }
}

export function useCommunityProfileHistory(communityId: string, limit = 20) {
  const [state, dispatch] = useReducer(historyReducer, {
    history: [],
    loading: true,
  });

  const { history, loading } = state;

  const loadHistory = useCallback(async () => {
    if (!communityId) {
      dispatch({ type: 'FETCH_SUCCESS', payload: [] });
      return;
    }

    dispatch({ type: 'FETCH_START' });
    try {
      const data = await profileAPI.getCommunityProfileHistory(communityId, limit);
      dispatch({ type: 'FETCH_SUCCESS', payload: data });
    } catch (error) {
      handleAPIError(error);
      dispatch({ type: 'FETCH_FAILURE' });
    }
  }, [communityId, limit]);

  useEffect(() => {
    loadHistory().catch(handleAPIError);
  }, [loadHistory]);

  return { history, loading, refresh: loadHistory };
}
