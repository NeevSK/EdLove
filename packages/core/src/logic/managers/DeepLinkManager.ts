import { GURUDEVI_PLATFORM_URL } from '@repo/core/config/publicUrls';
import { classifyAuthCallback } from '@repo/core/logic/auth/authCallbackPolicy';
import type { AuthManager } from '@repo/core/logic/managers/AuthManager';

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
        return this.handleAuthCallback(url, params);
      }

      // 2. Classroom Invite Check (standard /invite/classroom/:code or vanity /c/:code)
      let encodedInviteCode: string | undefined;
      if (parsedUrl.protocol === 'gurudevi:' && parsedUrl.hostname === 'c') {
        encodedInviteCode = parsedUrl.pathname.replace(/^\//, '');
      } else {
        const inviteMatch =
          parsedUrl.pathname.match(/^\/(?:invite\/)?classroom\/([^/]+)$/) ||
          parsedUrl.pathname.match(/^\/c\/([^/]+)$/);
        encodedInviteCode = inviteMatch?.[1];
      }

      if (encodedInviteCode) {
        const inviteCode = decodeURIComponent(encodedInviteCode);
        return {
          type: DeepLinkType.CLASSROOM_INVITE,
          params: { inviteCode, ...params },
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

  private async handleAuthCallback(
    url: string,
    params: Record<string, string>,
  ): Promise<DeepLinkResult> {
    const callback = classifyAuthCallback(url);
    if (callback.kind !== 'code') {
      return {
        type: DeepLinkType.AUTH_CALLBACK,
        params,
        isHandled: false,
        message:
          callback.kind === 'providerError'
            ? 'Sign-in was cancelled or denied'
            : 'This secure link cannot be used. Request a new link and try again.',
      };
    }

    try {
      await this.authManager.exchangeCodeForSession(callback.code);
      return { type: DeepLinkType.AUTH_CALLBACK, params, isHandled: true };
    } catch {
      return {
        type: DeepLinkType.AUTH_CALLBACK,
        params,
        isHandled: false,
        message:
          'This secure link has expired or was already used. Request a new link and try again.',
      };
    }
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
