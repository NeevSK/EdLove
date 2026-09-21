import { GURUDEVI_PLATFORM_URL } from '@repo/core/config/publicUrls';
import { isValidAppRoutePath } from '@repo/core/routing/routeManifest';
import { resolveQR } from '@repo/core/logic/utils/QRResolver';
import type { QRPayload } from '@repo/core/types/QRPayload';
import { Data, Effect } from 'effect';

export const MAX_DEEP_LINK_LENGTH = 8192;
const FORBIDDEN_URL_PATTERN = /[<>'";\0\r\n]|%00/i;

const PLATFORM_HOST = new URL(GURUDEVI_PLATFORM_URL).hostname;
export const ALLOWED_WEB_HOSTS = new Set([PLATFORM_HOST, 'gurudevi.app', 'sanctuary.gurudevi.app']);
export const ALLOWED_NATIVE_HOSTS = new Set(['auth', 'qr', 'invite']);
export const ALLOWED_WEB_PATH_PREFIXES = ['/auth/callback', '/auth/complete', '/qr', '/invite'];

/**
 * Tagged Error Types for Deep Link Failures (Effect v4 compatible)
 */
export class DeepLinkLengthError extends Data.TaggedError('DeepLinkLengthError')<{
  readonly length: number;
  readonly max: number;
}> {}

export class DeepLinkForbiddenCharsError extends Data.TaggedError('DeepLinkForbiddenCharsError')<{
  readonly url: string;
}> {}

export class DeepLinkTraversalError extends Data.TaggedError('DeepLinkTraversalError')<{
  readonly url: string;
}> {}

export class DeepLinkHostOrSchemeError extends Data.TaggedError('DeepLinkHostOrSchemeError')<{
  readonly url: string;
  readonly protocol?: string;
  readonly hostname?: string;
}> {}

export class DeepLinkParseError extends Data.TaggedError('DeepLinkParseError')<{
  readonly url: string;
  readonly cause: unknown;
}> {}

export type DeepLinkValidationError =
  | DeepLinkLengthError
  | DeepLinkForbiddenCharsError
  | DeepLinkTraversalError
  | DeepLinkHostOrSchemeError
  | DeepLinkParseError;

export type RouteIntent =
  | { readonly kind: 'authCallback'; readonly url: string }
  | { readonly kind: 'classroomInvite'; readonly inviteCode: string; readonly url: string }
  | { readonly kind: 'qr'; readonly payload: QRPayload; readonly url: string }
  | { readonly kind: 'unsupported' }
  | { readonly kind: 'rejected'; readonly reason: DeepLinkValidationError['_tag'] };

function containsTraversal(value: string): boolean {
  try {
    const path = decodeURIComponent(value).split(/[?#]/, 1)[0] ?? '';
    return path.split('/').some((segment) => segment === '.' || segment === '..');
  } catch {
    return true;
  }
}

function startsWithPathPrefix(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

/**
 * Validates and normalizes deep links using Effect-TS v4-ready generator syntax.
 */
export const validateDeepLinkEffect = (
  url: string,
): Effect.Effect<string, DeepLinkValidationError> =>
  Effect.gen(function* () {
    if (url.length > MAX_DEEP_LINK_LENGTH) {
      return yield* Effect.fail(
        new DeepLinkLengthError({ length: url.length, max: MAX_DEEP_LINK_LENGTH }),
      );
    }

    if (FORBIDDEN_URL_PATTERN.test(url)) {
      return yield* Effect.fail(new DeepLinkForbiddenCharsError({ url }));
    }

    if (containsTraversal(url)) {
      return yield* Effect.fail(new DeepLinkTraversalError({ url }));
    }

    const parsed = yield* Effect.try({
      try: () => new URL(url),
      catch: (cause) => new DeepLinkParseError({ url, cause }),
    });

    if (parsed.protocol === 'gurudevi:') {
      if (ALLOWED_NATIVE_HOSTS.has(parsed.hostname)) return url;
      return yield* Effect.fail(
        new DeepLinkHostOrSchemeError({
          url,
          protocol: parsed.protocol,
          hostname: parsed.hostname,
        }),
      );
    }

    if (parsed.protocol === 'https:') {
      if (
        ALLOWED_WEB_HOSTS.has(parsed.hostname) &&
        startsWithPathPrefix(parsed.pathname, ALLOWED_WEB_PATH_PREFIXES)
      ) {
        return url;
      }
      return yield* Effect.fail(
        new DeepLinkHostOrSchemeError({
          url,
          protocol: parsed.protocol,
          hostname: parsed.hostname,
        }),
      );
    }

    if (
      parsed.protocol === 'http:' &&
      (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') &&
      startsWithPathPrefix(parsed.pathname, ALLOWED_WEB_PATH_PREFIXES)
    ) {
      return url;
    }

    return yield* Effect.fail(
      new DeepLinkHostOrSchemeError({ url, protocol: parsed.protocol, hostname: parsed.hostname }),
    );
  });

export const classifyRouteIntentEffect = (
  url: string,
): Effect.Effect<Exclude<RouteIntent, { readonly kind: 'rejected' }>, DeepLinkValidationError> =>
  Effect.gen(function* () {
    const acceptedUrl = yield* validateDeepLinkEffect(url);
    const parsed = new URL(acceptedUrl);
    const qr = resolveQR(acceptedUrl);

    if (qr.ok) {
      return { kind: 'qr', payload: qr.payload, url: acceptedUrl } as const;
    }

    if (
      (parsed.hostname === 'auth' && parsed.pathname === '/callback') ||
      (parsed.pathname === '/auth/callback' || parsed.pathname === '/auth/complete')
    ) {
      return { kind: 'authCallback', url: acceptedUrl } as const;
    }

    const inviteMatch = parsed.pathname.match(/^\/invite\/classroom\/([^/]+)$/);
    const encodedInviteCode = inviteMatch?.[1];
    if (encodedInviteCode) {
      const inviteCode = yield* Effect.try({
        try: () => decodeURIComponent(encodedInviteCode),
        catch: (cause) => new DeepLinkParseError({ url: acceptedUrl, cause }),
      });
      return {
        kind: 'classroomInvite',
        inviteCode,
        url: acceptedUrl,
      } as const;
    }

    return { kind: 'unsupported' } as const;
  });

export function classifyRouteIntent(url: string): RouteIntent {
  return Effect.runSync(
    classifyRouteIntentEffect(url).pipe(
      Effect.catchAll((error) => Effect.succeed({ kind: 'rejected', reason: error._tag } as const)),
    ),
  );
}

/**
 * Synchronous bridge for legacy non-Effect consumers.
 */
export function normalizeAcceptedDeepLink(url: string): string | null {
  return Effect.runSync(
    validateDeepLinkEffect(url).pipe(
      Effect.map((validUrl) => validUrl as string | null),
      Effect.catchAll(() => Effect.succeed(null as string | null)),
    ),
  );
}

export function isQRDeepLink(url: string): boolean {
  return classifyRouteIntent(url).kind === 'qr';
}

export function normalizeAcceptedInternalRoute(path: string): string | null {
  if (
    path.length > MAX_DEEP_LINK_LENGTH ||
    !path.startsWith('/') ||
    path.startsWith('//') ||
    FORBIDDEN_URL_PATTERN.test(path) ||
    containsTraversal(path)
  ) {
    return null;
  }
  return isValidAppRoutePath(path) ? path : null;
}
