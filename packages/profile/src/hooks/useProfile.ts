import { authAPI, identityAPI, profileAPI } from '@repo/core/api';
import { useRewards } from '@repo/core/hooks';
import { handleAPIError, useMutationQueue, useTemporalStore } from '@repo/core/logic';

import { useCallback, useEffect, useReducer } from 'react';
import { ProfileValidator } from '@repo/profile/lib/validator';
import type { UserProfile } from '@repo/profile/types';

type ProfileState = {
  profile: UserProfile | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
};

type ProfileAction =
  | { type: 'FETCH_START'; refreshing?: boolean }
  | { type: 'FETCH_SUCCESS'; payload: UserProfile | null }
  | { type: 'FETCH_FAILURE'; payload: string }
  | { type: 'UPDATE_FIELD'; field: keyof UserProfile; value: unknown };

function profileReducer(state: ProfileState, action: ProfileAction): ProfileState {
  switch (action.type) {
    case 'FETCH_START':
      return {
        ...state,
        loading: !action.refreshing,
        refreshing: !!action.refreshing,
        error: null,
      };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, refreshing: false, profile: action.payload };
    case 'FETCH_FAILURE':
      return { ...state, loading: false, refreshing: false, error: action.payload };
    case 'UPDATE_FIELD':
      if (!state.profile) return state;
      return { ...state, profile: { ...state.profile, [action.field]: action.value } };
    default:
      return state;
  }
}

const initialState: ProfileState = {
  profile: null,
  loading: true,
  refreshing: false,
  error: null,
};

export function useProfile(userId?: string) {
  const [state, dispatch] = useReducer(profileReducer, initialState);
  const { profile, loading, refreshing } = state;

  const { rewards, isLoading: isRewardsLoading } = useRewards({ userId });
  const addToQueue = useMutationQueue((state) => state.addToQueue);
  const viewDate = useTemporalStore((state) => state.viewDate);
  const phase = useTemporalStore((state) => state.phase);

  const fetchProfile = useCallback(async () => {
    try {
      dispatch({ type: 'FETCH_START', refreshing });

      const targetId = userId || (await identityAPI.getMyInternalId());
      if (!targetId) {
        dispatch({ type: 'FETCH_SUCCESS', payload: null });
        return;
      }

      const data =
        phase === 'past'
          ? await profileAPI.getUserProfileAsOf(targetId, viewDate)
          : await profileAPI.getUserProfile(targetId);

      if (data) {
        dispatch({
          type: 'FETCH_SUCCESS',
          payload: {
            ...data,
            school_name: (data as any).schools?.name || data.organization_name || null,
          } as UserProfile,
        });
      } else {
        dispatch({ type: 'FETCH_SUCCESS', payload: null });
      }
    } catch (error) {
      const errorMessage = (error as any)?.message;
      if (errorMessage !== 'Expected HMRClient.setup() call at startup.') {
        handleAPIError(error);
        dispatch({ type: 'FETCH_FAILURE', payload: errorMessage || 'Failed to fetch profile' });
      }
    }
  }, [phase, userId, viewDate, refreshing]);

  useEffect(() => {
    fetchProfile().catch(handleAPIError);
  }, [fetchProfile]);

  const refresh = useCallback(() => {
    dispatch({ type: 'FETCH_START', refreshing: true });
    return fetchProfile();
  }, [fetchProfile]);

  const updateField = async (field: keyof UserProfile, value: any) => {
    if (!profile) return { success: false };

    const validation = ProfileValidator.validate(String(field), value);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    // Optimistic Update
    dispatch({ type: 'UPDATE_FIELD', field, value });

    addToQueue({
      type: 'UPDATE',
      scope: 'profile',
      name: 'updateProfileField',
      variables: { id: profile.id, [field]: value },
    });

    try {
      await profileAPI.updateProfile(profile.id, { [field]: value });
      return { success: true };
    } catch (error) {
      console.log('Sync pending for:', field, error);
      return { success: true, pending: true };
    }
  };

  const logout = useCallback(async () => {
    await authAPI.signOut();
  }, []);

  const uploadAvatar = useCallback(
    async (localUri: string) => {
      const targetId = profile?.id;
      if (!targetId) return { success: false };

      try {
        const updatedProfile = await profileAPI.uploadAvatar(targetId, localUri);
        if (profile) {
          dispatch({
            type: 'FETCH_SUCCESS',
            payload: { ...profile, ...updatedProfile } as UserProfile,
          });
        }
        return { success: true, data: updatedProfile };
      } catch (error) {
        handleAPIError(error);
        return { success: false, error };
      }
    },
    [profile],
  );

  return {
    profile,
    loading: loading || isRewardsLoading,
    refreshing,
    refresh,
    logout,
    uploadAvatar,
    rewards,
    updateField,
  };
}
