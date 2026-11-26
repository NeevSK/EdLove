import { NAVIGATION_POLICY, type NavigationOp } from '@repo/core/flows/navigationPolicy';
import { captureException } from '@repo/core/monitoring';
import {
  buildHref,
  type HrefParams,
  checkInternalHref,
  type InternalHrefRejection,
} from '@repo/core/routing/internalHref';
import type { AppHref, RoutePattern } from '@repo/core/routing/routeHref';
import { type Href, useRouter } from 'expo-router';
import { useMemo } from 'react';

/** Where to go: an href to a screen that exists, or a route pattern with its params. */
export type Destination = AppHref | { readonly pathname: RoutePattern; readonly params?: HrefParams };

export type NavigationOutcome =
  | { readonly ok: true; readonly href: string; readonly route: string }
  | { readonly ok: false; readonly reason: InternalHrefRejection };

const hrefOf = (to: Destination): string =>
  typeof to === 'string' ? to : buildHref(to.pathname, to.params);

/**
 * The only way the mobile app moves between screens (L9). It wraps expo-router 58's `useRouter()`
 * (bound to this screen's root, which SDK 58 prefers to the module-level `router`) and checks every
 * destination with `checkInternalHref` first: in-app paths only, no unsafe characters or traversal,
 * and a screen that exists in the route catalogue. A destination that fails never reaches the
 * router; it is reported (its path only, never its query, which can carry codes or personal data)
 * and the reason is returned so the screen can respond.
 *
 * Literal hrefs are typed against the catalogue (`push('/settings')`), so a missing screen fails the
 * type check. Strings known only at runtime (a notification's payload, a gate's target, registry
 * data) go through `follow`, which runs the same check without pretending to know them statically.
 * Flow steps go through `useFlowNavigator`, which is built on this.
 */
export function useNavigator() {
  const router = useRouter();

  return useMemo(() => {
    const go = (op: NavigationOp, raw: unknown, source: string): NavigationOutcome => {
      const checked = checkInternalHref(raw, 'mobile');
      if (!checked.ok) {
        captureException(new Error(`Navigation refused: ${checked.reason}`), {
          boundary: 'navigator',
          source,
          reason: checked.reason,
          path: checked.path,
        });
        return { ok: false, reason: checked.reason };
      }
      // The one place a checked string becomes expo-router's `Href`.
      if (op === 'push') {
        // Arriving in another stack by push keeps its overview underneath. Replace and dismissTo
        // move within where the person already is (the entry gate's redirects land on the
        // unanchored root), so they don't take it.
        router.push(checked.href as Href, { withAnchor: NAVIGATION_POLICY.mobile.withAnchor });
      } else {
        router[op](checked.href as Href);
      }
      return { ok: true, href: checked.href, route: checked.route };
    };

    const warm = (raw: unknown) => {
      const checked = checkInternalHref(raw, 'mobile');
      if (checked.ok) router.prefetch(checked.href as Href);
    };

    return {
      push: (to: Destination) => go('push', hrefOf(to), 'push'),
      replace: (to: Destination) => go('replace', hrefOf(to), 'replace'),
      /** Back to `to` if it is underneath, otherwise replace the current screen with it. */
      dismissTo: (to: Destination) => go('dismissTo', hrefOf(to), 'dismissTo'),
      /**
       * Navigates to a string known only at runtime, after the same check. `source` names where it
       * came from (`notification`, `entry-gate`, …) in the report when it is refused.
       */
      follow: (raw: unknown, source: string, op: NavigationOp = 'push') => go(op, raw, source),
      /** Warms a screen before the person commits to it; silent when the destination is refused. */
      prefetch: (to: Destination) => warm(hrefOf(to)),
      /** `prefetch` for a string known only at runtime. */
      warm: (raw: unknown) => warm(raw),
      canGoBack: () => router.canGoBack(),
      /** Back; at the root, `fallback` takes its place (replacing), or nothing happens. */
      back(fallback?: Destination) {
        if (router.canGoBack()) router.back();
        else if (fallback) go('replace', hrefOf(fallback), 'back-fallback');
      },
    };
  }, [router]);
}

export type Navigator = ReturnType<typeof useNavigator>;
