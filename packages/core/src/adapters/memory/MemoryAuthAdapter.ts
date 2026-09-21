import type {
  AccountDeletionRequest,
  AccountLifecycleStatus,
  AuthChangeEvent,
  AuthMfaFactor,
  AuthSession,
  AuthSubscription,
  AuthUser,
  IAuthPort,
} from '@repo/core/logic/ports/auth.port';

export class MemoryAuthAdapter implements IAuthPort {
  private currentSession: AuthSession | null = null;
  private currentUser: AuthUser | null = null;
  private listeners: Set<(event: AuthChangeEvent, session: AuthSession | null) => void> = new Set();
  private mfaFactors: AuthMfaFactor[] = [];
  private rpcHandlers: Map<string, (params?: Record<string, any>) => Promise<any> | any> = new Map();

  constructor(initialSession?: AuthSession | null) {
    if (initialSession) {
      this.currentSession = initialSession;
      this.currentUser = initialSession.user;
    }
  }

  registerRpcHandler(name: string, handler: (params?: Record<string, any>) => Promise<any> | any) {
    this.rpcHandlers.set(name, handler);
  }

  onAuthStateChange(
    callback: (event: AuthChangeEvent, session: AuthSession | null) => void | Promise<void>,
  ): { data: { subscription: AuthSubscription } } {
    const wrapped = (event: AuthChangeEvent, session: AuthSession | null) => {
      void callback(event, session);
    };
    this.listeners.add(wrapped);
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            this.listeners.delete(wrapped);
          },
        },
      },
    };
  }

  private notify(event: AuthChangeEvent, session: AuthSession | null) {
    for (const listener of this.listeners) {
      try {
        listener(event, session);
      } catch (err) {
        console.error('[MemoryAuthAdapter] Listener error:', err);
      }
    }
  }

  async getSession(): Promise<AuthSession | null> {
    return this.currentSession;
  }

  async getUser(): Promise<AuthUser | null> {
    return this.currentUser;
  }

  async signInWithPassword(
    email: string,
    _password?: string,
  ): Promise<{ user: AuthUser | null; session: AuthSession | null }> {
    const user: AuthUser = {
      id: `user-${Date.now()}`,
      email,
      user_metadata: {},
      is_anonymous: false,
    };
    const session: AuthSession = {
      access_token: `mock-token-${Date.now()}`,
      refresh_token: `mock-refresh-${Date.now()}`,
      user,
    };
    this.currentSession = session;
    this.currentUser = user;
    this.notify('SIGNED_IN', session);
    return { user, session };
  }

  async signInWithOAuth(params?: { redirectTo?: string }): Promise<{ url: string | null }> {
    return { url: params?.redirectTo ?? null };
  }

  async linkOAuthIdentity(params?: { redirectTo?: string }): Promise<{ url: string | null }> {
    return { url: params?.redirectTo ?? null };
  }

  async signInWithGoogleIdToken(params: {
    idToken: string;
    accessToken?: string | null;
  }): Promise<{ user: AuthUser | null; session: AuthSession | null }> {
    const user: AuthUser = {
      id: `google-user-${params.idToken.slice(0, 8)}`,
      email: 'user@gmail.com',
      user_metadata: { full_name: 'Google User' },
      is_anonymous: false,
    };
    const session: AuthSession = {
      access_token: `mock-google-token-${Date.now()}`,
      refresh_token: `mock-google-refresh-${Date.now()}`,
      user,
    };
    this.currentSession = session;
    this.currentUser = user;
    this.notify('SIGNED_IN', session);
    return { user, session };
  }

  async linkGoogleIdentity(params: {
    idToken: string;
    accessToken?: string | null;
  }): Promise<{ user: AuthUser | null; session: AuthSession | null }> {
    if (!this.currentUser) {
      throw new Error('No user to link Google identity to');
    }
    this.currentUser.user_metadata = {
      ...this.currentUser.user_metadata,
      google_linked: true,
      google_token: params.idToken,
    };
    return { user: this.currentUser, session: this.currentSession };
  }

  async signInWithMagicLink(email: string): Promise<{ user: AuthUser | null; session: AuthSession | null }> {
    return { user: null, session: null };
  }

  async exchangeCodeForSession(code: string): Promise<{ user: AuthUser | null; session: AuthSession | null }> {
    const user: AuthUser = {
      id: `magic-user-${code}`,
      email: 'magic@example.com',
      is_anonymous: false,
    };
    const session: AuthSession = {
      access_token: `mock-magic-token-${Date.now()}`,
      refresh_token: `mock-magic-refresh-${Date.now()}`,
      user,
    };
    this.currentSession = session;
    this.currentUser = user;
    this.notify('SIGNED_IN', session);
    return { user, session };
  }

  async signInWithPasskey(params?: { redirectTo?: string }): Promise<{ url: string | null }> {
    return { url: params?.redirectTo ?? null };
  }

  async registerPasskey(params?: { redirectTo?: string }): Promise<{ url: string | null }> {
    return { url: params?.redirectTo ?? null };
  }

  async listMfaFactors(): Promise<{ all: AuthMfaFactor[]; verified: AuthMfaFactor[] }> {
    return {
      all: this.mfaFactors,
      verified: this.mfaFactors.filter((f) => f.status === 'verified'),
    };
  }

  async enrollTotp(params?: { friendlyName?: string }): Promise<{
    factorId: string;
    qrCode?: string | null;
    secret?: string | null;
    uri?: string | null;
  }> {
    const factorId = `totp-${Date.now()}`;
    const factor: AuthMfaFactor = {
      id: factorId,
      friendly_name: params?.friendlyName,
      factor_type: 'totp',
      status: 'unverified',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.mfaFactors.push(factor);
    const mockTotpToken = `totp_mock_${Date.now()}`;
    return {
      factorId,
      qrCode: 'data:image/png;base64,mock',
      secret: mockTotpToken,
      uri: `otpauth://totp/mock?secret=${mockTotpToken}`,
    };
  }

  async challengeTotp(factorId: string): Promise<{ challengeId: string }> {
    return { challengeId: `challenge-${factorId}-${Date.now()}` };
  }

  async verifyTotp(params: {
    factorId: string;
    challengeId: string;
    code: string;
  }): Promise<{ user: AuthUser | null; session: AuthSession | null }> {
    const factor = this.mfaFactors.find((f) => f.id === params.factorId);
    if (factor) {
      factor.status = 'verified';
    }
    return { user: this.currentUser, session: this.currentSession };
  }

  async challengeAndVerifyTotp(params: {
    factorId: string;
    code: string;
  }): Promise<{ user: AuthUser | null; session: AuthSession | null }> {
    return this.verifyTotp({ factorId: params.factorId, challengeId: 'direct', code: params.code });
  }

  async setSession(
    access_token: string,
    refresh_token: string,
  ): Promise<{ user: AuthUser | null; session: AuthSession | null }> {
    const user: AuthUser = this.currentUser || {
      id: `restored-user-${Date.now()}`,
      is_anonymous: false,
    };
    const session: AuthSession = {
      access_token,
      refresh_token,
      user,
    };
    this.currentSession = session;
    this.currentUser = user;
    this.notify('TOKEN_REFRESHED', session);
    return { user, session };
  }

  async signUp(params: {
    email: string;
    password: string;
    options?: { data?: Record<string, any>; emailRedirectTo?: string };
  }): Promise<{ user: AuthUser | null; session: AuthSession | null }> {
    const user: AuthUser = {
      id: `new-user-${Date.now()}`,
      email: params.email,
      user_metadata: params.options?.data || {},
      is_anonymous: false,
    };
    const session: AuthSession = {
      access_token: `mock-signup-token-${Date.now()}`,
      refresh_token: `mock-signup-refresh-${Date.now()}`,
      user,
    };
    this.currentSession = session;
    this.currentUser = user;
    this.notify('SIGNED_IN', session);
    return { user, session };
  }

  async signInAnonymously(options?: {
    data?: Record<string, any>;
  }): Promise<{ user: AuthUser | null; session: AuthSession | null }> {
    const user: AuthUser = {
      id: `anon-${Date.now()}`,
      is_anonymous: true,
      user_metadata: options?.data || {},
    };
    const session: AuthSession = {
      access_token: `mock-anon-token-${Date.now()}`,
      refresh_token: `mock-anon-refresh-${Date.now()}`,
      user,
    };
    this.currentSession = session;
    this.currentUser = user;
    this.notify('SIGNED_IN', session);
    return { user, session };
  }

  async updateUser(params: {
    email?: string;
    password?: string;
    data?: Record<string, any>;
  }): Promise<{ user: AuthUser | null }> {
    if (this.currentUser) {
      if (params.email) this.currentUser.email = params.email;
      if (params.data) {
        this.currentUser.user_metadata = {
          ...this.currentUser.user_metadata,
          ...params.data,
        };
      }
    }
    return { user: this.currentUser };
  }

  async signOut(options?: { scope?: 'global' | 'local' | 'others' }): Promise<void> {
    this.currentSession = null;
    this.currentUser = null;
    this.notify('SIGNED_OUT', null);
  }

  async executeRpc(fn: string, params?: Record<string, any>): Promise<any> {
    if (this.rpcHandlers.has(fn)) {
      const handler = this.rpcHandlers.get(fn)!;
      return handler(params);
    }
    if (fn === 'get_account_lifecycle_status') {
      return {
        status: 'active',
        deactivated_at: null,
        request_id: null,
        scheduled_for: null,
        reason: 'ok',
      };
    }
    return { ok: true, fn, params };
  }
}
