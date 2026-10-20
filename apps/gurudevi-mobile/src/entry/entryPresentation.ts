import { isPublicBootstrapRoute } from '@repo/core/logic';
import type { RouteTarget } from '@repo/core/logic/auth/bootstrapRoutes';

export type EntryPresentation =
  | { kind: 'restoring'; message: string | null }
  | { kind: 'transition'; target: string }
  | { kind: 'content'; mountProtectedServices: boolean };

/**
 * Converts the authoritative route decision into one visual ownership state.
 * It deliberately has no navigation, store, or network side effects.
 */
export function getEntryPresentation({
  pathname,
  profileError,
  routeTarget,
}: {
  pathname: string;
  profileError: string | null;
  routeTarget: RouteTarget;
}): EntryPresentation {
  if (routeTarget.decision === 'booting' && !isPublicBootstrapRoute(pathname)) {
    return { kind: 'restoring', message: profileError };
  }

  if (
    routeTarget.redirectTo &&
    pathname !== routeTarget.redirectTo &&
    !routeTarget.policy.canRenderCurrentPath
  ) {
    return { kind: 'transition', target: routeTarget.redirectTo };
  }

  return {
    kind: 'content',
    mountProtectedServices: routeTarget.decision === 'app' && !isPublicBootstrapRoute(pathname),
  };
}
