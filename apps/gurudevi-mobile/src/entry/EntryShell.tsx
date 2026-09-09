import { GlobalProvider } from '@repo/core/logic';
import ErrorBoundary from '@repo/ui/components/ErrorBoundary';
import LotusPetalFAB from '@repo/ui/components/LotusPetalFAB';
import { CircadianProvider, EnvironmentProvider, ExternalLinkProvider } from '@repo/ui/context';
import { FABProvider } from '@repo/ui/context/FABContext';
import { Box, PortalProvider } from '@repo/ui/primitives';
import { ToastProvider } from '@repo/ui/providers';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppVersionGateOverlay } from '@/components/AppVersionGateOverlay';
import { AuthenticatedSyncService } from '@/entry/AuthenticatedSyncService';
import { AuthQueryCacheBoundary } from '@/entry/AuthQueryCacheBoundary';
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
    const frame = requestAnimationFrame(() => {
      console.log('[entry-shell] first frame committed; hiding native splash');
      void SplashScreen.hideAsync();
    });

    return () => cancelAnimationFrame(frame);
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
                            <Box className="flex-1 bg-phase-canvas">
                              <AppVersionGateOverlay />
                              <SessionRouteGate>
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
                              <LotusPetalFAB />
                            </Box>
                          </FABProvider>
                          <AuthenticatedSyncService />
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

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
