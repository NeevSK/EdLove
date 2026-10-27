/**
 * RouteManifest
 * Single source of truth for all public, explorer, and protected app surfaces
 * across mobile, web, deep links, and discovery metadata.
 */

export type RouteAccessTier = 'public' | 'explorer' | 'authenticated';

export interface RouteDefinition {
  readonly path: string;
  readonly label: string;
  readonly access: RouteAccessTier;
  readonly description?: string;
}

export const APP_ROUTES = {
  // Public marketing & info
  WELCOME: { path: '/welcome', label: 'Welcome', access: 'public' },
  AUTH: { path: '/auth', label: 'Authentication', access: 'public' },
  AUTH_CALLBACK: { path: '/auth/callback', label: 'Auth Callback', access: 'public' },
  SIGN_IN: { path: '/sign-in', label: 'Sign In', access: 'public' },
  SIGN_UP: { path: '/sign-up', label: 'Sign Up', access: 'public' },
  RECOVERY: { path: '/recovery', label: 'Account Recovery', access: 'public' },
  RESET_PASSWORD: { path: '/reset-password', label: 'Reset Password', access: 'public' },
  ONBOARDING: { path: '/onboarding', label: 'Onboarding', access: 'public' },
  QR: { path: '/qr', label: 'QR Scanner', access: 'public' },
  PULSE: { path: '/pulse', label: 'Sanctuary Pulse', access: 'public' },
  ACCOUNT_RECOVERY: { path: '/account-recovery', label: 'Account Recovery', access: 'public' },

  // Core Sanctuary destinations (Protected)
  SELF: { path: '/self', label: 'Self Sanctuary', access: 'authenticated' },
  WORKSPACE: { path: '/workspace', label: 'Classroom Workspace', access: 'authenticated' },
  COMMUNITY: { path: '/community', label: 'Community Resonance', access: 'authenticated' },
  LIBRARY: { path: '/library', label: 'Knowledge Sanctuary', access: 'authenticated' },
  PROFILE: { path: '/profile', label: 'Citizen Profile', access: 'authenticated' },
  NOTIFICATIONS: { path: '/notifications', label: 'Notifications', access: 'authenticated' },
  SETTINGS: { path: '/settings', label: 'Settings', access: 'authenticated' },
  THUTHIMAL_CLAIM: { path: '/thuthimal-claim', label: 'Thuthimal Claim', access: 'authenticated' },
  AI_ASSISTANT: { path: '/a-i-assistant', label: 'AI Assistant', access: 'authenticated' },
} as const satisfies Record<string, RouteDefinition>;

export type AppRouteKey = keyof typeof APP_ROUTES;
export type AppRoutePath = (typeof APP_ROUTES)[AppRouteKey]['path'];

export const ALLOWED_INTERNAL_ROUTE_PATHS = Object.values(APP_ROUTES).map((r) => r.path);

export function isValidAppRoutePath(path: string): path is AppRoutePath {
  const normalized = path.split(/[?#]/)[0] ?? '';
  return ALLOWED_INTERNAL_ROUTE_PATHS.some(
    (allowed) => normalized === allowed || normalized.startsWith(`${allowed}/`),
  );
}
