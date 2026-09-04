export interface AuthSession {
  access_token: string;
  refresh_token: string;
  user: any;
}

export interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: Record<string, any>;
}

export interface AuthMfaFactor {
  id: string;
  friendly_name?: string;
  factor_type: 'totp' | 'phone' | 'webauthn';
  status: 'verified' | 'unverified';
  created_at: string;
  updated_at: string;
  last_challenged_at?: string;
}

export interface AccountDeletionRequest {
  status: 'pending_verification' | 'scheduled' | 'cancelled' | 'completed' | 'blocked';
  request_id: string | null;
  requested_at: string | null;
  scheduled_for?: string | null;
  reason: string;
}

export interface AccountLifecycleStatus {
  status:
    | 'active'
    | 'pending_verification'
    | 'scheduled'
    | 'deactivated'
    | 'cancelled'
    | 'completed'
    | 'blocked';
  deactivated_at: string | null;
  request_id: string | null;
  scheduled_for: string | null;
  reason: string;
}

export interface IAuthPort {
  getSession(): Promise<AuthSession | null>;
  getUser(): Promise<AuthUser | null>;

  signInWithPassword(
    email: string,
    password: string,
  ): Promise<{ user: AuthUser | null; session: AuthSession | null }>;

  signInWithOAuth(params: {
    provider: 'google';
    redirectTo?: string;
    skipBrowserRedirect?: boolean;
  }): Promise<{ url: string | null }>;

  linkOAuthIdentity(params: {
    provider: 'google';
    redirectTo?: string;
    skipBrowserRedirect?: boolean;
  }): Promise<{ url: string | null }>;

  /**
   * Native Google Sign-In (One Tap / Credential Manager / iOS Google SDK).
   * Exchanges an idToken (minted by the native Google SDK) for a Supabase session.
   * Used when there is no existing session to link against.
   */
  signInWithGoogleIdToken(params: {
    idToken: string;
    accessToken?: string | null;
  }): Promise<{ user: AuthUser | null; session: AuthSession | null }>;

  /**
   * Native Google Sign-In (One Tap / Credential Manager / iOS Google SDK).
   * Links the Google identity to the *current* session (used to preserve an
   * anonymous guest identity when a guest signs in with Google).
   */
  linkGoogleIdentity(params: {
    idToken: string;
    accessToken?: string | null;
  }): Promise<{ user: AuthUser | null; session: AuthSession | null }>;

  /**
   * Sends a Supabase magic-link email. The link deep-redirects back into the app
   * where the returned `code` is exchanged via `exchangeCodeForSession`.
   */
  signInWithMagicLink(
    email: string,
  ): Promise<{ user: AuthUser | null; session: AuthSession | null }>;

  /**
   * Exchanges a PKCE `code` (from a magic-link deep link) for a session.
   */
  exchangeCodeForSession(
    code: string,
  ): Promise<{ user: AuthUser | null; session: AuthSession | null }>;

  signInWithPasskey(params?: {
    redirectTo?: string;
    skipBrowserRedirect?: boolean;
  }): Promise<{ url: string | null }>;

  registerPasskey(params?: {
    redirectTo?: string;
    skipBrowserRedirect?: boolean;
  }): Promise<{ url: string | null }>;

  listMfaFactors(): Promise<{ all: AuthMfaFactor[]; verified: AuthMfaFactor[] }>;

  enrollTotp(params?: { friendlyName?: string }): Promise<{
    factorId: string;
    qrCode?: string | null;
    secret?: string | null;
    uri?: string | null;
  }>;

  challengeTotp(factorId: string): Promise<{ challengeId: string }>;

  verifyTotp(params: {
    factorId: string;
    challengeId: string;
    code: string;
  }): Promise<{ user: AuthUser | null; session: AuthSession | null }>;

  challengeAndVerifyTotp(params: {
    factorId: string;
    code: string;
  }): Promise<{ user: AuthUser | null; session: AuthSession | null }>;

  setSession(
    access_token: string,
    refresh_token: string,
  ): Promise<{ user: AuthUser | null; session: AuthSession | null }>;

  signUp(params: {
    email: string;
    password: string;
    options?: { data?: Record<string, any> };
  }): Promise<{ user: AuthUser | null; session: AuthSession | null }>;

  signInAnonymously(options?: {
    data?: Record<string, any>;
  }): Promise<{ user: AuthUser | null; session: AuthSession | null }>;

  updateUser(params: {
    email?: string;
    password?: string;
    data?: Record<string, any>;
  }): Promise<{ user: AuthUser | null }>;

  signOut(): Promise<void>;

  executeRpc(fn: string, params?: Record<string, any>): Promise<any>;
}
