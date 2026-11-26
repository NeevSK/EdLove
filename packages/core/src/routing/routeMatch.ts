import { MOBILE_ROUTES, WEB_ROUTES } from '@repo/core/routing/routeCatalog.generated';

/**
 * Does a route exist, and which one is it? Matches an href (a URL like `/workspace/42`, or a
 * pattern like `/workspace/[id]`, as flows store them) against the generated route catalogue.
 * Expo hrefs may include or leave out `(group)` segments; both match.
 */

export type RoutePlatform = 'mobile' | 'web';

const CATALOG: Record<RoutePlatform, readonly string[]> = {
  mobile: MOBILE_ROUTES,
  web: WEB_ROUTES,
};

const isGroup = (segment: string) => /^\(.+\)$/.test(segment);
const segmentsOf = (path: string) =>
  (path.split(/[?#]/)[0] ?? '').split('/').filter((s) => s.length > 0 && !isGroup(s));

type Segment =
  | { kind: 'static'; value: string }
  | { kind: 'param'; name: string }
  | { kind: 'rest'; name: string; optional: boolean };

function parse(pattern: string): Segment[] {
  return segmentsOf(pattern).map((s): Segment => {
    const optionalRest = /^\[\[\.\.\.(.+)\]\]$/.exec(s);
    if (optionalRest) return { kind: 'rest', name: optionalRest[1] ?? '', optional: true };
    const rest = /^\[\.\.\.(.+)\]$/.exec(s);
    if (rest) return { kind: 'rest', name: rest[1] ?? '', optional: false };
    const param = /^\[(.+)\]$/.exec(s);
    if (param) return { kind: 'param', name: param[1] ?? '' };
    return { kind: 'static', value: s };
  });
}

const isPlaceholder = (segment: string) => /^\[.+\]$/.test(segment);

function matches(pattern: Segment[], href: string[]): boolean {
  const [head, ...tail] = pattern;
  if (!head) return href.length === 0;
  if (head.kind === 'rest') {
    const min = head.optional ? 0 : 1;
    for (let take = href.length; take >= min; take -= 1)
      if (matches(tail, href.slice(take))) return true;
    return false;
  }
  const [segment, ...others] = href;
  if (typeof segment !== 'string') return false;
  if (head.kind === 'static' && segment !== head.value) return false;
  // A placeholder in the href (`[id]`, from a flow) only matches a dynamic segment.
  if (head.kind === 'static' && isPlaceholder(segment)) return false;
  return matches(tail, others);
}

const score = (segments: Segment[]) =>
  segments.reduce((n, s) => n * 4 + (s.kind === 'static' ? 3 : s.kind === 'param' ? 2 : 1), 1);

const compiled = new Map<RoutePlatform, { pattern: string; segments: Segment[] }[]>();
function routesOf(platform: RoutePlatform) {
  let routes = compiled.get(platform);
  if (!routes) {
    routes = CATALOG[platform].map((pattern) => ({ pattern, segments: parse(pattern) }));
    // Static segments win over dynamic ones, as both routers resolve them.
    routes.sort((a, b) => score(b.segments) - score(a.segments));
    compiled.set(platform, routes);
  }
  return routes;
}

/** The catalogue route an href lands on, or `null` when no route exists for it. */
export function findRoute(href: string, platform: RoutePlatform): string | null {
  const segments = segmentsOf(href);
  return routesOf(platform).find((route) => matches(route.segments, segments))?.pattern ?? null;
}

export function routeExists(href: string, platform: RoutePlatform): boolean {
  return findRoute(href, platform) !== null;
}

export type FilledRoute = { ok: true; href: string } | { ok: false; missing: readonly string[] };

/** Fills a pattern's `[param]` segments from `params`; reports the ones that are missing. */
export function fillRoute(
  pattern: string,
  params: Readonly<Record<string, string>> = {},
): FilledRoute {
  const missing: string[] = [];
  const href = pattern.replace(
    /\[\[?(\.\.\.)?([^\]]+)\]\]?/g,
    (whole, rest: string | undefined, name: string) => {
      const value = params[name];
      if (!value) {
        if (!whole.startsWith('[[')) missing.push(name);
        return '';
      }
      return rest ? value.split('/').map(encodeURIComponent).join('/') : encodeURIComponent(value);
    },
  );
  return missing.length > 0
    ? { ok: false, missing }
    : { ok: true, href: href.replace(/\/{2,}/g, '/').replace(/(.)\/$/, '$1') };
}
