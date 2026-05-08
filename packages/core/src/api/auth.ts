import { auth } from '../logic/managers/factory';

export const authAPI = {
  async getAuthSession() {
    return auth.getSession();
  },

  async getAuthUser() {
    return auth.getUser();
  },

  async signIn(email: string, password: string) {
    return auth.signIn(email, password);
  },

  async signInWithOAuth(provider: 'google', redirectTo?: string, skipBrowserRedirect = false) {
    return auth.signInWithOAuth(provider, redirectTo, skipBrowserRedirect);
  },

  async linkOAuthIdentity(provider: 'google', redirectTo?: string, skipBrowserRedirect = false) {
    // Note: linkOAuthIdentity might need to be added to AuthManager if we want full delegation
    // For now delegating to auth manager if it had it, or using port.
    // I'll add it to AuthManager for consistency.
    return auth.linkOAuthIdentity(provider, redirectTo, skipBrowserRedirect);
  },

  async setSession(access_token: string, refresh_token: string) {
    return auth.setSession(access_token, refresh_token);
  },

  async signUp(email: string, password: string, fullName?: string) {
    return auth.signUp(email, password, fullName);
  },

  async signInAnonymously() {
    return auth.signInAnonymously();
  },

  async linkAnonymousToEmail(email: string, password: string, fullName: string, capacity: any) {
    return auth.linkAnonymousToEmail(email, password, fullName, capacity);
  },

  async isAnonymous(): Promise<boolean> {
    return auth.isAnonymous();
  },

  async signOut() {
    return auth.signOut();
  },

  async deleteAccount() {
    return auth.deleteAccount();
  },
};
