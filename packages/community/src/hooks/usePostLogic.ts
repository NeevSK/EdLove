import React, { useReducer, useCallback, useEffect } from 'react';
import { communityAPI } from '../api/community';
import type { CommunityPost } from '../types';

interface PostState {
  isLiked: boolean;
  likeCount: number;
  hasResonated: boolean;
  isResonating: boolean;
  isMenuOpen: boolean;
}

type PostAction =
  | { type: 'TOGGLE_LIKE'; isLiked: boolean; count: number }
  | { type: 'SET_RESONANCE'; hasResonated: boolean }
  | { type: 'START_RESONATE' }
  | { type: 'STOP_RESONATE' }
  | { type: 'TOGGLE_MENU' }
  | { type: 'CLOSE_MENU' };

function postReducer(state: PostState, action: PostAction): PostState {
  switch (action.type) {
    case 'TOGGLE_LIKE':
      return { ...state, isLiked: action.isLiked, likeCount: action.count };
    case 'SET_RESONANCE':
      return { ...state, hasResonated: action.hasResonated };
    case 'START_RESONATE':
      return { ...state, isResonating: true };
    case 'STOP_RESONATE':
      return { ...state, isResonating: false };
    case 'TOGGLE_MENU':
      return { ...state, isMenuOpen: !state.isMenuOpen };
    case 'CLOSE_MENU':
      return { ...state, isMenuOpen: false };
    default:
      return state;
  }
}

export function usePostLogic(post: CommunityPost, currentUserId?: string) {
  const { id, reactions = {} } = post;

  const [state, dispatch] = useReducer(postReducer, {
    isLiked: false,
    likeCount: Number(reactions['❤️']) || 0,
    hasResonated: false,
    isResonating: false,
    isMenuOpen: false,
  });

  useEffect(() => {
    dispatch({
      type: 'TOGGLE_LIKE',
      isLiked: false,
      count: Number(reactions['❤️']) || 0,
    });
  }, [id, reactions['❤️']]);

  useEffect(() => {
    if (!currentUserId) return;
    communityAPI
      .hasResonated(id)
      .then((hasRes) => dispatch({ type: 'SET_RESONANCE', hasResonated: hasRes }))
      .catch(() => null);
  }, [id, currentUserId]);

  const handleLike = useCallback(
    async (onLike?: () => void) => {
      const prevLiked = state.isLiked;
      const prevCount = state.likeCount;
      const nowLiked = !prevLiked;

      dispatch({
        type: 'TOGGLE_LIKE',
        isLiked: nowLiked,
        count: Math.max(0, prevCount + (nowLiked ? 1 : -1)),
      });

      try {
        await onLike?.();
      } catch {
        dispatch({ type: 'TOGGLE_LIKE', isLiked: prevLiked, count: prevCount });
      }
    },
    [state.isLiked, state.likeCount],
  );

  const handleResonate = useCallback(
    async (onResonate?: () => void) => {
      if (state.isResonating || !currentUserId) return;

      dispatch({ type: 'START_RESONATE' });
      const prev = state.hasResonated;
      dispatch({ type: 'SET_RESONANCE', hasResonated: !prev });

      try {
        const next = await communityAPI.toggleResonance(id);
        dispatch({ type: 'SET_RESONANCE', hasResonated: next });
        onResonate?.();
      } catch {
        dispatch({ type: 'SET_RESONANCE', hasResonated: prev });
      } finally {
        dispatch({ type: 'STOP_RESONATE' });
      }
    },
    [state.isResonating, state.hasResonated, currentUserId, id],
  );

  const toggleMenu = useCallback(() => dispatch({ type: 'TOGGLE_MENU' }), []);
  const closeMenu = useCallback(() => dispatch({ type: 'CLOSE_MENU' }), []);

  return {
    state,
    handleLike,
    handleResonate,
    toggleMenu,
    closeMenu,
  };
}
