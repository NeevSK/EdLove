import { APP_ROUTES, type AppRoutePath, isValidAppRoutePath } from './routeManifest';

/**
 * RFC 3986 Bidirectional Link Codec
 *
 * Implements strict, zero-guesswork normalization, compartmentalization,
 * and deterministic serialization for all deep links, universal links,
 * and first-party sovereign short links across Gurudevi.
 */

export const SOVEREIGN_HOST = 'gurudevi.app';
export const SANCTUARY_HOST = 'sanctuary.gurudevi.app';
export const EXPLORE_HOST = 'explore.gurudevi.app';
export const NATIVE_SCHEME = 'gurudevi';

export const ALLOWED_WEB_HOSTS = new Set([
  SOVEREIGN_HOST,
  SANCTUARY_HOST,
  EXPLORE_HOST,
  'localhost',
  '127.0.0.1',
]);

const ATTRIBUTION_KEYS = new Set([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'fbclid',
  'gclid',
  'dclid',
  'msclkid',
  'mc_eid',
  'openexternalbrowser',
]);

export interface LinkTelemetryEnvelope {
  readonly source?: string;
  readonly medium?: string;
  readonly campaign?: string;
  readonly term?: string;
  readonly content?: string;
  readonly clickId?: string;
  readonly rawAttribution: Record<string, string>;
}

export interface CanonicalLinkEnvelope {
  readonly path: AppRoutePath;
  readonly routeParams: Record<string, string>;
  readonly telemetry: LinkTelemetryEnvelope;
  readonly canonicalUrl: string;
  readonly originalUrl: string;
  readonly intentKind: 'route' | 'classroomInvite' | 'resource' | 'authCallback';
}

function containsPathTraversal(url: string): boolean {
  try {
    const rawPath = decodeURIComponent(url).split(/[?#]/, 1)[0] ?? '';
    return rawPath.split('/').some((seg) => seg === '.' || seg === '..');
  } catch {
    return true;
  }
}

/**
 * Resolves path dot segments according to RFC 3986 Section 5.2.4.
 * Fails closed (returns null) on path traversal attempts out of root.
 */
function removeDotSegments(path: string): string | null {
  const segments = path.split('/');
  const output: string[] = [];

  for (const segment of segments) {
    if (segment === '' || segment === '.') continue;
    if (segment === '..') {
      if (output.length === 0) return null; // Traversal beyond root
      output.pop();
    } else {
      output.push(segment);
    }
  }

  return `/${output.join('/')}`;
}

/**
 * Deserializes and normalizes an incoming deep link or universal link.
 * Extracts route parameters cleanly into isolated compartments.
 */
export function deserializeLink(rawUrl: string): CanonicalLinkEnvelope | null {
  if (!rawUrl || typeof rawUrl !== 'string' || rawUrl.length > 8192) {
    return null;
  }

  if (containsPathTraversal(rawUrl)) {
    return null;
  }

  try {
    const parsed = new URL(rawUrl);
    const protocol = parsed.protocol.toLowerCase();
    const isNativeScheme = protocol === `${NATIVE_SCHEME}:`;
    const isHttps = protocol === 'https:';
    const isHttp =
      protocol === 'http:' && (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1');

    if (!isNativeScheme && !isHttps && !isHttp) {
      return null;
    }

    const host = parsed.hostname.toLowerCase();
    if (!isNativeScheme && !ALLOWED_WEB_HOSTS.has(host)) {
      return null;
    }

    // Resolve dot-segments safely
    const cleanPath = removeDotSegments(parsed.pathname);
    if (!cleanPath) return null;

    // Compartmentalize query parameters
    const routeParams: Record<string, string> = {};
    const rawAttribution: Record<string, string> = {};

    parsed.searchParams.forEach((val, key) => {
      const lowerKey = key.toLowerCase();
      if (ATTRIBUTION_KEYS.has(lowerKey)) {
        rawAttribution[lowerKey] = val;
      } else {
        routeParams[key] = val;
      }
    });

    const telemetry: LinkTelemetryEnvelope = {
      source: rawAttribution.utm_source,
      medium: rawAttribution.utm_medium,
      campaign: rawAttribution.utm_campaign,
      term: rawAttribution.utm_term,
      content: rawAttribution.utm_content,
      clickId:
        rawAttribution.fbclid ??
        rawAttribution.gclid ??
        rawAttribution.dclid ??
        rawAttribution.msclkid,
      rawAttribution,
    };

    // 1. Sovereign Short Link Detection: Classroom Invite (/c/:code)
    let classroomCode: string | undefined;
    if (isNativeScheme && host === 'c') {
      classroomCode = cleanPath.replace(/^\//, '');
    } else if (cleanPath.startsWith('/c/')) {
      classroomCode = cleanPath.slice(3);
    }

    if (classroomCode) {
      const decodedCode = decodeURIComponent(classroomCode);
      if (/^[A-Za-z0-9_-]{3,64}$/.test(decodedCode)) {
        return {
          path: APP_ROUTES.WORKSPACE.path,
          routeParams: { ...routeParams, classroomCode: decodedCode },
          telemetry,
          canonicalUrl: `https://${SOVEREIGN_HOST}/c/${encodeURIComponent(decodedCode)}`,
          originalUrl: rawUrl,
          intentKind: 'classroomInvite',
        };
      }
      return null;
    }

    // 2. Sovereign Short Link Detection: Resource (/r/:id)
    let resourceId: string | undefined;
    if (isNativeScheme && host === 'r') {
      resourceId = cleanPath.replace(/^\//, '');
    } else if (cleanPath.startsWith('/r/')) {
      resourceId = cleanPath.slice(3);
    }

    if (resourceId) {
      const decodedId = decodeURIComponent(resourceId);
      if (/^[A-Za-z0-9_-]{3,64}$/.test(decodedId)) {
        return {
          path: APP_ROUTES.LIBRARY.path,
          routeParams: { ...routeParams, resourceId: decodedId },
          telemetry,
          canonicalUrl: `https://${SOVEREIGN_HOST}/r/${encodeURIComponent(decodedId)}`,
          originalUrl: rawUrl,
          intentKind: 'resource',
        };
      }
      return null;
    }

    // 3. Auth Callback Link
    if (
      (isNativeScheme && host === 'auth' && cleanPath === '/callback') ||
      cleanPath === '/auth/callback' ||
      cleanPath === '/auth/complete'
    ) {
      return {
        path: APP_ROUTES.AUTH_CALLBACK.path,
        routeParams,
        telemetry,
        canonicalUrl: `https://${SANCTUARY_HOST}/auth/callback`,
        originalUrl: rawUrl,
        intentKind: 'authCallback',
      };
    }

    // 4. Canonical Internal App Route
    const candidatePath = isNativeScheme ? (host === '' ? cleanPath : `/${host}${cleanPath === '/' ? '' : cleanPath}`) : cleanPath;

    if (isValidAppRoutePath(candidatePath)) {
      const normalizedPath = candidatePath.replace(/\/+$/, '') || '/';
      const searchString = Object.keys(routeParams).length > 0
        ? `?${new URLSearchParams(routeParams).toString()}`
        : '';

      return {
        path: normalizedPath as AppRoutePath,
        routeParams,
        telemetry,
        canonicalUrl: `https://${SANCTUARY_HOST}${normalizedPath}${searchString}`,
        originalUrl: rawUrl,
        intentKind: 'route',
      };
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Deterministically serializes a canonical route intent into an outbound URL.
 * Guarantees alphabetical query parameter sorting and standard encoding.
 */
export function serializeLink(
  intent: {
    path: AppRoutePath;
    routeParams?: Record<string, string>;
    telemetry?: Partial<LinkTelemetryEnvelope>;
  },
  target: 'universal' | 'native' = 'universal',
  channel: 'sanctuary' | 'explore' | 'public' = 'sanctuary',
): string {
  const host =
    channel === 'explore'
      ? EXPLORE_HOST
      : channel === 'public'
        ? SOVEREIGN_HOST
        : SANCTUARY_HOST;

  const base = target === 'native' ? `${NATIVE_SCHEME}://${intent.path.replace(/^\//, '')}` : `https://${host}${intent.path}`;

  const allParams = new URLSearchParams();

  // Route parameters sorted deterministically
  if (intent.routeParams) {
    const sortedKeys = Object.keys(intent.routeParams).sort();
    for (const key of sortedKeys) {
      const val = intent.routeParams[key];
      if (val !== undefined && val !== null) {
        allParams.set(key, val);
      }
    }
  }

  // Telemetry attribution parameters
  if (intent.telemetry?.source) allParams.set('utm_source', intent.telemetry.source);
  if (intent.telemetry?.medium) allParams.set('utm_medium', intent.telemetry.medium);
  if (intent.telemetry?.campaign) allParams.set('utm_campaign', intent.telemetry.campaign);

  const query = allParams.toString();
  return query ? `${base}?${query}` : base;
}

/**
 * Serializes a first-party sovereign short link.
 */
export function serializeShortLink(
  kind: 'classroom' | 'resource',
  identifier: string,
  target: 'universal' | 'native' = 'universal',
): string {
  const cleanId = encodeURIComponent(identifier.trim());
  const prefix = kind === 'classroom' ? 'c' : 'r';

  if (target === 'native') {
    return `${NATIVE_SCHEME}://${prefix}/${cleanId}`;
  }

  return `https://${SOVEREIGN_HOST}/${prefix}/${cleanId}`;
}
