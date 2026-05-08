import { IAuthPort, AuthSession, AuthUser } from '../ports/auth.port';
import { IIdentityPort } from '../ports/identity.port';
import { Capacity } from '../../types';
import { APIError } from '../../types/API';

export interface AuthManagerConfig {
  onSignOut?: () => Promise<void>;
  storage?: {
    clearAll: () => void;
  };
}

export class AuthManager {
  constructor(
    private authPort: IAuthPort,
    private identityPort: IIdentityPort,
    private config: AuthManagerConfig = {}
  ) {}

  async getSession(): Promise<AuthSession | null> {
    return this.authPort.getSession();
  }

  async getUser(): Promise<AuthUser | null> {
    return this.authPort.getUser();
  }

  async signIn(email: string, password: string) {
    return this.authPort.signInWithPassword(email, password);
  }

  async signInWithOAuth(provider: 'google', redirectTo?: string, skipBrowserRedirect = false) {
    return this.authPort.signInWithOAuth({ provider, redirectTo, skipBrowserRedirect });
  }

  async linkOAuthIdentity(provider: 'google', redirectTo?: string, skipBrowserRedirect = false) {
    return this.authPort.linkOAuthIdentity({ provider, redirectTo, skipBrowserRedirect });
  }

  async signUp(email: string, password: string, fullName?: string) {
    return this.authPort.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    });
  }

  async signInAnonymously() {
    return this.authPort.signInAnonymously({
      data: {
        full_name: 'Guest User',
        capacity: 'student' as Capacity,
        is_anonymous: true,
        citizenship: 'WANDERER',
      }
    });
  }

  async linkAnonymousToEmail(email: string, password: string, fullName: string, capacity: Capacity) {
    // 1. Update Auth Identity
    const { user } = await this.authPort.updateUser({
      email,
      password,
      data: {
        full_name: fullName,
        capacity,
        is_anonymous: false,
        citizenship: 'SECOND_CLASS',
      }
    });

    if (!user) throw new APIError('Auth update returned no user', 'AUTH_ERROR');

    // 2. Resolve Internal Identity
    const internalId = await this.identityPort.getMyInternalId();
    if (!internalId) throw new APIError('Cannot resolve user identity after linking', 'IDENTITY_ERROR');

    // 3. Update Domain Profile
    await this.identityPort.updateProfile(internalId, {
      email,
      full_name: fullName,
      is_anonymous: false,
      citizenship: 'SECOND_CLASS',
      onboarding_completed: true,
      onboarding_completed_at: new Date().toISOString(),
    });

    // 4. Ensure Link Presence
    await this.identityPort.linkIdentity(internalId, 'supabase', user.id);

    return { user };
  }

  async isAnonymous(): Promise<boolean> {
    const userId = await this.identityPort.getMyInternalId();
    if (!userId) return false;
    const profile = await this.identityPort.getProfile(userId);
    return profile?.is_anonymous ?? false;
  }

  /**
   * Sovereign Sign-Out Flow
   */
  async signOut() {
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
    await this.authPort.signOut();
  }

  async setSession(access_token: string, refresh_token: string) {
    return this.authPort.setSession(access_token, refresh_token);
  }

  async deleteAccount() {
    await this.authPort.executeRpc('delete_user_account');
    await this.signOut();
  }
}
