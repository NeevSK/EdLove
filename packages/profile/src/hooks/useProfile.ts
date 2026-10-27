import { useAuthStore } from '@repo/core/store';
import { useOfflineStatus } from '@repo/core/offline/useOfflineStatus';
import { deviceAccounts } from '@repo/core/accounts/deviceAccounts';
import { authAPI, identityAPI, profileAPI } from '@repo/core/api/client';
import { useRewards } from '@repo/core/hooks';
import { handleAPIError, useMutationQueue, useTemporalStore } from '@repo/core/logic';
import { getLocalGuestIdentity, updateLocalGuestIdentity } from '@repo/core/native/guestIdentity';
import { SafeZustandStorage } from '@repo/core/storage-wrapper';

import type { ProfileFieldUpdateResult } from '@repo/profile/hooks/profileFieldUpdateResult';
import { ProfileValidator } from '@repo/profile/lib/validator';
import type { UserProfile } from '@repo/profile/types';
import { useCallback, useEffect, useReducer } from 'react';

const PROFILE_CACHE_PREFIX = 'gurudevi-profile-cache';

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
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'UPDATE_FIELD'; field: keyof UserProfile; value: unknown };

export function profileReducer(state: ProfileState, action: ProfileAction): ProfileState {
  switch (action.type) {
    case 'FETCH_START':
      return {
        ...state,
        loading: !action.refreshing,
        refreshing: !!action.refreshing,
        error: null,
      };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, refreshing: false, error: null, profile: action.payload };
    case 'FETCH_FAILURE':
      return { ...state, loading: false, refreshing: false, error: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'UPDATE_FIELD':
      if (!state.profile) return state;
      return { ...state, profile: { ...state.profile, [action.field]: action.value } };
    default:
      return state;
  }
}

export const initialProfileState: ProfileState = {
  profile: null,
  loading: true,
  refreshing: false,
  error: null,
};

export function useProfile(userId?: string) {
  const [state, dispatch] = useReducer(profileReducer, initialProfileState);
  const { profile, loading, refreshing, error } = state;

  const authUser = useAuthStore((s) => s.user);
  const isAnonymous = !authUser || authUser.is_anonymous;
  const { isOnline } = useOfflineStatus();

  const { rewards, isLoading: isRewardsLoading } = useRewards({ userId });
  const addToQueue = useMutationQueue((s) => s.addToQueue);
  const viewDate = useTemporalStore((s) => s.viewDate);
  const phase = useTemporalStore((s) => s.phase);

  const fetchProfile = useCallback(
    async (isRefresh = false) => {
      try {
        dispatch({ type: 'FETCH_START', refreshing: isRefresh });

        // 1. Guest Mode isolation: read from local guest storage directly, never call cloud API
        if (isAnonymous && !userId) {
          const guestId = authUser?.id || 'guest';
          const local = await getLocalGuestIdentity(guestId);
          const guestProfile = {
            id: local.id,
            email: local.email,
            display_name: local.display_name,
            avatar_url: null,
            capacity: 'guest',
            school_id: null,
            school_name: null,
            organization_name: null,
            is_anonymous: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as unknown as UserProfile;


          dispatch({ type: 'FETCH_SUCCESS', payload: guestProfile });
          return;
        }

        const targetId = userId || (await identityAPI.getMyInternalId());
        if (!targetId) {
          dispatch({ type: 'FETCH_SUCCESS', payload: null });
          return;
        }

        const cacheKey = `${PROFILE_CACHE_PREFIX}-${targetId}-${viewDate}`;

        // 2. Load from local-first cache
        try {
          const raw = await SafeZustandStorage.getItem(cacheKey);
          if (raw) {
            const cached = JSON.parse(raw);
            dispatch({ type: 'FETCH_SUCCESS', payload: cached });
          }
        } catch {
          // Ignore cache parse error
        }

        // 3. Sync from remote if online
        if (!isOnline) {
          return;
        }

        const data =
          phase === 'past'
            ? await profileAPI.getUserProfileAsOf(targetId, viewDate)
            : await profileAPI.getUserProfile(targetId);

        if (data) {
          const resolved: UserProfile = {
            ...(data as UserProfile),
            school_name: (data as any).school_name ?? (data as any).organization_name ?? null,
          };
          dispatch({
            type: 'FETCH_SUCCESS',
            payload: resolved,
          });
          void SafeZustandStorage.setItem(cacheKey, JSON.stringify(resolved));
        }
      } catch (err) {
        console.warn('[useProfile] Failed to fetch profile:', err);
        dispatch({
          type: 'FETCH_FAILURE',
          payload: err instanceof Error ? err.message : 'Failed to fetch profile',
        });
      }
    },
    [authUser?.id, isAnonymous, isOnline, phase, userId, viewDate],
  );

  useEffect(() => {
    void fetchProfile(false);
  }, [fetchProfile]);

  const refresh = useCallback(() => {
    return fetchProfile(true);
  }, [fetchProfile]);

  const updateField = async (
    field: keyof UserProfile,
    value: UserProfile[keyof UserProfile],
  ): Promise<ProfileFieldUpdateResult> => {
    if (!profile) return { status: 'failed', error: 'Profile is not available' };

    const validation = ProfileValidator.validate(String(field), value);
    if (!validation.isValid) {
      return { status: 'failed', error: validation.error ?? 'Profile update is invalid' };
    }

    // Optimistic Update
    dispatch({ type: 'UPDATE_FIELD', field, value });

    // Handle guest updates locally
    if (isAnonymous || profile.is_anonymous) {
      try {
        if (field === 'display_name') {
          await updateLocalGuestIdentity(profile.id, { display_name: String(value ?? '') });
        }
        return { status: 'confirmed' };
      } catch {
        return { status: 'failed', error: 'Failed to update guest profile' };
      }
    }

    const cacheKey = `${PROFILE_CACHE_PREFIX}-${profile.id}-${viewDate}`;
    void SafeZustandStorage.setItem(
      cacheKey,
      JSON.stringify({ ...profile, [field]: value }),
    );

    addToQueue({
      type: 'UPDATE',
      scope: 'profile',
      name: 'updateProfileField',
      variables: { id: profile.id, [field]: value },
    });

    try {
      await profileAPI.updateProfile(profile.id, { [field]: value });
      return { status: 'confirmed' };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Profile update is waiting to sync';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { status: 'queued', error: errorMessage };
    }
  };

  const logout = useCallback(async () => {
    return deviceAccounts.signOutCurrentAccount();
  }, []);

  const uploadAvatar = useCallback(
    async (localUri: string) => {
      const targetId = profile?.id;
      if (!targetId) return { success: false };

      if (isAnonymous || profile?.is_anonymous) {
        // Guest mode avatar local update
        dispatch({
          type: 'UPDATE_FIELD',
          field: 'avatar_url',
          value: localUri,
        });
        return { success: true, data: { ...profile, avatar_url: localUri } };
      }

      try {
        const updatedProfile = await profileAPI.uploadAvatar(targetId, localUri);
        if (profile) {
          const merged = { ...profile, ...updatedProfile } as UserProfile;
          dispatch({
            type: 'FETCH_SUCCESS',
            payload: merged,
          });
          const cacheKey = `${PROFILE_CACHE_PREFIX}-${targetId}-${viewDate}`;
          void SafeZustandStorage.setItem(cacheKey, JSON.stringify(merged));
        }
        return { success: true, data: updatedProfile };
      } catch (err) {
        handleAPIError(err);
        return { success: false, error: err };
      }
    },
    [isAnonymous, profile, viewDate],
  );

  return {
    profile,
    error,
    loading: loading || isRewardsLoading,
    refreshing,
    refresh,
    logout,
    uploadAvatar,
    rewards,
    updateField,
  };
}

