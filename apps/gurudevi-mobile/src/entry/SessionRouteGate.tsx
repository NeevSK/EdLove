import { isPublicBootstrapRoute, useAuth } from '@repo/core/logic';
import { BrandPulse } from '@repo/ui/components/BrandPulse';
import { Box, Pressable, Text } from '@repo/ui/primitives';
import { useGlobalSearchParams, usePathname, useRouter } from 'expo-router';
import { type ReactNode, useEffect } from 'react';

import { getBootstrapRouteTarget, useBootstrapRouteState } from '@/entry/bootstrapRouteState';

export function SessionRouteGate({
  children,
  appServices,
}: {
  children: ReactNode;
  appServices?: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useGlobalSearchParams<{ entry?: string }>();
  const { refreshProfile } = useAuth();
  const routeState = useBootstrapRouteState(pathname);
  const routeTarget = getBootstrapRouteTarget(routeState, {
    guestOnboardingIntent: pathname === '/onboarding' && params.entry === 'guest',
  });

  useEffect(() => {
    if (!routeTarget.redirectTo) return;
    if (pathname !== routeTarget.redirectTo) router.replace(routeTarget.redirectTo);
  }, [pathname, routeTarget.redirectTo, router]);

  // router.replace() updates the browser location before Expo Router commits
  // the destination tree. Keeping children mounted in that gap can show the
  // previous route at the new URL (for example, Welcome at /self).
  if (routeTarget.redirectTo && pathname !== routeTarget.redirectTo) {
    return (
      <Box className="flex-1 items-center justify-center bg-phase-canvas px-8">
        <BrandPulse size={32} accessibilityLabel="Opening your sanctuary" />
      </Box>
    );
  }

  if (routeTarget.decision === 'booting' && !isPublicBootstrapRoute(pathname)) {
    return (
      <Box className="flex-1 items-center justify-center bg-phase-canvas px-8">
        <BrandPulse size={32} accessibilityLabel="Restoring your sanctuary" />
        <Text className="mt-4 text-center text-base font-semibold text-phase-text-primary">
          {routeState.profileError
            ? 'We could not finish restoring your sanctuary.'
            : 'Restoring your sanctuary…'}
        </Text>
        {routeState.profileError ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Retry restoring your sanctuary"
            onPress={() => void refreshProfile()}
            className="mt-5 rounded-full bg-phase-interactive px-5 py-3"
          >
            <Text className="font-bold text-white">Try again</Text>
          </Pressable>
        ) : null}
      </Box>
    );
  }

  return (
    <>
      {children}
      {routeTarget.decision === 'app' && !isPublicBootstrapRoute(pathname)
        ? appServices
        : null}
    </>
  );
}
