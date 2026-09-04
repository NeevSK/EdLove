import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import ErrorBoundary from '@repo/ui/components/ErrorBoundary';
import { EnvironmentProvider, ExternalLinkProvider } from '@repo/ui/context';
import { Box } from '@repo/ui/primitives';
import { ToastProvider } from '@repo/ui/providers';
import { GlobalProvider } from '@repo/core/logic';

import { SessionRouteGate } from '@/entry/SessionRouteGate';

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
          <GlobalProvider>
            <EnvironmentProvider>
              <ToastProvider>
                <ExternalLinkProvider>
                  <Box className="flex-1 bg-background-0">
                    <SessionRouteGate>
                      <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="index" />
                    <Stack.Screen name="welcome" />
                    <Stack.Screen name="auth" />
                    <Stack.Screen name="account-recovery" />
                    <Stack.Screen name="onboarding" />
                    <Stack.Screen name="public-form/[slug]" />
                    <Stack.Screen name="(tabs)" />
                      </Stack>
                    </SessionRouteGate>
                  </Box>
                </ExternalLinkProvider>
              </ToastProvider>
            </EnvironmentProvider>
          </GlobalProvider>
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
