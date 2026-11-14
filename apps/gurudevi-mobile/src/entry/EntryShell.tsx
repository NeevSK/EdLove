import {
  CapabilityHydrationProvider,
  GlobalProvider,
  useCapabilityHydration,
} from '@repo/core/logic';
import { readLocalGuestSession } from '@repo/core/native/localGuestSession';
import { useUIStore } from '@repo/core/store';
import { inMemoryHealthAdapter } from '@repo/self';
import { LayoutLoopSentinel, MascotProvider } from '@repo/ui';
import ErrorBoundary from '@repo/ui/components/ErrorBoundary';
import {
  KeypadHost,
  registerFloorPictures,
  TypingBar,
  ToastHost,
  WorldMomentHost,
  WorldStage,
} from '@repo/ui/components/native';
import {
  CircadianProvider,
  EnvironmentProvider,
  ExternalLinkProvider,
  FidelityProvider,
} from '@repo/ui/context';
import { FABProvider } from '@repo/ui/context/FABContext';
import { Box, PortalProvider, Pressable, Text } from '@repo/ui/primitives';
import { FeatureProvider, ToastProvider } from '@repo/ui/providers';
import { sensoryFeedback } from '@repo/ui/sensory';
import { reportVergerInteraction } from '@repo/verger-react';
import { QueryClientProvider } from '@tanstack/react-query';
import { type Href, Stack, useGlobalSearchParams, usePathname } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  handoffNativeSplashAfterCommit,
  NATIVE_SPLASH_MAX_HOLD_MS,
} from '@/boot/nativeSplashService';
import { OptionalStartupServices } from '@/boot/OptionalStartupServices';
import {
  observeDevelopmentInteractions,
  observeDevelopmentTimings,
  recordDevelopmentTrace,
} from '@/boot/startupTelemetry';
import { PersonalPreferences } from '@/boot/PersonalPreferences';
import { WorldFonts } from '@/boot/WorldFonts';
import { fireflyMascotConfig } from '@/brand/mascotArtwork';
import { AppVersionGateOverlay } from '@/components/AppVersionGateOverlay';
import { AuthQueryCacheBoundary } from '@/entry/AuthQueryCacheBoundary';
import { GuestConversionBoundary } from '@/entry/GuestConversionBoundary';
import { GuestPersistenceNotice } from '@/entry/GuestPersistenceNotice';
import { PasswordRecoveryBoundary } from '@/entry/PasswordRecoveryBoundary';
import { useEntryAccess } from '@/entry/entryAccess';
import { SessionRouteGate } from '@/entry/SessionRouteGate';
import { FLOOR_PICTURES, FLOOR_PICTURES_WIDE } from '@/generated/floorPictures';
import { queryClient } from '@/lib/queryClient';
import { DeepLinkProvider } from '@/providers/DeepLinkProvider';
import { GurudeviVerger } from '@/runtime/GurudeviVerger';
import WelcomeConceptPreview from '@/screens/WelcomeConceptPreview';
import { SanctuaryPulseOverlay } from '@/somatic/SanctuaryPulseOverlay';
import { useSomaticShake } from '@/somatic/useSomaticShake';

/**
 * The deliberately small route host for first paint.
 *
 * It only mounts after the critical runtime registration boundary succeeds.
 * Optional native services stay outside this route host so their failure cannot
 * turn a public launch into a blank surface.
 */
// Small phones show each world's floor as a baked picture instead of drawing it.
registerFloorPictures(FLOOR_PICTURES, FLOOR_PICTURES_WIDE);

const readLocalGuestId = async () => (await readLocalGuestSession())?.id ?? null;

export function EntryShell() {
  const pathname = usePathname();
  const params = useGlobalSearchParams<{ preview?: string }>();
  const isBreathingOpen = useUIStore((s) => s.isBreathingOpen);
  const setBreathingOpen = useUIStore((s) => s.setBreathingOpen);

  // Global physical kinetic shake sensor (10Hz on-device)
  useSomaticShake({
    enabled: !isBreathingOpen,
    onShake: () => {
      sensoryFeedback.emit('milestone');
      setBreathingOpen(true);
    },
  });

  useEffect(() => {
    const stopObservingInteractions = observeDevelopmentInteractions();
    const stopObservingTimings = observeDevelopmentTimings();
    recordDevelopmentTrace({
      category: 'startup-boundary',
      task: 'entry-shell-mounted',
      state: 'committed',
    });
    console.log('[entry-shell] mounted');
    const shellFrame = requestAnimationFrame(() => {
      recordDevelopmentTrace({
        category: 'startup',
        task: 'first-shell-frame',
        state: 'committed',
      });
    });
    // SessionRouteGate releases the splash once the admitted route commits; this
    // only covers paths that never reach it.
    let stopSplashHandoff = () => {};
    const splashHold = setTimeout(() => {
      stopSplashHandoff = handoffNativeSplashAfterCommit({
        onError: (error: unknown) => {
          console.warn('[entry-shell] native splash safety release unavailable:', error);
        },
      });
    }, NATIVE_SPLASH_MAX_HOLD_MS);
    return () => {
      stopObservingInteractions();
      stopObservingTimings();
      cancelAnimationFrame(shellFrame);
      clearTimeout(splashHold);
      stopSplashHandoff();
    };
  }, []);

  if (__DEV__ && pathname === '/welcome' && params.preview === 'concepts') {
    return (
      <SafeAreaProvider>
        <WelcomeConceptPreview />
      </SafeAreaProvider>
    );
  }

  return (
    <GestureHandlerRootView
      style={styles.root}
      onStartShouldSetResponderCapture={reportVergerInteraction}
      onMoveShouldSetResponderCapture={reportVergerInteraction}
    >
      <ErrorBoundary name="EntryShell">
        <SafeAreaProvider>
          {/* One keyboard model for the app: fields stay in view, the typing bar rides on top. */}
          <KeyboardProvider>
            <QueryClientProvider client={queryClient}>
              <GlobalProvider readLocalGuestId={readLocalGuestId}>
                <EnvironmentProvider>
                  <FidelityProvider>
                    <GurudeviVerger>
                      <OptionalStartupServices phase="public-ready" />
                      <WorldFonts />
                      <PersonalPreferences />
                      <CircadianProvider>
                        <PortalProvider>
                          <ToastProvider>
                            <ExternalLinkProvider>
                              <DeepLinkProvider>
                                <AuthQueryCacheBoundary />
                                <FABProvider>
                                  <MascotProvider config={fireflyMascotConfig}>
                                    <LayoutLoopSentinel name="RootShell" style={styles.root}>
                                      {/* One floor under every screen: the world draws it, verger sets how richly. */}
                                      <WorldStage>
                                        <AppVersionGateOverlay />
                                        <GuestPersistenceNotice />
                                        <GuestConversionBoundary />
                                        <PasswordRecoveryBoundary />
                                        <SessionRouteGate
                                          appServices={<AuthenticatedAppServices />}
                                        >
                                          <EntryStack />
                                        </SessionRouteGate>
                                        <SanctuaryPulseOverlay
                                          visible={isBreathingOpen}
                                          onDismiss={() => setBreathingOpen(false)}
                                          isPlayfulMode={true}
                                          onSessionComplete={(seconds) => {
                                            void inMemoryHealthAdapter.recordMindfulSession(
                                              seconds,
                                            );
                                            sensoryFeedback.emit('success');
                                          }}
                                        />
                                        <WorldMomentHost />
                                        <ToastHost bottomOffset={120} />
                                        {/* Typing: our keypad for numbers, and the bar above the phone's keyboard. */}
                                        <KeypadHost />
                                        <TypingBar />
                                      </WorldStage>
                                    </LayoutLoopSentinel>
                                  </MascotProvider>
                                </FABProvider>
                              </DeepLinkProvider>
                            </ExternalLinkProvider>
                          </ToastProvider>
                        </PortalProvider>
                      </CircadianProvider>
                    </GurudeviVerger>
                  </FidelityProvider>
                </EnvironmentProvider>
              </GlobalProvider>
            </QueryClientProvider>
          </KeyboardProvider>
        </SafeAreaProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}

function AuthenticatedAppServices() {
  return (
    <CapabilityHydrationProvider>
      <FeatureProvider>
        <CapabilityHydrationRecoveryNotice />
      </FeatureProvider>
    </CapabilityHydrationProvider>
  );
}

function CapabilityHydrationRecoveryNotice() {
  const { error, isLoading, retry } = useCapabilityHydration();

  if (!error || isLoading) return null;

  return (
    <Box className="absolute left-4 right-4 top-4 z-50 rounded-2xl border border-phase-border bg-phase-surface p-4 shadow-lg">
      <Text className="text-sm font-semibold text-phase-text-primary">
        Some optional capabilities could not be synchronized.
      </Text>
      <Text className="mt-1 text-xs text-phase-text-secondary">
        Your baseline sanctuary remains available. Try again to restore additional features.
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Retry capability synchronization"
        className="mt-3 self-start rounded-full bg-phase-interactive px-4 py-2"
        onPress={retry}
      >
        <Text className="font-semibold text-white">Try again</Text>
      </Pressable>
    </Box>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

/**
 * The app's root routes. The tabs and their modals sit inside `Stack.Protected`, so the router
 * itself refuses them for anyone the entry gate hasn't admitted (expo-router 58 renders a redirect
 * in their place, before the screen mounts). The gate still owns the splash handoff, the restoring
 * and transition surfaces, and replaying a pending deep link after sign-in.
 */
/** Top-level app screens outside the tabs: only for admitted people. */
const APP_SCREENS = [
  'a-i-assistant',
  'atlas',
  'companions',
  'form-builder',
  'icon-lab',
  'reading',
  'shell-lab',
  'tutii-dance-preview',
  'ui-showcase',
  'world-showcase',
] as const;

function EntryStack() {
  const access = useEntryAccess();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="auth" />
      <Stack.Screen name="account-recovery" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="public-form/[slug]" />
      <Stack.Screen name="verger-lab" />
      <Stack.Screen name="verger-diagnostics" />
      <Stack.Screen name="pulse" />
      {/* Every app screen is declared here: a Stack mounts undeclared routes too, outside the guard. */}
      {/* `access.redirectTo` passed checkInternalHref; this is where it becomes the router's type. */}
      <Stack.Protected guard={access.appRoutes} redirectTo={access.redirectTo as Href}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(modal)" options={{ presentation: 'modal' }} />
        {APP_SCREENS.map((name) => (
          <Stack.Screen key={name} name={name} />
        ))}
      </Stack.Protected>
    </Stack>
  );
}
