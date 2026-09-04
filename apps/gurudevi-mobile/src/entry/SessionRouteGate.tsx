import {
  getAuthRouteTarget,
  getSessionIdentityMode,
  useAuth,
  useStore,
} from '@repo/core/logic';
import { useEffect, type ReactNode } from 'react';
import { usePathname, useRouter } from 'expo-router';

import { getSessionRouteReadiness } from '@/boot/sessionRouteReadiness';

export function SessionRouteGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { identityAvailability, isProfileResolving, loading, profileError, session } = useAuth();
  const onboardingCompleted = useStore((state) => state.onboardingCompleted);
  const hasActiveCapacity = useStore((state) => Boolean(state.activeBond?.capacity));
  const readiness = getSessionRouteReadiness({
    hasCachedCapabilities: false,
    hasLiveCapacity: hasActiveCapacity,
    hasProfileError: Boolean(profileError),
    hasSession: Boolean(session),
    isProfileResolving,
    isSessionLoading: loading,
  });
  const routeTarget = getAuthRouteTarget({
    bootstrapReady: readiness.routeGuardReady,
    hasActiveCapacity: readiness.hasActiveCapacity,
    hasSession: Boolean(session),
    identityAvailability,
    onboardingCompleted,
    pathname,
    sessionMode: getSessionIdentityMode(session),
  });

  useEffect(() => {
    if (!readiness.routeGuardReady || !routeTarget.redirectTo) return;
    if (pathname !== routeTarget.redirectTo) router.replace(routeTarget.redirectTo);
  }, [pathname, readiness.routeGuardReady, routeTarget.redirectTo, router]);

  return children;
}
