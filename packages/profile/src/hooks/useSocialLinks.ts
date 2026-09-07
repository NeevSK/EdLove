import { profileAPI } from '@repo/core/api/client';
import { handleAPIError, useStore } from '@repo/core/logic';
import { SafeZustandStorage } from '@repo/core/storage-wrapper';
import { useAuthStore } from '@repo/core/store/useAuthStore';
import type { SocialLink } from '@repo/core/types';
import { useCallback, useEffect, useReducer } from 'react';

const SOCIAL_LINKS_CACHE_PREFIX = 'gurudevi-social-links-cache';

type SocialState = {
  links: SocialLink[];
  loading: boolean;
};

type SocialAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: SocialLink[] }
  | { type: 'ADD_LINK'; payload: SocialLink }
  | { type: 'UPDATE_LINK'; id: string; payload: SocialLink }
  | { type: 'DELETE_LINK'; id: string }
  | { type: 'FETCH_FAILURE' };

function socialReducer(state: SocialState, action: SocialAction): SocialState {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, links: action.payload };
    case 'ADD_LINK':
      return { ...state, links: [...state.links, action.payload] };
    case 'UPDATE_LINK':
      return { ...state, links: state.links.map((l) => (l.id === action.id ? action.payload : l)) };
    case 'DELETE_LINK':
      return { ...state, links: state.links.filter((l) => l.id !== action.id) };
    case 'FETCH_FAILURE':
      return { ...state, loading: false };
    default:
      return state;
  }
}

export function useSocialLinks(userId?: string) {
  const [state, dispatch] = useReducer(socialReducer, {
    links: [],
    loading: true,
  });

  const authUser = useAuthStore((s) => s.user);
  const isAnonymous = !authUser || authUser.is_anonymous;
  const isOnline = useStore((s) => s.isOnline);

  const { links, loading } = state;

  const fetchLinks = useCallback(async () => {
    if (!userId || isAnonymous) {
      dispatch({ type: 'FETCH_SUCCESS', payload: [] });
      return;
    }

    const cacheKey = `${SOCIAL_LINKS_CACHE_PREFIX}-${userId}`;

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
      const data = await profileAPI.getSocialLinks(userId);
      if (data) {
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
        void SafeZustandStorage.setItem(cacheKey, JSON.stringify(data));
      }
    } catch (error) {
      console.warn('[useSocialLinks] Failed to fetch social links:', error);
      dispatch({ type: 'FETCH_FAILURE' });
    }
  }, [isAnonymous, isOnline, userId]);

  useEffect(() => {
    void fetchLinks();
  }, [fetchLinks]);


  const addLink = async (link: Omit<SocialLink, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newLink = await profileAPI.upsertSocialLink(userId!, link);
      dispatch({ type: 'ADD_LINK', payload: newLink });
      return { success: true, data: newLink };
    } catch (error) {
      handleAPIError(error);
      return { success: false, error };
    }
  };

  const updateLink = async (id: string, updates: Partial<SocialLink>) => {
    try {
      const updatedLink = await profileAPI.upsertSocialLink(userId!, {
        id,
        user_id: userId,
        ...updates,
      });
      dispatch({ type: 'UPDATE_LINK', id, payload: updatedLink });
      return { success: true, data: updatedLink };
    } catch (error) {
      handleAPIError(error);
      return { success: false, error };
    }
  };

  const deleteLink = async (id: string) => {
    try {
      await profileAPI.deleteSocialLink(id);
      dispatch({ type: 'DELETE_LINK', id });
      return { success: true };
    } catch (error) {
      handleAPIError(error);
      return { success: false, error };
    }
  };

  return {
    links,
    loading,
    refresh: fetchLinks,
    addLink,
    updateLink,
    deleteLink,
  };
}
