import { GURUDEVI_PLATFORM_URL } from '@repo/core/config/publicUrls';
import { DeepLinkStateGuard } from '@repo/core/logic/auth/deepLinkStateGuard';
import type { AuthManager } from '@repo/core/logic/managers/AuthManager';
import { Duration, Effect, Schedule } from 'effect';

/**
 * DeepLinkType
 * Represents the semantic categories of links the platform understands
 */
export enum DeepLinkType {
  AUTH_CALLBACK = 'AUTH_CALLBACK',
  CLASSROOM_INVITE = 'CLASSROOM_INVITE',
  SHARED_CONTENT = 'SHARED_CONTENT',
  UNKNOWN = 'UNKNOWN',
}

/**
 * IDeepLinkResult
 * The interpreted outcome of a deep link
 */
export interface DeepLinkResult {
  type: DeepLinkType;
  params: Record<string, string>;
  isHandled: boolean;
  message?: string;
}

/**
 * DeepLinkManager
 * Sovereign manager for interpreting and orchestrating responses to deep links
 * across all app shells (Mobile, Web).
 */
export class DeepLinkManager {
  constructor(private authManager: AuthManager) {}

  /**
   * handleURL
   * The primary entry point for deep links. It parses the URL,
   * performs side effects (like setting sessions), and returns the intent.
   */
  async handleURL(url: string): Promise<DeepLinkResult> {
    try {
      // Note: React Native provides URL via react-native-url-polyfill.
      const parsedUrl = new URL(url);
      const params = {
        ...Object.fromEntries(parsedUrl.searchParams.entries()),
        ...Object.fromEntries(new URLSearchParams(parsedUrl.hash.slice(1)).entries()),
      };

      // 1. Auth Callback Check
      if (
        (parsedUrl.hostname === 'auth' && parsedUrl.pathname === '/callback') ||
        parsedUrl.pathname === '/auth/callback'
      ) {
        return this.handleAuthCallback(params);
      }

      // 2. Classroom Invite Check
      const inviteMatch = parsedUrl.pathname.match(/^\/(?:invite\/)?classroom\/([^/]+)$/);
      if (inviteMatch) {
        const encodedInviteCode = inviteMatch[1];
        const inviteCode = encodedInviteCode ? decodeURIComponent(encodedInviteCode) : undefined;
        return {
          type: DeepLinkType.CLASSROOM_INVITE,
          params: inviteCode ? { inviteCode, ...params } : params,
          isHandled: false, // Shell needs to navigate
        };
      }

      return {
        type: DeepLinkType.UNKNOWN,
        params,
        isHandled: false,
      };
    } catch (error) {
      console.error('[DeepLinkManager] Error parsing URL:', error);
      return {
        type: DeepLinkType.UNKNOWN,
        params: {},
        isHandled: false,
        message: 'Malformed URL',
      };
    }
  }

  private async handleAuthCallback(params: Record<string, string>): Promise<DeepLinkResult> {
    const access_token = params.access_token;
    const refresh_token = params.refresh_token;
    const authCode = params.code;

    const state = params.state;
    if (state && !DeepLinkStateGuard.verifyAndConsumeState(state)) {
      console.warn(
        '[DeepLinkManager] Rejected auth callback with invalid/replayed state parameter',
      );
      return {
        type: DeepLinkType.AUTH_CALLBACK,
        params,
        isHandled: false,
        message: 'Invalid or replayed state parameter (CSRF detected)',
      };
    }

    if (access_token && refresh_token) {
      try {
        await this.authManager.setSession(access_token, refresh_token);
        return {
          type: DeepLinkType.AUTH_CALLBACK,
          params,
          isHandled: true,
        };
      } catch (error) {
        console.error('[DeepLinkManager] Auth session set failed:', error);
        return {
          type: DeepLinkType.AUTH_CALLBACK,
          params,
          isHandled: false,
          message: 'Failed to establish session',
        };
      }
    }

    // Magic-link / PKCE code exchange with Effect-TS resilient exponential backoff retry
    if (authCode) {
      const retrySchedule = Schedule.exponential(Duration.millis(50)).pipe(
        Schedule.intersect(Schedule.recurs(2)),
      );

      const exchangeEffect = Effect.tryPromise({
        try: () => this.authManager.exchangeCodeForSession(authCode),
        catch: (cause) => cause,
      }).pipe(
        Effect.retry(retrySchedule),
        Effect.map(() => ({
          type: DeepLinkType.AUTH_CALLBACK,
          params,
          isHandled: true,
        })),
        Effect.catchAll((error) => {
          console.error('[DeepLinkManager] Magic-link code exchange failed after retries:', error);
          return Effect.succeed({
            type: DeepLinkType.AUTH_CALLBACK,
            params,
            isHandled: false,
            message: 'Failed to exchange magic-link code',
          });
        }),
      );

      return Effect.runPromise(exchangeEffect);
    }

    return {
      type: DeepLinkType.AUTH_CALLBACK,
      params,
      isHandled: false,
      message: 'Missing tokens',
    };
  }

  /**
   * Returns the deep link prefixes for the platform.
   */
  getPrefixes() {
    const localUrl =
      (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_LOCAL_WEB_URL) ||
      'http://localhost:4000';
    return ['gurudevi://', GURUDEVI_PLATFORM_URL, localUrl];
  }

  /**
   * Returns the React Navigation linking configuration.
   * Centralizes the screen mapping across mobile and web shells.
   */
  getNavigationConfig() {
    return {
      screens: {
        Welcome: '',
        Onboarding: 'onboarding',
        Auth: 'auth',
        Self: 'self',
        Profile: 'profile',
        Classroom: 'workspace',
        Workspace: 'workspace',
        Community: 'community',
        Library: 'library',
        NotificationsPanel: 'notifications',
        SettingsPanel: 'settings',
        QRHandler: 'qr',
        ThuthimalClaim: 'thuthimal-claim',
        AIAssistant: 'a-i-assistant',
        InvitationWelcome: 'invite',
        PublicForm: 'f/:slug',
      },
    };
  }
}
