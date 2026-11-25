import { Button, Text } from '@repo/ui/components/native';
import { useWorld } from '@repo/ui/theme/native';
import { View } from 'react-native';
import { useAuth } from '@repo/core/logic';
import { pendingIntentStore } from '@repo/core/logic/deeplink/pendingIntent.store';
import { BrandPulse } from '@repo/ui';
import { Mascot } from '@repo/ui/components/Mascot';
import { useGlobalSearchParams, usePathname } from 'expo-router';
import { type ReactNode, useContext, useEffect, useState } from 'react';
import { handoffNativeSplashAfterCommit } from '@/boot/nativeSplashService';
import { OptionalStartupServices } from '@/boot/OptionalStartupServices';
import { recordDevelopmentTrace } from '@/boot/startupTelemetry';
import { BootstrapSessionContext } from '@/entry/BootstrapSessionProvider';
import {
  type BootstrapRouteState,
  getBootstrapRouteTarget,
  useBootstrapRouteState,
} from '@/entry/bootstrapRouteState';
import { getEntryNavigationAction } from '@/entry/entryNavigation';
import { getEntryPresentation } from '@/entry/entryPresentation';
import { useNavigator } from '@repo/ui/components/native/navigation';
import { EntryAccessProvider, entryAccessFor } from '@/entry/entryAccess';
import { getFirstValueRoute } from '@/entry/firstValueRoute';

type SessionRouteGateProps = {
  children: ReactNode;
  appServices?: ReactNode;
};

export function SessionRouteGate(props: SessionRouteGateProps) {
  const sharedRouteState = useContext(BootstrapSessionContext);
  if (sharedRouteState !== null) {
    return <SessionRouteGateInner {...props} routeState={sharedRouteState} />;
  }
  return <StandaloneSessionRouteGate {...props} />;
}

function StandaloneSessionRouteGate(props: SessionRouteGateProps) {
  const pathname = usePathname();
  const routeState = useBootstrapRouteState(pathname);
  return <SessionRouteGateInner {...props} routeState={routeState} />;
}

function SessionRouteGateInner({
  children,
  appServices,
  routeState,
}: SessionRouteGateProps & { routeState: BootstrapRouteState }) {
  const router = useNavigator();
  const { ground, lamp } = useWorld().tokens;
  const pathname = usePathname();
  const params = useGlobalSearchParams<{ entry?: string }>();
  const { refreshProfile } = useAuth();
  const [expiredEntryWait, setExpiredEntryWait] = useState<string | null>(null);
  const isDevelopmentToolRoute =
    __DEV__ && (pathname === '/verger-lab' || pathname === '/verger-diagnostics');
  const bootstrapTarget = getBootstrapRouteTarget(routeState, {
    guestOnboardingIntent: pathname === '/onboarding' && params.entry === 'guest',
  });
  const routeTarget = bootstrapTarget;
  const { decision, redirectTo } = routeTarget;
  const presentation = isDevelopmentToolRoute
    ? { kind: 'content' as const, mountProtectedServices: false }
    : getEntryPresentation({
        pathname,
        profileError: routeState.profileError,
        routeTarget,
      });
  // Each calm wait (a transition, or restoring without an error) is keyed by its
  // route and kind, so a new wait starts unexpired without resetting state.
  const entryWaitKey =
    presentation.kind === 'transition' ||
    (presentation.kind === 'restoring' && !presentation.message)
      ? `${pathname}:${presentation.kind}`
      : null;
  const entryWaitExpired = entryWaitKey !== null && expiredEntryWait === entryWaitKey;
  useEffect(() => {
    if (!entryWaitKey) return;
    const timeout = setTimeout(() => setExpiredEntryWait(entryWaitKey), 8_000);
    return () => {
      clearTimeout(timeout);
      // A later wait with the same key must start calm again.
      setExpiredEntryWait(null);
    };
  }, [entryWaitKey]);
  // The native splash stays over the root -> destination replace, so the first
  // visible frame is the admitted route rather than a transition surface that
  // exists only while Expo Router commits. A transition that outlasts the wait
  // releases it anyway, so the Continue fallback below can be reached.
  const revealEntry = presentation.kind !== 'transition' || entryWaitExpired;
  useEffect(() => {
    if (!revealEntry) return;
    return handoffNativeSplashAfterCommit({
      onCommit: () => {
        console.log('[entry] admitted route committed; hiding native splash');
        recordDevelopmentTrace({
          category: 'startup',
          task: 'admitted-route-frame',
          state: 'committed',
        });
      },
      onError: (error: unknown) => {
        console.warn('[entry] native splash handoff unavailable:', error);
      },
    });
  }, [revealEntry]);
  const isAdmittedAppContent =
    presentation.kind === 'content' && presentation.mountProtectedServices;
  const mountCloudServices = isAdmittedAppContent && Boolean(routeState.session?.user);

  // Domain catalogs (@repo/self, @repo/ai, @repo/form-builder, @repo/workforce) are
  // deferred off cold boot so /welcome, /auth and /onboarding paint first, then
  // registered once upon admission for both authenticated users and local guests.
  useEffect(() => {
    if (!isAdmittedAppContent) return;
    void import('@/boot/registerAppCatalog')
      .then(({ registerAppCatalog }) => {
        registerAppCatalog();
      })
      .catch((error: unknown) => {
        console.warn('[entry] deferred app catalog registration unavailable:', error);
      });
  }, [isAdmittedAppContent]);

  // Development tools keep their own entry rules; everything else follows the 5-zone guard map.
  const isGuestSession =
    Boolean(routeState.hasLocalGuestSession) || Boolean(routeState.session?.user?.is_anonymous);
  const access = entryAccessFor(isDevelopmentToolRoute ? 'app' : decision, redirectTo, {
    isGuestSession,
    guestOnboardingIntent: pathname === '/onboarding' && params.entry === 'guest',
    hasRememberedAccounts: routeState.hasRememberedAccounts,
    appEntryPath: getFirstValueRoute(routeState.activeCapacity),
  });
  const routes = <EntryAccessProvider value={access}>{children}</EntryAccessProvider>;

  const content = (
    <>
      <OptionalStartupServices phase={mountCloudServices ? 'protected-ready' : 'public-ready'} />
      {routes}
      {mountCloudServices ? appServices : null}
    </>
  );

  const sessionMode = routeState.session
    ? routeState.session.user.is_anonymous
      ? 'anonymous'
      : 'auth'
    : 'none';
  useEffect(() => {
    console.log('[SessionRouteGate]', {
      pathname,
      redirectTo,
      decision,
      sessionMode,
      onboardingCompleted: routeState.onboardingCompleted,
      isLocalGuestReady: routeState.isLocalGuestReady,
    });
  }, [
    pathname,
    redirectTo,
    decision,
    sessionMode,
    routeState.onboardingCompleted,
    routeState.isLocalGuestReady,
  ]);

  useEffect(() => {
    const routePattern = getDiagnosticRoutePattern(pathname);
    recordDevelopmentTrace({
      category: 'route-transition',
      task: routePattern,
      state: presentation.kind,
      decision: routeTarget.decision,
    });
  }, [pathname, presentation.kind, routeTarget.decision]);

  useEffect(() => {
    recordDevelopmentTrace({
      category: 'route-readiness',
      task: getDiagnosticRoutePattern(pathname),
      state: decision,
      session_loading: routeState.isSessionLoading,
      profile_resolving: routeState.isProfileResolving,
      local_guest_ready: Boolean(routeState.isLocalGuestReady),
      onboarding_completed: routeState.onboardingCompleted,
      profile_error_present: Boolean(routeState.profileError),
      has_session: Boolean(routeState.session),
    });
  }, [
    decision,
    pathname,
    routeState.isLocalGuestReady,
    routeState.isProfileResolving,
    routeState.isSessionLoading,
    routeState.onboardingCompleted,
    routeState.profileError,
    routeState.session,
  ]);

  useEffect(() => {
    if (isDevelopmentToolRoute) return;
    const pendingIntent = pendingIntentStore.getState().getPendingIntent();
    const action = getEntryNavigationAction({
      pathname,
      pendingIntent,
      routeTarget: { decision, redirectTo },
    });
    if (action.consumePendingIntent) pendingIntentStore.getState().drainPendingIntent();
    if (action.target) router.follow(action.target, 'entry-gate', 'replace');
  }, [isDevelopmentToolRoute, pathname, decision, redirectTo, router]);

  // Keep Expo Router's navigator mounted during admission and redirects. The
  // opaque surface covers it while the destination is not ready, avoiding a
  // temporary fallback to the null index route.
  if (presentation.kind === 'restoring') {
    return (
      <View style={{ flex: 1 }}>
        <View
          style={FILL}
          pointerEvents="none"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          {routes}
        </View>
        <View style={[FILL, CENTRE, { backgroundColor: ground }]}>
          {presentation.message ? (
            <>
              <Mascot mode="offline" state="interrupted" size={140} podVariant="raw" />
              <Text kind="title" align="center" style={{ marginTop: 24 }}>
                Sanctuary Connection Paused
              </Text>
              <Text kind="body" tone="soft" align="center" style={{ marginTop: 8 }}>
                {presentation.message}
              </Text>
              <Button
                label="Reconnect Sanctuary"
                variant="primary"
                accessibilityRole="button"
                accessibilityLabel={'Retry restoring your sanctuary'}
                onPress={() => void refreshProfile()}
                style={{ marginTop: 12 }}
              />
              <Button
                label="Return to Welcome"
                variant="quiet"
                accessibilityRole="button"
                accessibilityLabel={'Return to Welcome'}
                onPress={() => router.replace('/welcome')}
                style={{ marginTop: 12 }}
              />
            </>
          ) : (
            <>
              <BrandPulse size={32} tintColor={lamp} accessibilityLabel="Opening Gurudevi" />
              <Text kind="label" align="center" style={{ marginTop: 24 }}>
                Opening Gurudevi…
              </Text>
              {entryWaitExpired ? (
                <>
                  <Text kind="body" tone="soft" align="center" style={{ marginTop: 8 }}>
                    This is taking longer than usual.
                  </Text>
                  <Button
                    label="Retry"
                    variant="primary"
                    accessibilityRole="button"
                    accessibilityLabel={'Retry restoring your sanctuary'}
                    onPress={() => void refreshProfile()}
                    style={{ marginTop: 12 }}
                  />
                  <Button
                    label="Return to Welcome"
                    variant="quiet"
                    accessibilityRole="button"
                    accessibilityLabel={'Return to Welcome'}
                    onPress={() => router.replace('/welcome')}
                    style={{ marginTop: 12 }}
                  />
                </>
              ) : null}
            </>
          )}
        </View>
      </View>
    );
  }

  if (presentation.kind === 'content') return content;

  const destination = presentation.target === '/welcome' ? 'Welcome' : 'your sanctuary';
  return (
    <View style={{ flex: 1 }}>
      <View
        style={FILL}
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        {routes}
      </View>
      <View style={[FILL, CENTRE, { backgroundColor: ground }]}>
        <Text kind="label" align="center">
          Continue to {destination}
        </Text>
        <Button
          label="Continue"
          variant="primary"
          accessibilityRole="button"
          accessibilityLabel={`Continue to ${destination}`}
          onPress={() => router.follow(presentation.target, 'entry-gate', 'replace')}
          style={{ marginTop: 20 }}
        />
      </View>
    </View>
  );
}

const FILL = { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 } as const;
const CENTRE = { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 } as const;

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
