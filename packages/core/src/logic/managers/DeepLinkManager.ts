import { GURUDEVI_PLATFORM_URL } from '@repo/core/config/publicUrls';
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
        parsedUrl.pathname === '/auth/callback' ||
        params.access_token ||
        params.code
      ) {
        return this.handleAuthCallback(params);
      }

      // 2. Classroom Invite Check
      const inviteMatch = parsedUrl.pathname.match(/^\/(?:invite\/)?classroom\/([^/]+)$/);
      if (inviteMatch) {
        const inviteCode = inviteMatch[1];
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

    // Magic-link / PKCE code exchange — Supabase emails a `code` query param
    // that must be exchanged server-side for an access/refresh token pair.
    if (authCode) {
      try {
        await this.authManager.exchangeCodeForSession(authCode);
        return {
          type: DeepLinkType.AUTH_CALLBACK,
          params,
          isHandled: true,
        };
      } catch (error) {
        console.error('[DeepLinkManager] Magic-link code exchange failed:', error);
        return {
          type: DeepLinkType.AUTH_CALLBACK,
          params,
          isHandled: false,
          message: 'Failed to exchange magic-link code',
        };
      }
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
   * This centralizes the screen mapping in the core domain.
   */
  getNavigationConfig() {
    return {
      screens: {
        Welcome: '',
        Onboarding: 'onboarding',
        Auth: 'auth',
        AIAssistant: 'ai',
        QRHandler: 'qr',
        ThuthimalClaim: 'thuthimal',
        InvitationWelcome: 'invite',
        AdminDashboard: 'admin',
        AdminIncidentQueue: 'admin/incidents',
        AdminTenantDetail: 'admin/tenants',
        AdminPolicyRepair: 'admin/policy',
        AdminJobControl: 'admin/actions',
        AdminAuditLog: 'admin/audit',
        AdminReleaseControl: 'admin/release',
        Main: {
          path: 'app',
          screens: {
            Self: 'self',
            Profile: 'profile',
            Classroom: 'classroom',
            Community: 'community',
            Library: 'library',
            NotificationsPanel: 'notifications',
            SettingsPanel: 'settings',
          },
        },
        PublicForm: 'f/:slug',
      },
    };
  }
}
