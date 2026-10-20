import type { RouteTarget } from '@repo/core/logic/auth/bootstrapRoutes';
import type { PendingDeepLinkIntent } from '@repo/core/logic/deeplink/pendingIntentStore';

export type EntryNavigationAction = {
  consumePendingIntent: boolean;
  target: string | null;
};

/**
 * Resolves the next route without touching the router or persistence. Deferred
 * intents take priority only after admission; the gate remains their sole
 * consumer and navigation writer.
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
  if (routeTarget.decision === 'app' && pendingIntent?.targetPath) {
    const targetBase = pendingIntent.targetPath.split(/[?#]/)[0];
    return {
      consumePendingIntent: true,
      target:
        pathname === targetBase || pathname === pendingIntent.targetPath
          ? null
          : pendingIntent.targetPath,
    };
  }

  return {
    consumePendingIntent: false,
    target:
      routeTarget.redirectTo && pathname !== routeTarget.redirectTo ? routeTarget.redirectTo : null,
  };
}
