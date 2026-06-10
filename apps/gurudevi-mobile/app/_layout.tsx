import 'react-native-url-polyfill/auto';
import '../src/i18n/config';
import '@azure/core-asynciterator-polyfill';
import '../src/shims/node-globals-shim';
import 'react-native-reanimated';
import 'react-native-worklets';
import 'react-native-get-random-values';
import '@repo/ui/global.css';

import {
  identifyUser,
  initPostHog,
  posthogAnalytics as initTracker,
  trackEvent,
} from '@repo/analytics';
import { GlobalProvider, coreRuntime, pushNotification, useAuth, useStore } from '@repo/core/logic';
import { clearSentryUser, initSentry, injectPostHog, setSentryUser } from '@repo/core/monitoring';
import { bootstrapPlatform, storage } from '@repo/core/native';
import { usePermissionStore } from '@repo/core/store/usePermissionStore';
import { SyncManager } from '@repo/core/sync';
import { useQRDeepLink } from '@repo/scanner-kit';
import ErrorBoundary from '@repo/ui/components/ErrorBoundary';
import NetworkStatusBanner from '@repo/ui/components/NetworkStatusBanner';
import { SanctuaryGlobalStyles } from '@repo/ui/components/SanctuaryGlobalStyles';
import SanctuaryToast from '@repo/ui/components/SanctuaryToast';
import { EnvironmentProvider, ExternalLinkProvider } from '@repo/ui/context';
import { FABProvider } from '@repo/ui/context/FABContext';
import { GluestackUIProvider } from '@repo/ui/gluestack';
import { Box, Center, Spinner } from '@repo/ui/primitives';
import { ToastProvider } from '@repo/ui/providers';
import { sanctuarySaffron } from '@repo/ui/theme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, usePathname, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet as CSSStyleSheet, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PWAInstallBanner } from '../src/components/web/PWAInstallBanner';
import { fontAssets } from '../src/constants/Fonts';
import { registerBackgroundSync } from '../src/lib/backgroundSync';
import {
  dispatchQueuedMutationToSovereignBus,
  installMobileWorkflowEventBridge,
} from '../src/lib/inngestEvents';
import { LanguageUtils } from '../src/utils/LanguageUtils';

if (
  Platform.OS !== 'web' &&
  'setFlag' in CSSStyleSheet &&
  typeof CSSStyleSheet.setFlag === 'function'
) {
  CSSStyleSheet.setFlag('darkMode', 'class');
}

const queryClient = new QueryClient();

function FullScreenFallback() {
  return (
    <Center className="flex-1 bg-obsidian">
      <Spinner color={sanctuarySaffron} />
    </Center>
  );
}

function BootstrapSideEffects() {
  const currentUser = useStore((state) => state.user);

  useEffect(() => {
    injectPostHog(initTracker);
    initSentry();

    const posthogApiKey = process.env.EXPO_PUBLIC_POSTHOG_API_KEY;
    const posthogEnabled = process.env.EXPO_PUBLIC_POSTHOG_ENABLED !== 'false';
    if (posthogApiKey && posthogEnabled) {
      const posthogHost = process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com';
      void initPostHog(posthogApiKey, { host: posthogHost }).then(() => {
        trackEvent('app_initialized', { platform: Platform.OS });
      });
    }

    void bootstrapPlatform().then(() => {
      installMobileWorkflowEventBridge();
      void registerBackgroundSync();
    });

    void LanguageUtils.init();
  }, []);

  useEffect(() => {
    if (!currentUser?.id) {
      clearSentryUser();
      return;
    }

    setSentryUser({
      id: currentUser.id,
      email: currentUser.email ?? undefined,
      username: currentUser.display_name ?? undefined,
    });

    identifyUser(currentUser.id, {
      email: currentUser.email ?? undefined,
      display_name: currentUser.display_name ?? undefined,
      capacity:
        (useStore.getState() as { activeBond?: { capacity?: string } }).activeBond?.capacity ??
        undefined,
      school_id: currentUser.school_id ?? undefined,
    });
  }, [currentUser?.display_name, currentUser?.email, currentUser?.id, currentUser?.school_id]);

  useEffect(() => {
    if (!currentUser?.id) return;

    const initPush = async () => {
      const deviceId =
        storage.getString('device_id') ||
        `dev_${globalThis.crypto?.randomUUID?.().replace(/-/g, '').slice(0, 12) ?? 'local'}`;
      if (!storage.contains('device_id')) {
        storage.set('device_id', deviceId);
      }

      await pushNotification.initialize(currentUser.id, deviceId);
    };

    void initPush();
  }, [currentUser?.id]);

  return null;
}

function RootShell() {
  const router = useRouter();
  const pathname = usePathname();
  const { session, loading, isProfileLoading } = useAuth();
  const onboardingCompleted = useStore((state) => state.onboardingCompleted);
  const toast = useStore((state) => state.toast);
  const hideToast = useStore((state) => state.hideToast);
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    void coreRuntime.asset.loadAsync(fontAssets).then(() => setFontsReady(true));
  }, []);

  useEffect(() => {
    if (loading || isProfileLoading || !fontsReady) return;

    if (!session) {
      if (
        pathname !== '/welcome' &&
        pathname !== '/auth' &&
        !pathname?.startsWith('/public-form')
      ) {
        router.replace('/welcome');
      }
      return;
    }

    if (!onboardingCompleted && pathname !== '/onboarding') {
      router.replace('/onboarding');
      return;
    }

    // Token-Based Access Control (TOBAC) Route Guard
    if (session?.expires_at) {
      const isExpired = session.expires_at < Date.now() / 1000;
      if (isExpired && pathname !== '/welcome' && pathname !== '/auth') {
        console.warn('[TOBAC ROUTE GUARD] Session token expired. Redirecting to /welcome');
        router.replace('/welcome');
        return;
      }
    }

    const activeBond = (useStore.getState() as any).activeBond;
    const activeCapacity = activeBond?.capacity || 'wanderer';
    const allowedStaffCapacities = [
      'principal',
      'assistantPrincipal',
      'teacher',
      'gradeHead',
      'sectionHead',
      'staff',
    ];
    const allowedCitizenCapacities = [...allowedStaffCapacities, 'student', 'guardian'];

    if (pathname?.startsWith('/workspace') && !allowedStaffCapacities.includes(activeCapacity)) {
      console.warn(
        `[TOBAC ROUTE GUARD] Denied routing to ${pathname} for capacity: ${activeCapacity}`,
      );
      router.replace('/self');
      return;
    }

    if (
      (pathname?.startsWith('/community') || pathname?.startsWith('/library')) &&
      !allowedCitizenCapacities.includes(activeCapacity)
    ) {
      console.warn(
        `[TOBAC ROUTE GUARD] Denied access to ${pathname} for non-citizen capacity: ${activeCapacity}`,
      );
      router.replace('/self');
      return;
    }

    if (pathname === '/' || pathname === '/welcome' || pathname === '/auth') {
      router.replace('/self');
    }
  }, [fontsReady, isProfileLoading, loading, onboardingCompleted, pathname, router, session]);

  const loadPermissions = usePermissionStore((state) => state.loadPermissions);

  useEffect(() => {
    if (session?.user?.id) {
      void loadPermissions(session.user.id);
    }
  }, [session?.user?.id, loadPermissions]);

  useQRDeepLink((payload: unknown) => {
    router.push({ pathname: '/qr', params: { payload: JSON.stringify(payload) } });
  });

  if (loading || !fontsReady) {
    return (
      <SafeAreaProvider>
        <GluestackUIProvider>
          <FullScreenFallback />
        </GluestackUIProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <ErrorBoundary name="Root Shell">
      <QueryClientProvider client={queryClient}>
        <EnvironmentProvider>
          <GlobalProvider>
            <GluestackUIProvider>
              <SanctuaryGlobalStyles />
              <FABProvider>
                <Box className="flex-1">
                  <ToastProvider>
                    <ExternalLinkProvider>
                      <SafeAreaProvider>
                        <BootstrapSideEffects />
                        <Stack screenOptions={{ headerShown: false }}>
                          <Stack.Screen name="index" options={{ title: 'Welcome' }} />
                          <Stack.Screen name="welcome" options={{ title: 'Welcome' }} />
                          <Stack.Screen name="auth" options={{ title: 'Sign In' }} />
                          <Stack.Screen name="onboarding" options={{ title: 'Getting Started' }} />
                          <Stack.Screen name="self" options={{ title: 'Self' }} />
                          <Stack.Screen name="community" options={{ title: 'Community' }} />
                          <Stack.Screen name="workspace" options={{ title: 'Workspace' }} />
                          <Stack.Screen name="library" options={{ title: 'Library' }} />
                          <Stack.Screen name="profile" options={{ title: 'Profile' }} />
                          <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
                          <Stack.Screen name="settings" options={{ title: 'Settings' }} />
                          <Stack.Screen
                            name="invitation-welcome"
                            options={{ presentation: 'modal' }}
                          />
                          <Stack.Screen name="qr" options={{ title: 'QR Scan' }} />
                          <Stack.Screen
                            name="thuthimal-claim"
                            options={{ title: 'Thuthimal Badge' }}
                          />
                          <Stack.Screen name="public-form/[slug]" options={{ title: 'Form' }} />
                        </Stack>
                        <SyncManager
                          dispatchQueuedMutation={dispatchQueuedMutationToSovereignBus}
                        />
                        <NetworkStatusBanner />
                        {Platform.OS === 'web' && <PWAInstallBanner />}
                        {toast && (
                          <SanctuaryToast
                            visible={!!toast}
                            message={toast.message}
                            type={toast.type}
                            duration={toast.duration}
                            onHide={hideToast}
                          />
                        )}
                      </SafeAreaProvider>
                    </ExternalLinkProvider>
                  </ToastProvider>
                </Box>
              </FABProvider>
            </GluestackUIProvider>
          </GlobalProvider>
        </EnvironmentProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default RootShell;
