import { auth } from '@repo/core/logic/managers/factory';
import type { PasswordChangeConfirmation } from '@repo/core/logic/ports/auth.port';
import type { Capacity } from '@repo/core/logic/schemas/capacity.schema';

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

  async signInWithGoogleIdToken(idToken: string, accessToken?: string | null) {
    return auth.signInWithGoogleIdToken(idToken, accessToken);
  },

  async linkGoogleIdentity(idToken: string, accessToken?: string | null) {
    return auth.linkGoogleIdentity(idToken, accessToken);
  },

  async signInWithMagicLink(email: string) {
    return auth.signInWithMagicLink(email);
  },

  async requestPasswordRecovery(email: string, redirectTo?: string) {
    return auth.requestPasswordRecovery(email, redirectTo);
  },

  async updatePassword(password: string, confirmation?: PasswordChangeConfirmation) {
    return auth.updatePassword(password, confirmation);
  },

  async requestPasswordReauthentication() {
    return auth.requestPasswordReauthentication();
  },

  async unlinkIdentity(identityId: string, expectedSubject?: string) {
    return auth.unlinkIdentity(identityId, expectedSubject);
  },

  async linkAnonymousEmail(email: string, emailRedirectTo?: string) {
    return auth.linkAnonymousEmail(email, emailRedirectTo);
  },

  async signInWithPhoneOtp(params: import('@repo/core/logic/ports/auth.port').PhoneOtpRequest) {
    return auth.signInWithPhoneOtp(params);
  },

  async verifyPhoneOtp(params: import('@repo/core/logic/ports/auth.port').PhoneOtpVerification) {
    return auth.verifyPhoneOtp(params);
  },

  async exchangeCodeForSession(code: string) {
    return auth.exchangeCodeForSession(code);
  },

  async linkOAuthIdentity(provider: 'google', redirectTo?: string, skipBrowserRedirect = false) {
    // Note: linkOAuthIdentity might need to be added to AuthManager if we want full delegation
    // For now delegating to auth manager if it had it, or using port.
    // I'll add it to AuthManager for consistency.
    return auth.linkOAuthIdentity(provider, redirectTo, skipBrowserRedirect);
  },

  async signInWithPasskey(redirectTo?: string, skipBrowserRedirect = false) {
    return auth.signInWithPasskey(redirectTo, skipBrowserRedirect);
  },

  async registerPasskey(redirectTo?: string, skipBrowserRedirect = false) {
    return auth.registerPasskey(redirectTo, skipBrowserRedirect);
  },

  async listMfaFactors() {
    return auth.listMfaFactors();
  },

  async enrollTotp(friendlyName?: string) {
    return auth.enrollTotp(friendlyName);
  },

  async challengeTotp(factorId: string) {
    return auth.challengeTotp(factorId);
  },

  async verifyTotp(factorId: string, challengeId: string, code: string) {
    return auth.verifyTotp({ factorId, challengeId, code });
  },

  async challengeAndVerifyTotp(factorId: string, code: string) {
    return auth.challengeAndVerifyTotp({ factorId, code });
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

  async linkAnonymousToEmail(
    email: string,
    password: string,
    fullName: string,
    capacity: Capacity,
  ) {
    return auth.linkAnonymousToEmail(email, password, fullName, capacity);
  },

  async isAnonymous() {
    return auth.isAnonymous();
  },

  onAuthStateChange(
    callback: (
      event: import('@repo/core/logic/ports/auth.port').AuthChangeEvent,
      session: import('@repo/core/logic/ports/auth.port').AuthSession | null,
    ) => void | Promise<void>,
  ) {
    return auth.onAuthStateChange(callback);
  },

  async signOut(options?: { scope?: 'global' | 'local' | 'others' }) {
    return auth.signOut(options);
  },

  async requestAccountDeletion() {
    return auth.requestAccountDeletion();
  },

  async cancelAccountDeletionRequest() {
    return auth.cancelAccountDeletionRequest();
  },

  async getAccountDeletionRequestStatus() {
    return auth.getAccountDeletionRequestStatus();
  },

  async getAccountLifecycleStatus() {
    return auth.getAccountLifecycleStatus();
  },
};

import { registerSandboxDomain } from '@repo/core/api/sandboxDataset';
import { MOCK_USER_PROFILES } from '@repo/core/api/mockData';

registerSandboxDomain({
  domain: 'user',
  ghostMethods: ['getProfile'],
  isEmpty: (_, d) => !d || !(d as any).id,
  getSamples: (_method, args) => {
    const role = (args?.[0] as string | undefined) ?? 'teacher';
    return MOCK_USER_PROFILES[role] ?? MOCK_USER_PROFILES.teacher;
  },
});
