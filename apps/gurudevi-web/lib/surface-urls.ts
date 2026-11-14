/**
 * Surface URLs Engine for Gurudevi Web
 *
 * Dynamically resolves cross-surface links across:
 * - Public Marketing: gurudevi.app (or localhost:3000 / public.localhost:3000)
 * - Sanctuary: sanctuary.gurudevi.app (or sanctuary.localhost:3000)
 * - Explore: explore.gurudevi.app (or explore.localhost:3000)
 *
 * In local preview (RFC 6761 *.localhost), links stay entirely within the local
 * development server preserving the active port, eliminating inadvertent
 * redirects to production hosted surfaces.
 */

import {
  EXPLORE_GURUDEVI_HOST,
  isLocalPreviewHost,
  PUBLIC_GURUDEVI_HOST,
  SANCTUARY_GURUDEVI_HOST,
} from './host-routing';
import { EDLOVE_URL } from '@repo/core/site';


/**
 * Standard security attributes for external hyperlinks to prevent
 * reverse tabnabbing and referrer information leakage.
 */
export const EXTERNAL_LINK_PROPS = {
  target: '_blank',
  rel: 'noopener noreferrer',
} as const;

/**
 * Validates and normalizes external URLs, guaranteeing HTTPS or explicit fallback.
 */
export function normalizeExternalUrl(url: string, fallback = EDLOVE_URL): string {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return parsed.toString();
    }
    return fallback;
  } catch {
    return fallback;
  }
}

export type GurudeviSurface = 'public' | 'sanctuary' | 'explore';

export interface ResolveSurfaceUrlOptions {
  /** Explicit host override (useful in SSR via request headers) */
  host?: string | null;
  /** Explicit port override */
  port?: string | number | null;
  /** Explicit protocol override (e.g. 'http:' vs 'https:') */
  protocol?: string | null;
}

/**
 * Resolves a full, surface-aware URL for cross-subdomain transitions.
 */
export function resolveSurfaceUrl(
  surface: GurudeviSurface,
  pathname = '/',
  options?: ResolveSurfaceUrlOptions,
): string {
  const cleanPath = pathname.startsWith('/') ? pathname : `/${pathname}`;

  // 1. Determine active host context
  let activeHost: string | null = options?.host ?? null;
  let activeProtocol: string | null = options?.protocol ?? null;
  let activePort: string | null = options?.port ? String(options.port) : null;

  if (activeHost && !activePort) {
    const portMatch = activeHost.match(/:(\d+)$/);
    if (portMatch?.[1]) {
      activePort = portMatch[1];
    }
  }

  if (typeof window !== 'undefined') {
    if (!activeHost) activeHost = window.location.host;
    if (!activeProtocol) activeProtocol = window.location.protocol;
    if (!activePort && window.location.port) activePort = window.location.port;
  }

  // 2. Check if running in local preview mode
  const isLocal = activeHost
    ? isLocalPreviewHost(activeHost)
    : process.env.NODE_ENV === 'development';

  if (isLocal) {
    const proto = activeProtocol ? activeProtocol.replace(/:$/, '') : 'http';

    // Extract port from activeHost if not explicitly provided
    if (!activePort && activeHost) {
      const portMatch = activeHost.match(/:(\d+)$/);
      if (portMatch?.[1]) {
        activePort = portMatch[1];
      }
    }
    const portSuffix = activePort
      ? `:${activePort}`
      : typeof window === 'undefined'
        ? ':3000'
        : '';

    switch (surface) {
      case 'public':
        return `${proto}://localhost${portSuffix}${cleanPath}`;
      case 'sanctuary':
        return `${proto}://sanctuary.localhost${portSuffix}${cleanPath}`;
      case 'explore':
        return `${proto}://explore.localhost${portSuffix}${cleanPath}`;
    }
  }

  // 3. Production hosted endpoints
  switch (surface) {
    case 'public':
      return `https://${PUBLIC_GURUDEVI_HOST}${cleanPath}`;
    case 'sanctuary':
      return `https://${SANCTUARY_GURUDEVI_HOST}${cleanPath}`;
    case 'explore':
      return `https://${EXPLORE_GURUDEVI_HOST}${cleanPath}`;
  }
}
