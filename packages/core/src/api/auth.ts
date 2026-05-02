import type { Role } from '../logic/schemas/role.schema';
import { APIError } from '../types/API';
import { identityAPI } from './identity';
import { supabase } from './supabase';

export const authAPI = {

  /**
   * Returns the raw Supabase auth session.
   * Internal use only for system-level authentication tasks.
   */
  async getAuthSession() {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      throw new APIError('Failed to get session', error.code, error);
    }

    return data.session;
  },


  /**
   * Returns the raw Supabase auth user object.
   * Internal use only for identity resolution or auth metadata extraction.
   */
  async getAuthUser() {
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
   * Sign in with OAuth provider
   */
  async signInWithOAuth(provider: 'google', redirectTo?: string, skipBrowserRedirect = false) {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        skipBrowserRedirect,
        queryParams: { prompt: 'select_account' },
      },
    });

    if (error) {
      throw new APIError('Failed to sign in with OAuth', error.code, error);
    }

    return data;
  },

  /**
   * Link OAuth identity to current auth account
   */
  async linkOAuthIdentity(provider: 'google', redirectTo?: string, skipBrowserRedirect = false) {
    const { data, error } = await supabase.auth.linkIdentity({
      provider,
      options: {
        redirectTo,
        skipBrowserRedirect,
        queryParams: { prompt: 'select_account' },
      },
    });

    if (error) {
      throw new APIError('Failed to link OAuth identity', error.code, error);
    }

    return data;
  },

  /**
   * Manually sets the auth session (e.g. after OAuth redirect)
   */
  async setSession(access_token: string, refresh_token: string) {
    const { data, error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });

    if (error) {
      throw new APIError('Failed to set session', error.code, error);
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
