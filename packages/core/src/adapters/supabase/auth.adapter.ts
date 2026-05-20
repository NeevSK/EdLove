import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from '../../api/supabase';
import type { AuthSession, AuthUser, IAuthPort } from '../../logic/ports/auth.port';
import { APIError } from '../../types/API';

export class SupabaseAuthAdapter implements IAuthPort {
  private get client() {
    return __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__;
  }

  async getSession(): Promise<AuthSession | null> {
    const { data, error } = await this.client.auth.getSession();
    if (error) throw new APIError('Failed to get session', error.code, error);
    return data.session as any;
  }

  async getUser(): Promise<AuthUser | null> {
    const { data, error } = await this.client.auth.getUser();
    if (error) throw new APIError('Failed to get user', error.code, error);
    return data.user as any;
  }

  async signInWithPassword(email: string, password: string) {
    const { data, error } = await this.client.auth.signInWithPassword({ email, password });
    if (error) throw new APIError('Failed to sign in', error.code, error);
    return data as any;
  }

  async signInWithOAuth(params: {
    provider: 'google';
    redirectTo?: string;
    skipBrowserRedirect?: boolean;
  }) {
    const { data, error } = await this.client.auth.signInWithOAuth({
      provider: params.provider,
      options: {
        redirectTo: params.redirectTo,
        skipBrowserRedirect: params.skipBrowserRedirect,
        queryParams: { prompt: 'select_account' },
      },
    });
    if (error) throw new APIError('Failed to sign in with OAuth', error.code, error);
    return data;
  }

  async linkOAuthIdentity(params: {
    provider: 'google';
    redirectTo?: string;
    skipBrowserRedirect?: boolean;
  }) {
    const { data, error } = await this.client.auth.linkIdentity({
      provider: params.provider,
      options: {
        redirectTo: params.redirectTo,
        skipBrowserRedirect: params.skipBrowserRedirect,
        queryParams: { prompt: 'select_account' },
      },
    });
    if (error) throw new APIError('Failed to link OAuth identity', error.code, error);
    return data as any;
  }

  async setSession(access_token: string, refresh_token: string) {
    const { data, error } = await this.client.auth.setSession({ access_token, refresh_token });
    if (error) throw new APIError('Failed to set session', error.code, error);
    return data as any;
  }

  async signUp(params: {
    email: string;
    password: string;
    options?: { data?: Record<string, any> };
  }) {
    const { data, error } = await this.client.auth.signUp(params);
    if (error) throw new APIError('Failed to sign up', error.code, error);
    return data as any;
  }

  async signInAnonymously(options?: { data?: Record<string, any> }) {
    const { data, error } = await this.client.auth.signInAnonymously({ options });
    if (error) throw new APIError('Failed to create anonymous session', error.code, error);
    return data as any;
  }

  async updateUser(params: { email?: string; password?: string; data?: Record<string, any> }) {
    const { data, error } = await this.client.auth.updateUser(params);
    if (error) throw new APIError('Failed to update user', error.code, error);
    return data as any;
  }

  async signOut() {
    const { error } = await this.client.auth.signOut();
    if (error) throw new APIError('Failed to sign out', error.code, error);
  }

  async executeRpc(fn: string, params?: Record<string, any>) {
    const { data, error } = await this.client.rpc(fn, params);
    if (error) throw new APIError(`Failed to call ${fn}`, error.code, error);
    return data;
  }
}
