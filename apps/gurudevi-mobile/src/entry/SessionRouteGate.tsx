import { isPublicBootstrapRoute } from '@repo/core/logic';
import { usePathname, useRouter } from 'expo-router';
import { type ReactNode, useEffect } from 'react';

import { getBootstrapRouteTarget, useBootstrapRouteState } from '@/entry/bootstrapRouteState';

export function SessionRouteGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const routeState = useBootstrapRouteState(pathname);
  const routeTarget = getBootstrapRouteTarget(routeState);

  useEffect(() => {
    if (!routeTarget.redirectTo) return;
    if (pathname !== routeTarget.redirectTo) router.replace(routeTarget.redirectTo);
  }, [pathname, routeTarget.redirectTo, router]);

  // The index route only redirects to /welcome; withholding it here would leave
  // the router with no mounted route while the session restores.
  if (routeTarget.decision === 'booting' && pathname !== '/' && !isPublicBootstrapRoute(pathname)) {
    return null;
  }

  return children;
}
