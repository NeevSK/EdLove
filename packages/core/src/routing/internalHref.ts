import { findRoute, type RoutePlatform } from '@repo/core/routing/routeMatch';

/**
 * The one check every in-app destination passes before the router sees it (L9), whether it was
 * written in code, built from registry data, or arrived from outside (a deep link, a push
 * notification, a gate's redirect). Deep links add their own host and prefix allowlist on top
 * (`logic/deeplink/deepLinkPolicyPipeline`); this is the floor both share.
 *
 * An href is accepted only if it is an absolute in-app path (never a scheme, a host, or a
 * protocol-relative `//` or `/\`), free of control and markup characters, without `.`/`..`
 * segments even when encoded, of bounded length, and lands on a screen in the route catalogue.
 */

export const MAX_HREF_LENGTH = 8192;

/** Markup and quote characters, `;`, backslash (some URL parsers read `/\host` as `//host`), and percent-encoded control characters. */
const FORBIDDEN_URL_PATTERN = /[<>'";\\]|%(?:0[0-9a-f]|1[0-9a-f]|7f)/i;

/** True when text has a raw control character (U+0000 to U+001F, or U+007F). */
const hasControlCharacter = (value: string) => {
  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i);
    if (code < 0x20 || code === 0x7f) return true;
  }
  return false;
};

/** True when URL text carries characters no first-party link needs: markup, quotes, `;`, backslash, control characters raw or encoded. */
export const hasUnsafeUrlText = (value: string) =>
  FORBIDDEN_URL_PATTERN.test(value) || hasControlCharacter(value);

/** True when a path has a `.` or `..` segment, decoded or not; undecodable input counts as one. */
export function containsTraversal(value: string): boolean {
  try {
    const path = decodeURIComponent(value).split(/[?#]/, 1)[0] ?? '';
    return path.split('/').some((segment) => segment === '.' || segment === '..');
  } catch {
    return true;
  }
}

export type InternalHrefRejection =
  | 'not_a_string'
  | 'too_long'
  | 'not_internal'
  | 'unsafe_characters'
  | 'traversal'
  | 'unfilled_params'
  | 'unknown_route';

export type CheckedHref =
  | {
      readonly ok: true;
      /** The href to navigate to, unchanged. */
      readonly href: string;
      /** Its path without query or fragment: safe to log. */
      readonly path: string;
      /** The catalogue route it lands on. */
      readonly route: string;
    }
  | { readonly ok: false; readonly reason: InternalHrefRejection; readonly path?: string };

const pathOf = (href: string) => href.split(/[?#]/, 1)[0] ?? '';

export function checkInternalHref(raw: unknown, platform: RoutePlatform): CheckedHref {
  if (typeof raw !== 'string') return { ok: false, reason: 'not_a_string' };
  if (raw.length > MAX_HREF_LENGTH) return { ok: false, reason: 'too_long' };
  if (!raw.startsWith('/') || raw.startsWith('//') || raw.startsWith('/\\'))
    return { ok: false, reason: 'not_internal' };
  if (hasUnsafeUrlText(raw)) return { ok: false, reason: 'unsafe_characters' };
  const path = pathOf(raw);
  if (containsTraversal(path)) return { ok: false, reason: 'traversal', path };
  // A `[param]` left in the path would match its dynamic route and open it with the literal text.
  if (/[[\]]/.test(path)) return { ok: false, reason: 'unfilled_params', path };
  const route = findRoute(path, platform);
  if (!route) return { ok: false, reason: 'unknown_route', path };
  return { ok: true, href: raw, path, route };
}

export type HrefParamValue = string | number | boolean | readonly (string | number)[];
export type HrefParams = Readonly<Record<string, HrefParamValue | null | undefined>>;

/**
 * Builds an href from a route pattern and params, as expo-router's `{ pathname, params }` does:
 * `[name]` and `[...name]` segments take their param (encoded per segment), groups stay as
 * written, and every other param goes to the query string. A required segment with no value
 * leaves its placeholder, so `checkInternalHref` rejects the result (`unfilled_params`) rather than
 * navigating to a half-built path.
 */
export function buildHref(pathname: string, params: HrefParams = {}): string {
  const used = new Set<string>();
  const path = pathname.replace(
    /\[\[?(\.\.\.)?([^\]]+)\]\]?/g,
    (whole, rest: string | undefined, name: string) => {
      const value = params[name];
      if (value == null || value === '') {
        return whole.startsWith('[[') ? '' : whole;
      }
      used.add(name);
      const parts = Array.isArray(value) ? value : rest ? String(value).split('/') : [value];
      return parts.map((part) => encodeURIComponent(String(part))).join('/');
    },
  );
  const query = new URLSearchParams();
  for (const [name, value] of Object.entries(params)) {
    if (used.has(name) || value == null) continue;
    for (const item of Array.isArray(value) ? value : [value]) query.append(name, String(item));
  }
  const clean = path.replace(/\/{2,}/g, '/').replace(/(.)\/$/, '$1') || '/';
  const search = query.toString();
  return search ? `${clean}?${search}` : clean;
}
