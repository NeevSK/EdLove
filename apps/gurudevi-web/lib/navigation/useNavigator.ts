import { NAVIGATION_POLICY, type NavigationOp } from '@repo/core/flows/navigationPolicy';
import { captureException } from '@repo/core/monitoring';
import { checkInternalHref, type InternalHrefRejection } from '@repo/core/routing/internalHref';
import { useRouter } from '@tanstack/react-router';
import { useMemo } from 'react';

export type NavigationOutcome =
  | { readonly ok: true; readonly href: string; readonly route: string }
  | { readonly ok: false; readonly reason: InternalHrefRejection };

/**
 * The web half of the checked navigator (L9). Links written in code use TanStack Router's typed
 * `<Link to>` and `navigate({ to })`, which the compiler checks against the route tree. A destination
 * that only exists at runtime (a workspace task's route, a feature's href, a sign-in `returnTo`) goes
 * through `follow` instead: the same `checkInternalHref` the mobile navigator and deep links use
 * (in-app path only, no unsafe characters or traversal, a page that exists), reported with its path
 * only when refused, never navigated to. The web has no stack to dismiss, so `dismissTo` replaces.
 */
export function useNavigator() {
  const router = useRouter();

  return useMemo(
    () => ({
      follow(raw: unknown, source: string, op: NavigationOp = 'push'): NavigationOutcome {
        const checked = checkInternalHref(raw, 'web');
        if (!checked.ok) {
          captureException(new Error(`Navigation refused: ${checked.reason}`), {
            boundary: 'navigator',
            source,
            reason: checked.reason,
            path: checked.path,
          });
          return { ok: false, reason: checked.reason };
        }
        void router.navigate({
          href: checked.href,
          replace: op !== 'push',
          viewTransition: NAVIGATION_POLICY.web.viewTransitions,
        });
        return { ok: true, href: checked.href, route: checked.route };
      },
      /** Loads a runtime destination's code and data ahead of the person, silently skipping a refused one. */
      warm(raw: unknown) {
        const checked = checkInternalHref(raw, 'web');
        if (checked.ok) void router.preloadRoute({ to: checked.href });
      },
    }),
    [router],
  );
}
