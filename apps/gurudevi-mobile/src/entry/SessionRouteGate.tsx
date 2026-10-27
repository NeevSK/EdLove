import { useAuth } from '@repo/core/logic';
import { pendingIntentStore } from '@repo/core/logic/deeplink/pendingIntentStore';
import { Mascot } from '@repo/ui/components/Mascot';
import { Box, Pressable, Text } from '@repo/ui/primitives';
import { type Href, useGlobalSearchParams, usePathname, useRouter } from 'expo-router';
import { type ReactNode, useEffect } from 'react';
import { OptionalStartupServices } from '@/boot/OptionalStartupServices';
import { recordDevelopmentTrace } from '@/boot/startupTelemetry';
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
  const bootstrapTarget = getBootstrapRouteTarget(routeState, {
    guestOnboardingIntent: pathname === '/onboarding' && params.entry === 'guest',
  });
  const routeTarget = bootstrapTarget;
  const { decision, redirectTo } = routeTarget;
  const presentation = getEntryPresentation({
    pathname,
    profileError: routeState.profileError,
    routeTarget,
  });
  const mountCloudServices =
    presentation.kind === 'content' &&
    presentation.mountProtectedServices &&
    Boolean(routeState.session?.user);

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
    const routePattern = getDiagnosticRoutePattern(pathname);
    recordDevelopmentTrace({
      category: 'route-transition',
      task: routePattern,
      state: 'committed',
    });
  }, [pathname]);

  useEffect(() => {
    const pendingIntent = pendingIntentStore.getState().getPendingIntent();
    const action = getEntryNavigationAction({
      pathname,
      pendingIntent,
      routeTarget: { decision, redirectTo },
    });
    if (action.consumePendingIntent) pendingIntentStore.getState().drainPendingIntent();
    if (action.target) router.replace(action.target as any);
  }, [pathname, decision, redirectTo, router]);

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
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Retry restoring your sanctuary"
          onPress={() => void refreshProfile()}
          className="mt-6 rounded-xl bg-phase-interactive px-6 py-3.5 active:opacity-90"
        >
          <Text className="font-semibold text-white">Retry</Text>
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

  const content = (
    <>
      <OptionalStartupServices phase={mountCloudServices ? 'protected-ready' : 'public-ready'} />
      {children}
      {mountCloudServices ? appServices : null}
    </>
  );
  if (presentation.kind !== 'transition') return content;
  const destination = presentation.target === '/welcome' ? 'Welcome' : 'your sanctuary';
  return (
    <Box className="flex-1 items-center justify-center bg-phase-canvas px-8">
      <Text className="text-center text-base font-semibold text-phase-text-primary">
        Continue to {destination}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Continue to ${destination}`}
        onPress={() => router.replace(presentation.target as Href)}
        className="mt-5 rounded-xl bg-phase-interactive px-6 py-3.5 active:opacity-90"
      >
        <Text className="font-semibold text-white">Continue</Text>
      </Pressable>
    </Box>
  );
}

function getDiagnosticRoutePattern(pathname: string): string {
  if (pathname === '/' || pathname === '/index') return 'root';
  if (pathname === '/welcome') return 'welcome';
  if (pathname === '/onboarding') return 'onboarding';
  if (pathname.startsWith('/(tabs)/self') || pathname === '/self') return 'self';
  if (pathname.startsWith('/(tabs)/library') || pathname === '/library') return 'library';
  if (pathname.startsWith('/(tabs)/workspace') || pathname === '/workspace') return 'workspace';
  if (pathname.startsWith('/(tabs)/community') || pathname === '/community') return 'community';
  if (pathname.startsWith('/(tabs)/profile') || pathname === '/profile') return 'profile';
  if (pathname.startsWith('/auth')) return 'auth';
  return 'other';
}
