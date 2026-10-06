import { deviceTrustAPI } from '@repo/core/api/deviceTrust';
import type {
  AccountDeletionRequest,
  AccountLifecycleStatus,
  AuthChangeEvent,
  AuthSession,
  AuthUser,
  IAuthPort,
} from '@repo/core/logic/ports/auth.port';
import type { IIdentityPort } from '@repo/core/logic/ports/identity.port';
import { trackProductEvent } from '@repo/core/monitoring';
import type { Capacity } from '@repo/core/types';
import { APIError } from '@repo/core/types/API';

export interface AuthManagerConfig {
  onSignOut?: () => Promise<void>;
  storage?: {
    clearAll: () => void;
  };
}

export class AuthManager {
  private anonymousSignInPromise: Promise<{
    user: AuthUser | null;
    session: AuthSession | null;
  }> | null = null;

  constructor(
    private authPort: IAuthPort,
    private identityPort: IIdentityPort,
    private config: AuthManagerConfig = {},
  ) {}

  async getSession(): Promise<AuthSession | null> {
    return this.authPort.getSession();
  }

  async getUser(): Promise<AuthUser | null> {
    return this.authPort.getUser();
  }

  onAuthStateChange(
    callback: (event: AuthChangeEvent, session: AuthSession | null) => void | Promise<void>,
  ) {
    return this.authPort.onAuthStateChange(callback);
  }

  private async recordAuthMethodUsage(
    action: string,
    metadata: Record<string, unknown>,
    accountId?: string | null,
  ) {
    try {
      await deviceTrustAPI.logAuditEvent(action, metadata, accountId ?? undefined);
    } catch (error) {
      console.warn('[AuthManager] auth method audit log failed', error);
    }
  }

  async signIn(email: string, password: string) {
    const result = await this.authPort.signInWithPassword(email, password);
    await this.recordAuthMethodUsage(
      'AUTH_SIGN_IN_PASSWORD',
      {
        method: 'password',
        outcome: 'success',
        hasSession: !!result.session,
      },
      result.user?.id,
    );
    return result;
  }

  async signInWithOAuth(provider: 'google', redirectTo?: string, skipBrowserRedirect = false) {
    const result = await this.authPort.signInWithOAuth({
      provider,
      redirectTo,
      skipBrowserRedirect,
    });
    await this.recordAuthMethodUsage('AUTH_SIGN_IN_OAUTH_STARTED', {
      method: provider,
      outcome: 'initiated',
      redirectTo: redirectTo ?? null,
      skipBrowserRedirect,
      hasUrl: !!result.url,
    });
    return result;
  }

  async linkOAuthIdentity(provider: 'google', redirectTo?: string, skipBrowserRedirect = false) {
    const result = await this.authPort.linkOAuthIdentity({
      provider,
      redirectTo,
      skipBrowserRedirect,
    });
    await this.recordAuthMethodUsage('AUTH_LINK_OAUTH_STARTED', {
      method: provider,
      outcome: 'initiated',
      redirectTo: redirectTo ?? null,
      skipBrowserRedirect,
      hasUrl: !!result.url,
    });
    return result;
  }

  async signInWithGoogleIdToken(idToken: string, accessToken?: string | null) {
    const result = await this.authPort.signInWithGoogleIdToken({ idToken, accessToken });
    await this.recordAuthMethodUsage(
      'AUTH_SIGN_IN_GOOGLE_NATIVE',
      {
        method: 'google_native',
        outcome: 'success',
        hasSession: !!result.session,
      },
      result.user?.id,
    );
    return result;
  }

  async linkGoogleIdentity(idToken: string, accessToken?: string | null) {
    const result = await this.authPort.linkGoogleIdentity({ idToken, accessToken });
    await this.recordAuthMethodUsage(
      'AUTH_LINK_GOOGLE_NATIVE',
      {
        method: 'google_native',
        outcome: 'success',
        hasSession: !!result.session,
      },
      result.user?.id,
    );
    return result;
  }

  async signInWithMagicLink(email: string) {
    const result = await this.authPort.signInWithMagicLink(email);
    await this.recordAuthMethodUsage(
      'AUTH_SIGN_IN_MAGIC_LINK',
      {
        method: 'magic_link',
        outcome: 'initiated',
        hasSession: !!result.session,
      },
      result.user?.id ?? null,
    );
    return result;
  }

  async exchangeCodeForSession(code: string) {
    const result = await this.authPort.exchangeCodeForSession(code);
    await this.recordAuthMethodUsage(
      'AUTH_MAGIC_LINK_EXCHANGE',
      {
        method: 'magic_link',
        outcome: 'success',
        hasSession: !!result.session,
      },
      result.user?.id,
    );
    return result;
  }

  async signInWithPasskey(redirectTo?: string, skipBrowserRedirect = false) {
    const result = await this.authPort.signInWithPasskey({ redirectTo, skipBrowserRedirect });
    await this.recordAuthMethodUsage('AUTH_SIGN_IN_PASSKEY_STARTED', {
      method: 'passkey',
      outcome: 'initiated',
      redirectTo: redirectTo ?? null,
      skipBrowserRedirect,
      hasUrl: !!result.url,
    });
    return result;
  }

  async registerPasskey(redirectTo?: string, skipBrowserRedirect = false) {
    const result = await this.authPort.registerPasskey({ redirectTo, skipBrowserRedirect });
    await this.recordAuthMethodUsage('AUTH_REGISTER_PASSKEY_STARTED', {
      method: 'passkey',
      outcome: 'initiated',
      redirectTo: redirectTo ?? null,
      skipBrowserRedirect,
      hasUrl: !!result.url,
    });
    return result;
  }

  async listMfaFactors() {
    return this.authPort.listMfaFactors();
  }

  async enrollTotp(friendlyName?: string) {
    const result = await this.authPort.enrollTotp({ friendlyName });
    await this.recordAuthMethodUsage('AUTH_ENROLL_TOTP_STARTED', {
      method: 'totp',
      outcome: 'initiated',
      friendlyName: friendlyName ?? null,
      factorId: result.factorId,
    });
    return result;
  }

  async challengeTotp(factorId: string) {
    const result = await this.authPort.challengeTotp(factorId);
    await this.recordAuthMethodUsage('AUTH_TOTP_CHALLENGE_STARTED', {
      method: 'totp',
      outcome: 'initiated',
      factorId,
      challengeId: result.challengeId,
    });
    return result;
  }

  async verifyTotp(params: { factorId: string; challengeId: string; code: string }) {
    const result = await this.authPort.verifyTotp(params);
    await this.recordAuthMethodUsage(
      'AUTH_TOTP_VERIFIED',
      {
        method: 'totp',
        outcome: 'success',
        factorId: params.factorId,
        challengeId: params.challengeId,
        hasSession: !!result.session,
      },
      result.user?.id,
    );
    return result;
  }

  async challengeAndVerifyTotp(params: { factorId: string; code: string }) {
    const result = await this.authPort.challengeAndVerifyTotp(params);
    await this.recordAuthMethodUsage(
      'AUTH_TOTP_VERIFIED',
      {
        method: 'totp',
        outcome: 'success',
        factorId: params.factorId,
        hasSession: !!result.session,
      },
      result.user?.id,
    );
    return result;
  }

  async signUp(
    email: string,
    password: string,
    fullName?: string,
  ) {
    const result = await this.authPort.signUp({
      email,
      password,
      options: { data: { display_name: fullName } },
    });

    if (!result.session) {
      throw new APIError(
        'Your account was created without an active session. Please contact support before trying again.',
        'AUTH_SIGN_UP_SESSION_MISSING',
      );
    }

    await this.recordAuthMethodUsage('AUTH_SIGN_UP_PASSWORD', {
      method: 'password',
      outcome: 'success',
      displayName: fullName ?? null,
      hasSession: true,
    });

    return result;
  }

  /**
   * Anonymous Supabase sessions are valid onboarding identities. They use the
   * normal policy surface after onboarding and do not receive guest-specific
   * Cedar policies.
   */
  async signInAnonymously() {
    const currentSession = await this.authPort.getSession();
    if (currentSession?.user?.is_anonymous) {
      return { session: currentSession, user: currentSession.user as AuthUser };
    }
    if (this.anonymousSignInPromise) return this.anonymousSignInPromise;
    this.anonymousSignInPromise = this.authPort.signInAnonymously();
    try {
      const result = await this.anonymousSignInPromise;
      trackProductEvent('guest_started');
      return result;
    } finally {
      this.anonymousSignInPromise = null;
    }
  }

  async linkAnonymousToEmail(
    email: string,
    password: string,
    fullName: string,
    capacity: Capacity,
  ) {
    // 1. Update Auth Identity
    const { user } = await this.authPort.updateUser({
      email,
      password,
      data: {
        display_name: fullName,
        capacity,
        is_anonymous: false,
        citizenship: 'SECOND_CLASS',
      },
    });

    if (!user) throw new APIError('Auth update returned no user', 'AUTH_ERROR');

    // 2. Resolve Internal Identity
    const identity = await this.identityPort.identifyActiveCitizen();
    if (!identity)
      throw new APIError('Cannot resolve user identity after linking', 'IDENTITY_ERROR');
    const internalId = identity.id;

    // 3. Update Domain Profile
    await this.identityPort.updateProfile(internalId, {
      email,
      display_name: fullName,
      is_anonymous: false,
      citizenship: 'SECOND_CLASS',
      capacity,
      onboarding_completed: true,
      onboarding_completed_at: new Date().toISOString(),
    });

    // 4. Ensure Link Presence
    await this.identityPort.linkIdentity(internalId, 'supabase', user.id);

    await this.recordAuthMethodUsage(
      'AUTH_LINK_ANONYMOUS_TO_EMAIL',
      {
        method: 'password',
        outcome: 'success',
        linkedFrom: 'anonymous',
        capacity,
        email_domain: email.includes('@') ? (email.split('@')[1] ?? null) : null,
      },
      internalId,
    );

    trackProductEvent('account_converted');

    return { user };
  }

  async isAnonymous(): Promise<boolean> {
    const identity = await this.identityPort.identifyActiveCitizen();
    if (!identity) return false;
    const profile = await this.identityPort.getProfile(identity.id);
    return profile?.is_anonymous ?? false;
  }

  /**
   * Sovereign Sign-Out Flow
   */
  async signOut(options?: { scope?: 'global' | 'local' | 'others' }) {
    // 1. Clear identity cache (usually in identityPort implementation)
    // In this manager pattern, we might need a dedicated clear method or it happens in identityPort.

    // 2. Platform-specific teardown (PowerSync, etc.) via config
    if (this.config.onSignOut) {
      try {
        await this.config.onSignOut();
      } catch (e) {
        console.warn('[AuthManager] onSignOut hook failed', e);
      }
    }

    // 3. Clear storage
    if (this.config.storage) {
      try {
        this.config.storage.clearAll();
      } catch (e) {
        console.warn('[AuthManager] storage clearing failed', e);
      }
    }

    // 4. Server-side sign out
    await this.recordAuthMethodUsage('AUTH_SIGN_OUT', {
      method: 'session',
      outcome: 'success',
    });

    await this.authPort.signOut(options);
  }

  async setSession(access_token: string, refresh_token: string) {
    const result = await this.authPort.setSession(access_token, refresh_token);
    await this.recordAuthMethodUsage(
      'AUTH_SESSION_SET',
      {
        method: 'session',
        outcome: 'success',
        hasUser: !!result.user,
        hasSession: !!result.session,
      },
      result.user?.id,
    );
    return result;
  }

  async requestAccountDeletion(): Promise<AccountDeletionRequest> {
    const response = getAccountDeletionRequestResponse(
      await this.authPort.executeRpc('request_account_deletion'),
    );

    if (!isAccountDeletionRequest(response)) {
      throw new APIError('Account deletion request returned an invalid response.');
    }

    return response;
  }

  async getAccountDeletionRequestStatus(): Promise<AccountDeletionRequest | null> {
    const response = getAccountDeletionRequestResponse(
      await this.authPort.executeRpc('get_account_deletion_request_status'),
    );

    if (response === undefined) return null;
    if (!isAccountDeletionRequest(response)) {
      throw new APIError('Account deletion status returned an invalid response.');
    }

    return response;
  }

  async cancelAccountDeletionRequest(): Promise<AccountDeletionRequest> {
    const response = getAccountDeletionRequestResponse(
      await this.authPort.executeRpc('cancel_account_deletion_request'),
    );

    if (!isAccountDeletionRequest(response)) {
      throw new APIError('Cancel account deletion request returned an invalid response.');
    }

    return response;
  }

  async getAccountLifecycleStatus(): Promise<AccountLifecycleStatus> {
    const response = getAccountLifecycleStatusResponse(
      await this.authPort.executeRpc('get_account_lifecycle_status'),
    );

    if (!isAccountLifecycleStatus(response)) {
      throw new APIError('Account lifecycle status returned an invalid response.');
    }

    return response;
  }
}

function getAccountDeletionRequestResponse(value: unknown): unknown {
  return Array.isArray(value) ? value[0] : value;
}

function isAccountDeletionRequest(value: unknown): value is AccountDeletionRequest {
  if (!value || typeof value !== 'object') return false;

  const request = value as Record<string, unknown>;
  return (
    typeof request.status === 'string' &&
    isAccountDeletionRequestStatus(request.status) &&
    (typeof request.request_id === 'string' || request.request_id === null) &&
    (typeof request.requested_at === 'string' || request.requested_at === null) &&
    (request.scheduled_for === undefined ||
      typeof request.scheduled_for === 'string' ||
      request.scheduled_for === null) &&
    typeof request.reason === 'string'
  );
}

function isAccountDeletionRequestStatus(value: string): boolean {
  return ['pending_verification', 'scheduled', 'cancelled', 'completed', 'blocked'].includes(value);
}

function getAccountLifecycleStatusResponse(value: unknown): unknown {
  return Array.isArray(value) ? value[0] : value;
}

function isAccountLifecycleStatus(value: unknown): value is AccountLifecycleStatus {
  if (!value || typeof value !== 'object') return false;

  const status = value as Record<string, unknown>;
  return (
    typeof status.status === 'string' &&
    [
      'active',
      'pending_verification',
      'scheduled',
      'deactivated',
      'cancelled',
      'completed',
      'blocked',
    ].includes(status.status) &&
    (typeof status.deactivated_at === 'string' || status.deactivated_at === null) &&
    (typeof status.request_id === 'string' || status.request_id === null) &&
    (typeof status.scheduled_for === 'string' || status.scheduled_for === null) &&
    typeof status.reason === 'string'
  );
}
