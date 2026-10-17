import {
  CapabilityHydrationProvider,
  GlobalProvider,
  useCapabilityHydration,
} from '@repo/core/logic';
import ErrorBoundary from '@repo/ui/components/ErrorBoundary';
import LotusPetalFAB from '@repo/ui/components/LotusPetalFAB';
import { CircadianProvider, EnvironmentProvider, ExternalLinkProvider } from '@repo/ui/context';
import { FABProvider } from '@repo/ui/context/FABContext';
import { Box, PortalProvider, Pressable, Text } from '@repo/ui/primitives';
import { FeatureProvider, ToastProvider } from '@repo/ui/providers';
import { LayoutLoopSentinel, MascotProvider } from '@repo/ui';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppVersionGateOverlay } from '@/components/AppVersionGateOverlay';
import { handoffNativeSplashAfterCommit } from '@/boot/nativeSplashService';
import { AuthenticatedSyncService } from '@/entry/AuthenticatedSyncService';
import { AuthQueryCacheBoundary } from '@/entry/AuthQueryCacheBoundary';
import { fireflyMascotConfig } from '@/brand/mascotArtwork';
import { GuestPersistenceNotice } from '@/entry/GuestPersistenceNotice';
import { GuestLeaseBoundary } from '@/entry/GuestLeaseBoundary';
import { SessionRouteGate } from '@/entry/SessionRouteGate';
import { queryClient } from '@/lib/queryClient';
import { DeepLinkProvider } from '@/providers/DeepLinkProvider';

/**
 * The deliberately small route host for first paint.
 *
 * It only mounts after the critical runtime registration boundary succeeds.
 * Optional native services stay outside this route host so their failure cannot
 * turn a public launch into a blank surface.
 */
export function EntryShell() {
  useEffect(() => {
    console.log('[entry-shell] mounted');
    return handoffNativeSplashAfterCommit({
      onCommit: () => {
        console.log('[entry-shell] first frame committed; hiding native splash');
      },
      onError: (error: unknown) => {
        console.warn('[entry-shell] native splash handoff unavailable:', error);
      },
    });
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <ErrorBoundary name="EntryShell">
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <GlobalProvider>
              <EnvironmentProvider>
                <CircadianProvider>
                  <PortalProvider>
                    <ToastProvider>
                      <ExternalLinkProvider>
                        <DeepLinkProvider>
                          <AuthQueryCacheBoundary />
                          <FABProvider>
                            <MascotProvider config={fireflyMascotConfig}>
                              <LayoutLoopSentinel name="RootShell" style={styles.root}>
                                <Box className="flex-1 bg-phase-canvas">
                                  <AppVersionGateOverlay />
                                  <GuestLeaseBoundary>
                                    <GuestPersistenceNotice />
                                    <SessionRouteGate appServices={<AuthenticatedAppServices />}>
                                      <Stack screenOptions={{ headerShown: false }}>
                                      <Stack.Screen name="index" />
                                      <Stack.Screen name="welcome" />
                                      <Stack.Screen name="auth" />
                                      <Stack.Screen name="account-recovery" />
                                      <Stack.Screen name="onboarding" />
                                      <Stack.Screen name="public-form/[slug]" />
                                      <Stack.Screen name="(tabs)" />
                                      <Stack.Screen
                                        name="(modal)"
                                        options={{ presentation: 'modal' }}
                                      />
                                      </Stack>
                                    </SessionRouteGate>
                                  </GuestLeaseBoundary>
                                  <LotusPetalFAB />
                                </Box>
                              </LayoutLoopSentinel>
                            </MascotProvider>
                          </FABProvider>
                        </DeepLinkProvider>
                      </ExternalLinkProvider>
                    </ToastProvider>
                  </PortalProvider>
                </CircadianProvider>
              </EnvironmentProvider>
            </GlobalProvider>
          </QueryClientProvider>
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
        <AuthenticatedSyncService />
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
