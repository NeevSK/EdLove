import { useAuth } from '@repo/core/logic';
import { pendingIntentStore } from '@repo/core/logic/deeplink/pendingIntentStore';
import { BrandPulse } from '@repo/ui/components/BrandPulse';
import { Mascot } from '@repo/ui/components/Mascot';
import { Box, Pressable, Text } from '@repo/ui/primitives';
import { useGlobalSearchParams, usePathname, useRouter } from 'expo-router';
import { type ReactNode, useEffect } from 'react';

import { getBootstrapRouteTarget, useBootstrapRouteState } from '@/entry/bootstrapRouteState';
import { getEntryNavigationAction } from '@/entry/entryNavigation';
import { getEntryPresentation } from '@/entry/entryPresentation';

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
  const presentation = getEntryPresentation({
    pathname,
    profileError: routeState.profileError,
    routeTarget,
  });

  console.log('[SessionRouteGate]', {
    pathname,
    redirectTo: routeTarget.redirectTo,
    decision: routeTarget.decision,
    sessionMode: routeState.session
      ? routeState.session.user.is_anonymous
        ? 'anonymous'
        : 'auth'
      : 'none',
    onboardingCompleted: routeState.onboardingCompleted,
    isLocalGuestReady: routeState.isLocalGuestReady,
  });

  useEffect(() => {
    const pendingIntent = pendingIntentStore.getState().getPendingIntent();
    const action = getEntryNavigationAction({ pathname, pendingIntent, routeTarget });
    if (action.consumePendingIntent) pendingIntentStore.getState().drainPendingIntent();
    if (action.target) router.replace(action.target as any);
  }, [pathname, routeTarget.decision, routeTarget.redirectTo, router]);

  // router.replace() updates the browser location before Expo Router commits
  // the destination tree. Keeping children mounted in that gap can show the
  // previous route at the new URL (for example, Welcome at /self).
  if (presentation.kind === 'restoring') {
    if (presentation.message) {
      return (
        <Box className="flex-1 items-center justify-center bg-phase-canvas px-8">
          <Mascot mode="offline" state="interrupted" size={140} podVariant="raw" />
          <Text className="mt-6 text-center text-xl font-bold text-phase-text-primary">
            Sanctuary Connection Paused
          </Text>
          <Text className="mt-2 text-center text-sm text-phase-text-muted">
            {presentation.message}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Retry restoring your sanctuary"
            onPress={() => void refreshProfile()}
            className="mt-6 w-full max-w-xs items-center rounded-xl bg-phase-interactive py-3.5 px-6 shadow-sm active:opacity-90"
          >
            <Text className="font-semibold text-white">Reconnect Sanctuary</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Return to Welcome"
            onPress={() => router.replace('/welcome')}
            className="mt-3 py-2 px-4"
          >
            <Text className="text-sm font-medium text-phase-text-muted">Return to Welcome</Text>
          </Pressable>
        </Box>
      );
    }

    return (
      <Box className="flex-1 items-center justify-center bg-phase-canvas px-8">
        <Mascot mode="glowing" state="guiding" size={120} podVariant="raw" />
        <Text className="mt-6 text-center text-base font-semibold text-phase-text-primary">
          Restoring your sanctuary…
        </Text>
      </Box>
    );
  }

  const content = (
    <>
      {children}
      {presentation.kind === 'content' && presentation.mountProtectedServices ? appServices : null}
    </>
  );
  if (presentation.kind !== 'transition') return content;
  return (
    <Box className="flex-1">
      {content}
      <Box className="absolute inset-0 z-50 items-center justify-center bg-phase-canvas px-8">
        <BrandPulse size={32} accessibilityLabel="Opening your sanctuary" />
      </Box>
    </Box>
  );
}
