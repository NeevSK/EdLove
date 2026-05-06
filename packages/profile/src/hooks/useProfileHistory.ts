import { identityAPI, profileAPI } from '@repo/core/api';
import type { ProfileHistoryEntry } from '@repo/core/logic';
import { handleAPIError } from '@repo/core/logic';
import { useCallback, useEffect, useReducer } from 'react';

type HistoryState = {
  history: ProfileHistoryEntry[];
  loading: boolean;
};

type HistoryAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: ProfileHistoryEntry[] }
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

export function useProfileHistory(userId?: string, limit = 20) {
  const [state, dispatch] = useReducer(historyReducer, {
    history: [],
    loading: true,
  });

  const { history, loading } = state;

  const loadHistory = useCallback(async () => {
    dispatch({ type: 'FETCH_START' });
    try {
      const targetId = userId || (await identityAPI.getMyInternalId());
      if (!targetId) {
        dispatch({ type: 'FETCH_SUCCESS', payload: [] });
        return;
      }

      const data = await profileAPI.getUserProfileHistory(targetId, limit);
      dispatch({ type: 'FETCH_SUCCESS', payload: data });
    } catch (error) {
      handleAPIError(error);
      dispatch({ type: 'FETCH_FAILURE' });
    }
  }, [limit, userId]);

  useEffect(() => {
    loadHistory().catch(handleAPIError);
  }, [loadHistory]);

  return { history, loading, refresh: loadHistory };
}
