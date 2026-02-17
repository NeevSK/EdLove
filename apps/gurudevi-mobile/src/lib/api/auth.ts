import { supabase } from '../supabase';
import { APIError } from './types';

export const authAPI = {
    /**
     * Get current user session
     */
    async getSession() {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
            throw new APIError('Failed to get session', error.code, error);
        }

        return data.session;
    },

    /**
     * Get current user
     */
    async getUser() {
        const { data, error } = await supabase.auth.getUser();

        if (error) {
            throw new APIError('Failed to get user', error.code, error);
        }

        return data.user;
    },

    /**
     * Sign in with email
     */
    async signIn(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            throw new APIError('Failed to sign in', error.code, error);
        }

        return data;
    },

    /**
     * Sign up with email
     */
    async signUp(email: string, password: string, fullName?: string) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
            },
        });

        if (error) {
            throw new APIError('Failed to sign up', error.code, error);
        }

        return data;
    },

    async getUserProfile(userId: string) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            throw new APIError('Failed to fetch user profile', error.code, error);
        }

        return data;
    },

    /**
     * Create anonymous user session
     */
    async signInAnonymously() {
        const { data, error } = await supabase.auth.signInAnonymously({
            options: {
                data: {
                    full_name: 'Guest User',
                    role: 'teacher',
                    is_anonymous: true,
                }
            }
        });

        if (error) {
            throw new APIError('Failed to create anonymous session', error.code, error);
        }

        return data;
    },

    /**
     * Link anonymous account to email/password
     */
    async linkAnonymousToEmail(email: string, password: string, fullName: string, role: string) {
        // First, update the user's email and password in auth
        const { data: updateData, error: updateError } = await supabase.auth.updateUser({
            email,
            password,
            data: {
                full_name: fullName,
                role: role,
                is_anonymous: false,
            }
        });

        if (updateError) {
            throw new APIError('Failed to link anonymous account', updateError.code, updateError);
        }

        // Update the profile in public.users
        const { error: profileError } = await supabase
            .from('users')
            .update({
                email,
                full_name: fullName,
                role,
                is_anonymous: false,
                onboarding_completed: true,
                onboarding_completed_at: new Date().toISOString(),
            })
            .eq('id', updateData.user.id);

        if (profileError) {
            throw new APIError('Failed to update profile', profileError.code, profileError);
        }

        return updateData;
    },

    /**
     * Check if current user is anonymous
     */
    async isAnonymous(): Promise<boolean> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        const { data: profile } = await supabase
            .from('users')
            .select('is_anonymous')
            .eq('id', user.id)
            .single();

        return profile?.is_anonymous ?? false;
    },

    /**
     * Sign out
     */
    async signOut() {
        const { error } = await supabase.auth.signOut();

        if (error) {
            throw new APIError('Failed to sign out', error.code, error);
        }
    },
};
