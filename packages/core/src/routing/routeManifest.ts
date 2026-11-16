/**
 * RouteManifest
 * Single source of truth for all public, explorer, and protected app surfaces
 * across mobile, web, deep links, and discovery metadata.
 */

import generatedRouteMetabolic from './routeMetabolic.generated.json';

export type RouteAccessTier = 'public' | 'explorer' | 'authenticated';

export type MetabolicIntensity = 'nominal' | 'heavy' | 'intensive';

export interface RouteMetabolicProfile {
  readonly intensity: MetabolicIntensity;
  readonly intent?: 'heavy-navigation' | 'burst-sync' | 'canvas-mount';
  readonly transitionDwellMs?: number;
}

export interface RouteDefinition {
  readonly path: string;
  readonly label: string;
  readonly access: RouteAccessTier;
  readonly description?: string;
  readonly metabolic?: RouteMetabolicProfile;
}

export const APP_ROUTES = {
  // Public marketing & info
  WELCOME: {
    path: '/welcome',
    label: 'Welcome',
    access: 'public',
    metabolic: { intensity: 'heavy', intent: 'canvas-mount', transitionDwellMs: 500 },
  },
  AUTH: {
    path: '/auth',
    label: 'Authentication',
    access: 'public',
    metabolic: { intensity: 'heavy', intent: 'heavy-navigation', transitionDwellMs: 400 },
  },
  AUTH_CALLBACK: {
    path: '/auth/callback',
    label: 'Auth Callback',
    access: 'public',
    metabolic: { intensity: 'nominal', transitionDwellMs: 200 },
  },
  SIGN_IN: {
    path: '/sign-in',
    label: 'Sign In',
    access: 'public',
    metabolic: { intensity: 'nominal', transitionDwellMs: 200 },
  },
  SIGN_UP: {
    path: '/sign-up',
    label: 'Sign Up',
    access: 'public',
    metabolic: { intensity: 'nominal', transitionDwellMs: 200 },
  },
  RECOVERY: {
    path: '/recovery',
    label: 'Account Recovery',
    access: 'public',
    metabolic: { intensity: 'nominal', transitionDwellMs: 200 },
  },
  RESET_PASSWORD: {
    path: '/reset-password',
    label: 'Reset Password',
    access: 'public',
    metabolic: { intensity: 'nominal', transitionDwellMs: 200 },
  },
  ONBOARDING: {
    path: '/onboarding',
    label: 'Onboarding',
    access: 'public',
    metabolic: { intensity: 'heavy', intent: 'heavy-navigation', transitionDwellMs: 400 },
  },
  QR: {
    path: '/qr',
    label: 'QR Scanner',
    access: 'public',
    metabolic: { intensity: 'nominal', transitionDwellMs: 200 },
  },
  PULSE: {
    path: '/pulse',
    label: 'Sanctuary Pulse',
    access: 'public',
    metabolic: { intensity: 'heavy', intent: 'canvas-mount', transitionDwellMs: 500 },
  },
  INTRO: {
    path: '/intro',
    label: 'Walkthrough Tour',
    access: 'public',
    metabolic: { intensity: 'heavy', intent: 'canvas-mount', transitionDwellMs: 500 },
  },
  ATLAS: {
    path: '/atlas',
    label: 'Research Atlas',
    access: 'public',
    metabolic: { intensity: 'heavy', intent: 'canvas-mount', transitionDwellMs: 500 },
  },
  ACCOUNT_RECOVERY: {
    path: '/account-recovery',
    label: 'Account Recovery',
    access: 'public',
    metabolic: { intensity: 'nominal', transitionDwellMs: 200 },
  },

  // Core Sanctuary destinations (Protected)
  SELF: {
    path: '/self',
    label: 'Self Sanctuary',
    access: 'authenticated',
    metabolic: { intensity: 'heavy', intent: 'canvas-mount', transitionDwellMs: 500 },
  },
  PROFILE: {
    path: '/profile',
    label: 'User Profile',
    access: 'authenticated',
    metabolic: { intensity: 'nominal', transitionDwellMs: 200 },
  },
  WORKSPACE: {
    path: '/workspace',
    label: 'Classroom Workspace',
    access: 'authenticated',
    metabolic: { intensity: 'heavy', intent: 'heavy-navigation', transitionDwellMs: 400 },
  },
  COMMUNITY: {
    path: '/community',
    label: 'Community Resonance',
    access: 'authenticated',
    metabolic: { intensity: 'heavy', intent: 'heavy-navigation', transitionDwellMs: 400 },
  },
  LIBRARY: {
    path: '/library',
    label: 'Knowledge Sanctuary',
    access: 'authenticated',
    metabolic: { intensity: 'heavy', intent: 'heavy-navigation', transitionDwellMs: 400 },
  },
  NOTIFICATIONS: {
    path: '/notifications',
    label: 'Notifications',
    access: 'authenticated',
    metabolic: { intensity: 'nominal', transitionDwellMs: 200 },
  },
  SETTINGS: {
    path: '/settings',
    label: 'Settings',
    access: 'authenticated',
    metabolic: { intensity: 'nominal', transitionDwellMs: 200 },
  },
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

const DEFAULT_NOMINAL_METABOLIC_PROFILE: RouteMetabolicProfile = {
  intensity: 'nominal',
  transitionDwellMs: 200,
};

function normalizePathname(pathname: string): string {
  const clean = (pathname.split(/[?#]/)[0] ?? '').trim();
  if (!clean || clean === '/') return '/';
  return clean.endsWith('/') ? clean.slice(0, -1) : clean;
}

function matchRouteSegmentPattern(pattern: string, path: string): boolean {
  if (pattern === path) return true;
  const pSegments = pattern.split('/').filter(Boolean);
  const aSegments = path.split('/').filter(Boolean);
  if (pSegments.length !== aSegments.length) return false;
  for (let i = 0; i < pSegments.length; i++) {
    const p = pSegments[i];
    const a = aSegments[i];
    if (p && p.startsWith('[') && p.endsWith(']')) continue;
    if (p !== a) return false;
  }
  return true;
}

interface GeneratedLedgerStructure {
  routes?: Record<
    string,
    {
      intensity: MetabolicIntensity;
      intent?: 'heavy-navigation' | 'burst-sync' | 'canvas-mount';
      transitionDwellMs?: number;
    }
  >;
}

/**
 * Dynamically resolves the metabolic profile for any given route pathname
 * across mobile and web. Consults the statically generated ledger first,
 * falling back to declared profiles in APP_ROUTES or nominal default.
 */
export function resolveRouteMetabolicProfile(pathname: string): RouteMetabolicProfile {
  const normalized = normalizePathname(pathname);

  // 1. Check generated route metabolic ledger
  const ledger = generatedRouteMetabolic as unknown as GeneratedLedgerStructure;
  const routes = ledger.routes ?? {};

  // Exact match in generated ledger
  const exact = routes[normalized];
  if (exact) {
    return {
      intensity: exact.intensity,
      intent: exact.intent,
      transitionDwellMs: exact.transitionDwellMs,
    };
  }

  // Parameterized match in generated ledger (e.g., /workspace/commercial/[batchId])
  for (const [pattern, entry] of Object.entries(routes)) {
    if (matchRouteSegmentPattern(pattern, normalized) && entry) {
      return {
        intensity: entry.intensity,
        intent: entry.intent,
        transitionDwellMs: entry.transitionDwellMs,
      };
    }
  }

  // 2. Fallback to declared metabolic profile in APP_ROUTES
  for (const route of Object.values(APP_ROUTES)) {
    if (route.metabolic) {
      if (route.path === normalized || normalized.startsWith(`${route.path}/`)) {
        return route.metabolic;
      }
    }
  }

  // 3. Fallback to nominal default
  return DEFAULT_NOMINAL_METABOLIC_PROFILE;
}
