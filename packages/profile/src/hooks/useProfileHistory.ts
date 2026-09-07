import { identityAPI, profileAPI } from '@repo/core/api/client';
import { handleAPIError, type ProfileHistoryEntry, useStore } from '@repo/core/logic';
import { SafeZustandStorage } from '@repo/core/storage-wrapper';
import { useAuthStore } from '@repo/core/store/useAuthStore';
import { useCallback, useEffect, useReducer } from 'react';

const PROFILE_HISTORY_CACHE_PREFIX = 'gurudevi-profile-history-cache';

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

  const authUser = useAuthStore((s) => s.user);
  const isAnonymous = !authUser || authUser.is_anonymous;
  const isOnline = useStore((s) => s.isOnline);

  const { history, loading } = state;

  const loadHistory = useCallback(async () => {
    if (isAnonymous && !userId) {
      dispatch({ type: 'FETCH_SUCCESS', payload: [] });
      return;
    }

    const targetId = userId || (await identityAPI.getMyInternalId());
    if (!targetId) {
      dispatch({ type: 'FETCH_SUCCESS', payload: [] });
      return;
    }

    const cacheKey = `${PROFILE_HISTORY_CACHE_PREFIX}-${targetId}`;

    // Load from cache first
    try {
      const raw = await SafeZustandStorage.getItem(cacheKey);
      if (raw) {
        dispatch({ type: 'FETCH_SUCCESS', payload: JSON.parse(raw) });
      }
    } catch {
      // Ignore
    }

    if (!isOnline) {
      return;
    }

    dispatch({ type: 'FETCH_START' });
    try {
      const data = await profileAPI.getUserProfileHistory(targetId, limit);
      if (data) {
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
        void SafeZustandStorage.setItem(cacheKey, JSON.stringify(data));
      }
    } catch (error) {
      console.warn('[useProfileHistory] Failed to fetch profile history:', error);
      dispatch({ type: 'FETCH_FAILURE' });
    }
  }, [isAnonymous, isOnline, limit, userId]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  return { history, loading, refresh: loadHistory };
}

