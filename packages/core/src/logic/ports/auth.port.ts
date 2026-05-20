import type { Capacity } from '../../types';

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
