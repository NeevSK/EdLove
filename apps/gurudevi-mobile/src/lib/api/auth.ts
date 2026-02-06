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
     * Sign out
     */
    async signOut() {
        const { error } = await supabase.auth.signOut();

        if (error) {
            throw new APIError('Failed to sign out', error.code, error);
        }
    },
};
