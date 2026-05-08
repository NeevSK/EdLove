import { AuthManager } from './AuthManager';

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
      // Use standard URL parsing (robust against complex formats)
      // Note: React Native provides this via react-native-url-polyfill
      const parsedUrl = new URL(url.replace('#', '?')); // Normalize hash-based OAuth redirects
      const params = Object.fromEntries(parsedUrl.searchParams.entries());

      // 1. Auth Callback Check
      if (url.includes('auth/callback') || params.access_token) {
        return this.handleAuthCallback(params);
      }

      // 2. Classroom Invite Check
      if (url.includes('invite/classroom/')) {
        const inviteCode = url.split('invite/classroom/')[1]?.split(/[?#]/)[0];
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

  private async handleAuthCallback(params: Record<string, string>): Promise<DeepLinkResult> {
    const access_token = params.access_token;
    const refresh_token = params.refresh_token;

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
    return [
      'gurudevi://',
      'https://platform.gurudevi.edlove.org',
      'http://localhost:4000',
    ];
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
        AdminAuthorityRepair: 'admin/authority',
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
