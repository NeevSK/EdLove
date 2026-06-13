import 'react-native-url-polyfill/auto';
import { Platform } from 'react-native';
import { StyleSheet as CSSStyleSheet } from 'react-native-css-interop';

if (
  Platform.OS !== 'web' &&
  'setFlag' in CSSStyleSheet &&
  typeof (CSSStyleSheet as any).setFlag === 'function'
) {
  (CSSStyleSheet as any).setFlag('darkMode', 'class');
}
import './src/i18n/config'; // Initialize i18n
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Lazy load Admin screens to break circularity and improve startup
const AdminAuditLog = lazy(() => import('@repo/admin/screens/AdminAuditLog'));
const AdminAuthorityRepair = lazy(() => import('@repo/admin/screens/AdminAuthorityRepair'));
const AdminDashboard = lazy(() => import('@repo/admin/screens/AdminDashboard'));
const AdminIncidentQueue = lazy(() => import('@repo/admin/screens/AdminIncidentQueue'));
const AdminJobControl = lazy(() => import('@repo/admin/screens/AdminJobControl'));
const AdminReleaseControl = lazy(() => import('@repo/admin/screens/AdminReleaseControl'));
const AdminTenantDetail = lazy(() => import('@repo/admin/screens/AdminTenantDetail'));

import {
  identifyUser,
  initPostHog,
  posthogAnalytics as initTracker,
  trackEvent,
} from '@repo/analytics';
import {
  coreRuntime,
  deepLink,
  GlobalProvider,
  pushNotification,
  useAuth,
  useStore,
} from '@repo/core/logic';
import { clearSentryUser, initSentry, injectPostHog, setSentryUser } from '@repo/core/monitoring';
import { storage } from '@repo/core/native';
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
import { OnboardingWrapper } from '@repo/ui/screens/OnboardingWrapper';
import { sanctuarySaffron } from '@repo/ui/theme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import CommandPalette from './src/components/web/CommandPalette';
import { PWAInstallBanner } from './src/components/web/PWAInstallBanner';
import { fontAssets } from './src/constants/Fonts';
import { navigationRef } from './src/navigation/navigationRef';
// Import screens and navigation
import TabNavigator from './src/navigation/TabNavigator';
import { useAppEntryGate } from './src/navigation/useAppEntryGate';

// Import screens and navigation from the local authoritative index
// Lazy load app-level screens from direct paths (No Barrel Exports)
const AIAssistantScreen = lazy(() =>
  import('@repo/ai').then((m) => ({ default: m.AIAssistantScreen })),
);
const AuthScreen = lazy(() => import('./src/screens/AuthScreen'));
const InvitationWelcomeScreen = lazy(() =>
  import('@repo/community').then((m) => ({
    default: m.InvitationWelcomeScreen,
  })),
);
const QRHandlerScreen = lazy(() =>
  import('@repo/scanner-kit').then((m) => ({ default: m.QRHandlerScreen })),
);
const ThuthimalClaimScreen = lazy(() =>
  import('@repo/profile').then((m) => ({ default: m.ThuthimalClaimScreen })),
);
const WelcomeScreen = lazy(() => import('@repo/ui/screens/WelcomeScreen'));

import { LanguageUtils } from './src/utils/LanguageUtils';
import { updateWebPageTitle } from './src/utils/useWebPageTitle';

// Lazy load PublicFormScreen as it's web-only and large
const PublicFormScreen = lazy(() =>
  import('@repo/form-builder').then((module) => ({
    default: module.PublicFormScreenWeb,
  })),
);

import {
  dispatchQueuedMutationToSovereignBus,
  installMobileWorkflowEventBridge,
} from './src/lib/inngestEvents';

// Create a client
const queryClient = new QueryClient();

installMobileWorkflowEventBridge();

// Root Stack for Modals
const RootStack = createNativeStackNavigator();

function FullScreenFallback() {
  return (
    <Center className="flex-1 bg-obsidian">
      <Spinner color={sanctuarySaffron} />
    </Center>
  );
}

function WelcomeRouteScreen() {
  const handleLogin = useCallback(() => {
    if (navigationRef.isReady()) {
      navigationRef.navigate('Auth' as never);
    }
  }, []);

  const handleGuest = useCallback(() => {
    if (navigationRef.isReady()) {
      navigationRef.navigate('Onboarding' as never);
    }
  }, []);

  return (
    <ErrorBoundary name="Welcome Screen">
      <Suspense fallback={<FullScreenFallback />}>
        <WelcomeScreen onLogin={handleLogin} onGuest={handleGuest} />
      </Suspense>
    </ErrorBoundary>
  );
}

function AuthRouteScreen() {
  const navigation = useNavigation<{ goBack: () => void }>();

  const handleSuccess = useCallback(() => {
    if (navigationRef.isReady()) {
      navigationRef.navigate('Onboarding' as never);
    }
  }, []);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <Suspense fallback={<FullScreenFallback />}>
      <AuthScreen onSuccess={handleSuccess} onBack={handleBack} />
    </Suspense>
  );
}

function OnboardingRouteScreen() {
  return (
    <ErrorBoundary name="Onboarding Screen">
      <Suspense fallback={<FullScreenFallback />}>
        <OnboardingWrapper />
      </Suspense>
    </ErrorBoundary>
  );
}

function MainTabsRouteScreen() {
  return (
    <ErrorBoundary name="Main Tabs">
      <TabNavigator />
    </ErrorBoundary>
  );
}

function AdminDashboardRouteScreen() {
  return (
    <Suspense fallback={<FullScreenFallback />}>
      <AdminDashboard />
    </Suspense>
  );
}

function InvitationRouteScreen() {
  return (
    <Suspense fallback={<FullScreenFallback />}>
      <InvitationWelcomeScreen />
    </Suspense>
  );
}

function PublicFormRouteScreen() {
  return (
    <Suspense
      fallback={
        <Center className="flex-1">
          <Spinner />
        </Center>
      }
    >
      <PublicFormScreen />
    </Suspense>
  );
}

function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const currentUser = useStore((state) => state.user);
  const toast = useStore((state) => state.toast);
  const hideToast = useStore((state) => state.hideToast);

  useEffect(() => {
    // Telemetry + asset loading run after the app shell is mounted.
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

    // Asset loading is intentionally late: it depends on the runtime being ready,
    // but not on the bootstrap sequence owning the React tree.
    void coreRuntime.asset.loadAsync(fontAssets).then(() => {
      setFontsLoaded(true);
    });
  }, []);

  useEffect(() => {
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
  }, [currentUser?.id, currentUser?.email, currentUser?.display_name, currentUser?.school_id]);

  useEffect(() => {
    if (!currentUser?.id) return;

    // Initialize Push Notifications
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

  useEffect(() => {
    if (Platform.OS === 'web') return;
    // Removed legacy deep link handler in favor of DeepLinkProvider
  }, []);

  useQRDeepLink((payload: unknown) => {
    if (navigationRef.isReady()) {
      navigationRef.navigate('QRHandler', { payload });
    }
  });

  if (!fontsLoaded) {
    return (
      <SafeAreaProvider>
        <GluestackUIProvider>
          <FullScreenFallback />
        </GluestackUIProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <ErrorBoundary name="Absolute Root">
      <QueryClientProvider client={queryClient}>
        <EnvironmentProvider>
          <GlobalProvider>
            <GluestackUIProvider>
              <SanctuaryGlobalStyles />
              <FABProvider>
                <Box className="flex-1">
                  <AppContent toast={toast} hideToast={hideToast} />
                </Box>
              </FABProvider>
            </GluestackUIProvider>
          </GlobalProvider>
        </EnvironmentProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

// Removed local OnboardingWrapper in favor of @repo/ui version

function AppContent({
  toast,
  hideToast,
}: {
  toast: {
    message: string;
    type: 'success' | 'error' | 'info';
    duration?: number;
  } | null;
  hideToast: () => void;
}) {
  const { session, loading, isProfileLoading } = useAuth();
  const onboardingCompleted = useStore((state) => state.onboardingCompleted);

  const WelcomeWrapper = WelcomeRouteScreen;

  // ✅ 2026 Sovereign Pattern: Stabilize screen components to prevent re-mount loops
  const AuthWrapper = AuthRouteScreen;

  const OnboardingWrapperComponent = OnboardingRouteScreen;

  const MainWrapper = MainTabsRouteScreen;

  const AdminDashboardWrapper = AdminDashboardRouteScreen;

  const InvitationWrapper = InvitationRouteScreen;

  const PublicFormWrapper = PublicFormRouteScreen;

  useAppEntryGate({
    navigationRef,
    session,
    isProfileLoading,
    onboardingCompleted,
  });

  const handleNavigationReady = useCallback(() => {
    if (navigationRef.isReady()) {
      updateWebPageTitle(navigationRef.current?.getRootState());
    }
  }, []);

  const handleNavigationStateChange = useCallback((state: any) => {
    updateWebPageTitle(state);
  }, []);

  if (loading) {
    return <FullScreenFallback />;
  }

  return (
    <SafeAreaProvider>
      <ToastProvider>
        <ExternalLinkProvider>
          <ErrorBoundary name="App Root">
            <NavigationContainer
              ref={navigationRef}
              onReady={handleNavigationReady}
              onStateChange={handleNavigationStateChange}
              linking={{
                prefixes: deepLink.getPrefixes(),
                config: deepLink.getNavigationConfig(),
              }}
            >
              <RootStack.Navigator
                id="RootStack"
                screenOptions={{ headerShown: false }}
                initialRouteName="Welcome"
              >
                <RootStack.Screen name="Welcome" component={WelcomeWrapper} />
                <RootStack.Screen
                  name="Auth"
                  options={{ presentation: 'card' }}
                  component={AuthWrapper}
                />
                <RootStack.Screen name="Onboarding" component={OnboardingWrapperComponent} />
                <RootStack.Screen
                  name="InvitationWelcome"
                  options={{ presentation: 'modal' }}
                  component={InvitationWrapper}
                />
                <RootStack.Screen
                  name="PublicForm"
                  options={{ headerShown: false }}
                  component={PublicFormWrapper}
                />
                <RootStack.Screen name="Main" component={MainWrapper} />
                <RootStack.Screen name="AdminDashboard" component={AdminDashboardWrapper} />
                <RootStack.Screen name="AdminIncidentQueue">
                  {() => (
                    <Suspense
                      fallback={
                        <Center className="flex-1 bg-obsidian">
                          <Spinner />
                        </Center>
                      }
                    >
                      <AdminIncidentQueue />
                    </Suspense>
                  )}
                </RootStack.Screen>
                <RootStack.Screen name="AdminTenantDetail">
                  {() => (
                    <Suspense
                      fallback={
                        <Center className="flex-1 bg-obsidian">
                          <Spinner />
                        </Center>
                      }
                    >
                      <AdminTenantDetail />
                    </Suspense>
                  )}
                </RootStack.Screen>
                <RootStack.Screen name="AdminAuthorityRepair">
                  {() => (
                    <Suspense
                      fallback={
                        <Center className="flex-1 bg-obsidian">
                          <Spinner />
                        </Center>
                      }
                    >
                      <AdminAuthorityRepair />
                    </Suspense>
                  )}
                </RootStack.Screen>
                <RootStack.Screen name="AdminJobControl">
                  {() => (
                    <Suspense
                      fallback={
                        <Center className="flex-1 bg-obsidian">
                          <Spinner />
                        </Center>
                      }
                    >
                      <AdminJobControl />
                    </Suspense>
                  )}
                </RootStack.Screen>
                <RootStack.Screen name="AdminAuditLog">
                  {() => (
                    <Suspense
                      fallback={
                        <Center className="flex-1 bg-obsidian">
                          <Spinner />
                        </Center>
                      }
                    >
                      <AdminAuditLog />
                    </Suspense>
                  )}
                </RootStack.Screen>
                <RootStack.Screen name="AdminReleaseControl">
                  {() => (
                    <Suspense
                      fallback={
                        <Center className="flex-1 bg-obsidian">
                          <Spinner />
                        </Center>
                      }
                    >
                      <AdminReleaseControl />
                    </Suspense>
                  )}
                </RootStack.Screen>
                <RootStack.Screen name="AIAssistant">
                  {() => (
                    <Suspense
                      fallback={
                        <Center className="flex-1 bg-obsidian">
                          <Spinner />
                        </Center>
                      }
                    >
                      <AIAssistantScreen />
                    </Suspense>
                  )}
                </RootStack.Screen>
                <RootStack.Screen name="QRHandler">
                  {() => (
                    <Suspense
                      fallback={
                        <Center className="flex-1 bg-obsidian">
                          <Spinner />
                        </Center>
                      }
                    >
                      <QRHandlerScreen />
                    </Suspense>
                  )}
                </RootStack.Screen>
                <RootStack.Screen name="ThuthimalClaim">
                  {() => (
                    <Suspense
                      fallback={
                        <Center className="flex-1 bg-obsidian">
                          <Spinner />
                        </Center>
                      }
                    >
                      <ThuthimalClaimScreen />
                    </Suspense>
                  )}
                </RootStack.Screen>
              </RootStack.Navigator>
            </NavigationContainer>
            <SyncManager dispatchQueuedMutation={dispatchQueuedMutationToSovereignBus} />
            <NetworkStatusBanner />
            {Platform.OS === 'web' && <CommandPalette />}
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
          </ErrorBoundary>
        </ExternalLinkProvider>
      </ToastProvider>
    </SafeAreaProvider>
  );
}

export default App;
