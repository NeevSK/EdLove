import type { RouteTarget } from '@repo/core/logic/auth/bootstrapRoutes';
import type { PendingDeepLinkIntent } from '@repo/core/logic/deeplink/pendingIntentStore';

export type EntryNavigationAction = {
  consumePendingIntent: boolean;
  clearStaleIntent?: boolean;
  target: string | null;
};

/**
 * Resolves the next route without touching the router or persistence. Deferred
 * intents take priority only after admission; the gate remains their sole
 * consumer and navigation writer.
 *
 * Active Choice Invalidation:
 * If the user actively navigates to a voluntary public sanctuary space (e.g. /pulse, /intro)
 * that differs from the pending intent's target, the pending intent is classified as stale
 * and cleared so it does not hijack future authenticated sessions.
 */
export function getEntryNavigationAction({
  pathname,
  pendingIntent,
  routeTarget,
}: {
  pathname: string;
  pendingIntent: PendingDeepLinkIntent | null;
  routeTarget: Pick<RouteTarget, 'decision' | 'redirectTo'>;
}): EntryNavigationAction {
  if (pendingIntent?.targetPath) {
    const targetBase = pendingIntent.targetPath.split(/[?#]/)[0];

    // If user is unauthenticated on a voluntary standalone route (/pulse, /intro) different from target
    const isVoluntaryPublicRoute =
      routeTarget.decision === 'public' &&
      (pathname === '/pulse' || pathname === '/intro') &&
      pathname !== targetBase;

    if (isVoluntaryPublicRoute) {
      return {
        consumePendingIntent: false,
        clearStaleIntent: true,
        target: null,
      };
    }

    if (routeTarget.decision === 'app') {
      return {
        consumePendingIntent: true,
        target:
          pathname === targetBase || pathname === pendingIntent.targetPath
            ? null
            : pendingIntent.targetPath,
      };
    }
  }

  return {
    consumePendingIntent: false,
    target:
      routeTarget.redirectTo && pathname !== routeTarget.redirectTo ? routeTarget.redirectTo : null,
  };
}
