import React, { useReducer, useCallback, useEffect } from 'react';
import { supabase } from '@repo/core/native';
import { communityAPI } from '../api/community';

interface PollState {
  counts: Record<string, number>;
  userVotes: Set<string>;
  totalVotes: number;
  isLoading: boolean;
  isVoting: boolean;
}

type PollAction =
  | { type: 'SET_DATA'; counts: Record<string, number>; total: number; userVotes: Set<string> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_VOTING'; payload: boolean };

function pollReducer(state: PollState, action: PollAction): PollState {
  switch (action.type) {
    case 'SET_DATA':
      return {
        ...state,
        counts: action.counts,
        totalVotes: action.total,
        userVotes: action.userVotes,
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_VOTING':
      return { ...state, isVoting: action.payload };
    default:
      return state;
  }
}

const initialState: PollState = {
  counts: {},
  userVotes: new Set(),
  totalVotes: 0,
  isLoading: true,
  isVoting: false,
};

export function usePollLogic(postId: string, currentUserId?: string, allowMultiple = false) {
  const [state, dispatch] = useReducer(pollReducer, initialState);

  const fetchVotes = useCallback(async () => {
    try {
      const { data: countData, error: countError } = await supabase
        .from('community_poll_votes')
        .select('option_id')
        .eq('post_id', postId);
      if (countError) throw countError;

      const newCounts: Record<string, number> = {};
      let total = 0;
      (countData ?? []).forEach((v: any) => {
        newCounts[v.option_id] = (newCounts[v.option_id] ?? 0) + 1;
        total++;
      });

      let myVotesSet = new Set<string>();
      if (currentUserId) {
        const { data: myVotesData, error: myVotesError } = await supabase
          .from('community_poll_votes')
          .select('option_id')
          .eq('post_id', postId)
          .eq('user_id', currentUserId);
        if (myVotesError) throw myVotesError;
        (myVotesData ?? []).forEach((v: any) => myVotesSet.add(v.option_id));
      }

      dispatch({ type: 'SET_DATA', counts: newCounts, total, userVotes: myVotesSet });
    } catch (err) {
      console.error('[PollLogic] fetchVotes error:', err);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [postId, currentUserId]);

  useEffect(() => {
    fetchVotes();
  }, [fetchVotes]);

  const handleVote = useCallback(
    async (optionId: string) => {
      if (!currentUserId || state.isVoting) return;
      dispatch({ type: 'SET_VOTING', payload: true });
      try {
        await communityAPI.voteInPoll(postId, optionId, allowMultiple);
        await fetchVotes();
      } catch (err) {
        console.error('[PollLogic] vote error:', err);
      } finally {
        dispatch({ type: 'SET_VOTING', payload: false });
      }
    },
    [postId, currentUserId, allowMultiple, state.isVoting, fetchVotes],
  );

  return {
    ...state,
    handleVote,
    refreshVotes: fetchVotes,
  };
}
