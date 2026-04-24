import type { Role } from '../logic/schemas/role.schema';
import { APIError } from '../types';
import { identityAPI } from './identity';
import { supabase } from './supabase';

export const authAPI = {
  /**
   * Get current auth session.
   * NOTE: This returns the Supabase auth session (JWT, is_anonymous, email, etc.).
   * Do NOT use session.user.id for DB queries  use identityAPI.getMyInternalId() instead.
   */
  async getSession() {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      throw new APIError('Failed to get session', error.code, error);
    }

    return data.session;
  },

  /**
   * Get current Supabase auth user object.
   * NOTE: Returns the auth layer user. Do NOT use user.id for DB queries
   * use identityAPI.getMyInternalId() to get the internal users.id instead.
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
    const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();

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
          role: 'teacher' as Role,
          is_anonymous: true,
        },
      },
    });

    if (error) {
      throw new APIError('Failed to create anonymous session', error.code, error);
    }

    return data;
  },

  /**
   * Link anonymous account to email/password
   */
  async linkAnonymousToEmail(email: string, password: string, fullName: string, role: Role) {
    // First, update the user's email and password in auth
    const { data: updateData, error: updateError } = await supabase.auth.updateUser({
      email,
      password,
      data: {
        full_name: fullName,
        role: role,
        is_anonymous: false,
      },
    });

    if (updateError) {
      throw new APIError('Failed to link anonymous account', updateError.code, updateError);
    }

    // Update the profile in public.users using the internal user ID.
    // Use upsert so conversion still succeeds even if the DB trigger missed creating the row.
    const internalId = await identityAPI.getMyInternalId();
    if (!internalId) {
      throw new APIError('Cannot resolve user identity after linking', 'IDENTITY_ERROR');
    }

    const { error: profileError } = await supabase.from('users').upsert(
      {
        id: internalId,
        email,
        full_name: fullName,
        role,
        is_anonymous: false,
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
      },
      {
        onConflict: 'id',
      },
    );

    if (profileError) {
      throw new APIError('Failed to update profile', profileError.code, profileError);
    }

    // Ensure auth -> internal mapping is present after upgrade.
    if (updateData?.user?.id) {
      await identityAPI.linkIdentity(internalId, 'supabase', updateData.user.id);
    }

    return updateData;
  },

  /**
   * Check if current user is anonymous
   */
  async isAnonymous(): Promise<boolean> {
    const userId = await identityAPI.getMyInternalId();
    if (!userId) return false;

    const { data: profile } = await supabase
      .from('users')
      .select('is_anonymous')
      .eq('id', userId)
      .single();

    return profile?.is_anonymous ?? false;
  },

  /**
   * Sign out
   */
  async signOut() {
    identityAPI.clearCache();
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new APIError('Failed to sign out', error.code, error);
    }
  },

  /**
   * Delete current user account
   */
  async deleteAccount() {
    const { error } = await supabase.rpc('delete_user_account');

    if (error) {
      throw new APIError('Failed to delete account', error.code, error);
    }

    // Also sign out locally just in case
    await this.signOut();
  },
};
