import { supabaseClient } from '@repo/core/adapters/supabaseClient';
import type {
  AuthMfaFactor,
  AuthSession,
  AuthUser,
  IAuthPort,
} from '@repo/core/logic/ports/auth.port';
import { APIError } from '@repo/core/types/API';
import { Platform } from 'react-native';

export class SupabaseAuthAdapter implements IAuthPort {
  private get client() {
    return supabaseClient;
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

  async signInWithGoogleIdToken(params: { idToken: string; accessToken?: string | null }) {
    const { data, error } = await this.client.auth.signInWithIdToken({
      provider: 'google',
      token: params.idToken,
      access_token: params.accessToken ?? undefined,
    });
    if (error) throw new APIError('Failed to sign in with Google id token', error.code, error);
    return { user: data.user as any, session: data.session as any };
  }

  async linkGoogleIdentity(params: { idToken: string; accessToken?: string | null }) {
    const { data, error } = await this.client.auth.linkIdentity({
      provider: 'google',
      token: params.idToken,
      access_token: params.accessToken ?? undefined,
    });
    if (error) throw new APIError('Failed to link Google identity', error.code, error);
    return { user: data.user as any, session: data.session as any };
  }

  async signInWithMagicLink(email: string) {
    const redirectTo = this.magicLinkRedirectUri();
    const { data, error } = await this.client.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });
    if (error) throw new APIError('Failed to send magic link', error.code, error);
    return { user: data.user as any, session: data.session as any };
  }

  private magicLinkRedirectUri(): string {
    if (Platform.OS === 'web') {
      return typeof window !== 'undefined' ? window.location.origin : '';
    }
    return 'gurudevi://auth/callback';
  }

  async exchangeCodeForSession(code: string) {
    const { data, error } = await this.client.auth.exchangeCodeForSession(code);
    if (error)
      throw new APIError('Failed to exchange magic-link code for session', error.code, error);
    return { user: data.user as any, session: data.session as any };
  }

  async signInWithPasskey(params?: { redirectTo?: string; skipBrowserRedirect?: boolean }) {
    const passkeyApi = (this.client.auth as any).passkey;
    if (!passkeyApi?.signIn) {
      throw new APIError(
        'Passkey sign-in is not supported by the current Supabase client',
        'AUTH_ERROR',
      );
    }

    const { data, error } = await passkeyApi.signIn({
      options: {
        redirectTo: params?.redirectTo,
        skipBrowserRedirect: params?.skipBrowserRedirect,
      },
    });
    if (error) throw new APIError('Failed to sign in with passkey', error.code, error);
    return data;
  }

  async registerPasskey(params?: { redirectTo?: string; skipBrowserRedirect?: boolean }) {
    const passkeyApi = (this.client.auth as any).passkey;
    if (!passkeyApi?.register) {
      throw new APIError(
        'Passkey registration is not supported by the current Supabase client',
        'AUTH_ERROR',
      );
    }

    const { data, error } = await passkeyApi.register({
      options: {
        redirectTo: params?.redirectTo,
        skipBrowserRedirect: params?.skipBrowserRedirect,
      },
    });
    if (error) throw new APIError('Failed to register passkey', error.code, error);
    return data;
  }

  async listMfaFactors() {
    const mfaApi = (this.client.auth as any).mfa;
    if (!mfaApi?.listFactors) {
      throw new APIError('MFA is not supported by the current Supabase client', 'AUTH_ERROR');
    }

    const { data, error } = await mfaApi.listFactors();
    if (error) throw new APIError('Failed to list MFA factors', error.code, error);

    const all = [
      ...((data?.totp ?? []) as AuthMfaFactor[]),
      ...((data?.phone ?? []) as AuthMfaFactor[]),
      ...((data?.webauthn ?? []) as AuthMfaFactor[]),
    ];
    const verified = all.filter((factor) => factor.status === 'verified');
    return { all, verified };
  }

  async enrollTotp(params?: { friendlyName?: string }) {
    const mfaApi = (this.client.auth as any).mfa;
    if (!mfaApi?.enroll) {
      throw new APIError(
        'MFA enrollment is not supported by the current Supabase client',
        'AUTH_ERROR',
      );
    }

    const { data, error } = await mfaApi.enroll({
      factorType: 'totp',
      friendlyName: params?.friendlyName,
    });
    if (error) throw new APIError('Failed to enroll TOTP factor', error.code, error);

    return {
      factorId: data.id,
      qrCode: data.totp?.qrCode ?? null,
      secret: data.totp?.secret ?? null,
      uri: data.totp?.uri ?? null,
    };
  }

  async challengeTotp(factorId: string) {
    const mfaApi = (this.client.auth as any).mfa;
    if (!mfaApi?.challenge) {
      throw new APIError(
        'MFA challenge is not supported by the current Supabase client',
        'AUTH_ERROR',
      );
    }

    const { data, error } = await mfaApi.challenge({ factorId });
    if (error) throw new APIError('Failed to create TOTP challenge', error.code, error);
    return { challengeId: data.id };
  }

  async verifyTotp(params: { factorId: string; challengeId: string; code: string }) {
    const mfaApi = (this.client.auth as any).mfa;
    if (!mfaApi?.verify) {
      throw new APIError(
        'MFA verification is not supported by the current Supabase client',
        'AUTH_ERROR',
      );
    }

    const { data, error } = await mfaApi.verify({
      factorId: params.factorId,
      challengeId: params.challengeId,
      code: params.code,
    });
    if (error) throw new APIError('Failed to verify TOTP code', error.code, error);
    return data as any;
  }

  async challengeAndVerifyTotp(params: { factorId: string; code: string }) {
    const mfaApi = (this.client.auth as any).mfa;
    if (!mfaApi?.challengeAndVerify) {
      throw new APIError(
        'TOTP challenge-and-verify is not supported by the current Supabase client',
        'AUTH_ERROR',
      );
    }

    const { data, error } = await mfaApi.challengeAndVerify({
      factorId: params.factorId,
      code: params.code,
    });
    if (error) throw new APIError('Failed to verify TOTP challenge', error.code, error);
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
