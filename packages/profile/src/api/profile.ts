import { supabase } from '@repo/core';
import { APIError } from '@repo/core';

export const profileAPI = {
    /**
     * Get user profile from public.users table
     */
    async getUserProfile(userId: string) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .maybeSingle();

        if (error) {
            throw new APIError('Failed to fetch user profile', error.code, error);
        }

        return data; // Can be null for new guests
    },

    /**
     * Update user profile
     */
    async updateProfile(userId: string, updates: any) {
        const { data, error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            throw new APIError('Failed to update profile', error.code, error);
        }

        return data;
    },

    /**
     * Check if current user is anonymous based on profile flag
     */
    async isAnonymous(userId: string): Promise<boolean> {
        const { data: profile } = await supabase
            .from('users')
            .select('is_anonymous')
            .eq('id', userId)
            .single();

        return profile?.is_anonymous ?? false;
    }
};
