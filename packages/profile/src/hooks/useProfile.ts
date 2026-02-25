import { useState, useEffect, useCallback } from 'react';
import { useUserRole, useRewards, handleAPIError, useMutationQueue } from '@repo/core';
import { profileAPI } from '../api/profile';
import { UserProfile } from '../types';
import { ProfileValidator } from '../lib/validator';

export function useProfile() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { role } = useUserRole();
    const { rewards, isLoading: isRewardsLoading } = useRewards();
    const addToQueue = useMutationQueue(state => state.addToQueue);

    const fetchProfile = useCallback(async () => {
        try {
            setLoading(true);
            const { data: { user } } = await import('@repo/core').then(m => m.supabase.auth.getUser());
            if (!user) return;

            const data = await profileAPI.getUserProfile(user.id);
            if (data) {
                setProfile({
                    ...data,
                    role: data.role || role || 'teacher',
                    school_name: data.schools?.name || null
                } as UserProfile);
            }
        } catch (error) {
            handleAPIError(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [role]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const refresh = useCallback(() => {
        setRefreshing(true);
        return fetchProfile();
    }, [fetchProfile]);

    /**
     * Update a profile field with validation and offline-first optimistic persistence
     */
    const updateField = async (field: keyof UserProfile, value: any) => {
        if (!profile) return { success: false };

        // 1. Pre-emptive Validation
        const validation = ProfileValidator.validate(String(field), value);
        if (!validation.isValid) {
            return { success: false, error: validation.error };
        }

        // 2. Optimistic Update (Instant UX)
        // We no longer backup for reversion because we are Offline-First.
        // User intent is preserved regardless of immediate network success.
        setProfile(prev => prev ? { ...prev, [field]: value } : null);

        // 3. Persistent Outbox (Sync Queue)
        // We add to queue first to ensure durability.
        addToQueue({
            type: 'UPDATE',
            scope: 'profile',
            name: 'updateProfileField',
            variables: { id: profile.id, [field]: value }
        });

        try {
            // 4. Persistence (Attempt immediate sync)
            await profileAPI.updateProfile(profile.id, { [field]: value });
            return { success: true };
        } catch (error) {
            // 5. No Reversion!
            // Change stays in local state and persistent queue for retry.
            // We only notify the user that sync is pending or failed.
            console.log('🔄 Sync pending for:', field);
            return { success: true, pending: true };
        }
    };

    const logout = useCallback(async () => {
        const { supabase } = await import('@repo/core');
        await supabase.auth.signOut();
    }, []);

    return {
        profile,
        loading: loading || isRewardsLoading,
        refreshing,
        refresh,
        logout,
        rewards,
        updateField
    };
}
