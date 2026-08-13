import 'react-native-url-polyfill/auto';
import '../src/i18n/config';
import '@azure/core-asynciterator-polyfill';
import '../src/shims/node-globals-shim';
import 'react-native-reanimated';
import 'react-native-worklets';
import 'react-native-get-random-values';
import '@repo/ui/global.css';

import { initPostHog, posthogAnalytics as initTracker } from '@repo/analytics/telemetry';
import {
  disconnectPowerSync as clearPowerSync,
  usePolicyVersionInvalidation,
} from '@repo/core/adapters/powersync';
import { refreshPermissionSnapshotOnServer } from '@repo/core/api/authorization';
import {
  accountPin,
  coreRuntime,
  GlobalProvider,
  getAuthRouteTarget,
  getSessionIdentityMode,
  pushNotification,
  useAuth,
  useConsentStore,
  useStore,
} from '@repo/core/logic';
import { warmCedarWasm } from '@repo/core/logic/permissions/cedarClientEvaluator';
import {
  clearSentryUser,
  identifyUser,
  initSentry,
  injectPostHog,
  optOutTelemetry,
  setSentryUser,
  trackProductEvent,
} from '@repo/core/monitoring';
import { bootstrapPlatform, storage } from '@repo/core/native';
import { useCedarDecisionStore } from '@repo/core/store/useCedarDecisionStore';
import { useEntitlementStore } from '@repo/core/store/useEntitlementStore';
import { useFeatureStore } from '@repo/core/store/useFeatureStore';
import { SyncManager } from '@repo/core/sync';
import { useQRDeepLink } from '@repo/scanner-kit';
import { AccountPinModal } from '@repo/ui/components';
import ErrorBoundary from '@repo/ui/components/ErrorBoundary';
import NetworkStatusBanner from '@repo/ui/components/NetworkStatusBanner';
import { SanctuaryGlobalStyles } from '@repo/ui/components/SanctuaryGlobalStyles';
import SanctuaryToast from '@repo/ui/components/SanctuaryToast';
import { EnvironmentProvider, ExternalLinkProvider } from '@repo/ui/context';
import { FABProvider } from '@repo/ui/context/FABContext';
import { GluestackUIProvider } from '@repo/ui/gluestack';
import { Shield } from '@repo/ui/icons';
import { Box, Center, Spinner } from '@repo/ui/primitives';
import { BrandPulse } from '@repo/ui';
import { ToastProvider } from '@repo/ui/providers';
import { FeatureProvider } from '@repo/ui/providers/FeatureProvider';
import { sanctuarySaffron } from '@repo/ui/theme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as LocalAuthentication from 'expo-local-authentication';
import { usePathname, useRouter } from 'expo-router';
import { Stack } from 'expo-router/stack';
import * as ScreenCapture from 'expo-screen-capture';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useState } from 'react';
import {
  AppState,
  AppStateStatus,
  StyleSheet as CSSStyleSheet,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { registerAppCatalog } from '@/boot/registerAppCatalog';
import PDPAConsentModal from '@/components/PDPAConsentModal';
import { PWAInstallBanner } from '@/components/web/PWAInstallBanner';
import { fontAssets } from '@/constants/Fonts';
import { registerBackgroundSync } from '@/lib/backgroundSync';
import { configureGoogleOneTap } from '@/lib/googleSignIn';
import {
  dispatchQueuedMutationToSovereignBus,
  installMobileWorkflowEventBridge,
} from '@/lib/inngestEvents';
import { LanguageUtils } from '@/utils/LanguageUtils';
import { PowerSyncProvider } from '@/providers/PowerSyncProvider';

registerAppCatalog();

void SplashScreen.preventAutoHideAsync().catch(() => {
  // Native splash is best-effort; the in-app fallback covers slow boots.
});

if (
  Platform.OS !== 'web' &&
  'setFlag' in CSSStyleSheet &&
  typeof CSSStyleSheet.setFlag === 'function'
) {
  CSSStyleSheet.setFlag('darkMode', 'class');
}

const queryClient = new QueryClient();

// Inject the platform analytics adapter before any auth/bootstrap effects run.
// This prevents the core bridge from observing an uninitialized PostHog instance
// during the first render cycle.
injectPostHog(initTracker);

// Configure native Google One-Tap / Credential Manager before any sign-in
// attempt. No-op on web and when the client IDs are unset.
configureGoogleOneTap();

function FullScreenFallback() {
  return (
    <Center className="flex-1 bg-obsidian">
      <BrandPulse size={28} tintColor="#D4843A" />
    </Center>
  );
}

function BootstrapSideEffects() {
  const currentUser = useStore((state) => state.user);
  const analyticsEnabled = useFeatureStore((state) => state.flags.isAnalyticsEnabled);
  const { hasDecidedConsent, analyticsConsentGranted } = useConsentStore();

  useEffect(() => {
    // Revocation check: if consent has been decided, but it is false
    if (hasDecidedConsent && !analyticsConsentGranted) {
      optOutTelemetry();
      clearSentryUser();

      // Perform database and cache cleanup under PDPA erasure requirement
      void (async () => {
        try {
          await clearPowerSync();
          storage.clearAll();
        } catch (e) {
          console.error('[PDPA Compliance] Failed to clear local data:', e);
        }
      })();
      return;
    }

    if (!hasDecidedConsent || !analyticsConsentGranted) {
      return;
    }

    initSentry();

    const posthogApiKey = process.env.EXPO_PUBLIC_POSTHOG_API_KEY;
    const posthogEnabled = process.env.EXPO_PUBLIC_POSTHOG_ENABLED !== 'false';
    if (posthogApiKey && posthogEnabled && analyticsEnabled) {
      const posthogHost = process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com';
      void initPostHog(posthogApiKey, { host: posthogHost }).then(() => {
        trackProductEvent('app_started', undefined, {
          platform:
            Platform.OS === 'ios' || Platform.OS === 'android' || Platform.OS === 'web'
              ? Platform.OS
              : 'unknown',
        });
      });
    }
  }, [analyticsEnabled, hasDecidedConsent, analyticsConsentGranted]);

  useEffect(() => {
    // Only set Sentry user profile if consent is granted
    if (!hasDecidedConsent || !analyticsConsentGranted || !currentUser?.id) {
      clearSentryUser();
      return;
    }

    setSentryUser({
      id: currentUser.id,
      email: currentUser.email ?? undefined,
      username: currentUser.display_name ?? undefined,
    });

    identifyUser(currentUser.id);
  }, [
    currentUser?.display_name,
    currentUser?.email,
    currentUser?.id,
    currentUser?.school_id,
    hasDecidedConsent,
    analyticsConsentGranted,
  ]);

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

function AppContent() {
  const router = useRouter();
  const pathname = usePathname();
  const { session, loading, isProfileLoading } = useAuth();
  const onboardingCompleted = useStore((state) => state.onboardingCompleted);
  const hasActiveCapacity = useStore((state) => Boolean(state.activeBond?.capacity));
  const activeBond = useStore((state) => state.activeBond);
  const activeBondScopeId = useStore((state) => state.activeBond?.id ?? null);
  const clearCedarDecisions = useCedarDecisionStore((state) => state.clearDecisions);
  usePolicyVersionInvalidation(clearCedarDecisions);
  const { hasDecidedConsent } = useConsentStore();
  const toast = useStore((state) => state.toast);
  const hideToast = useStore((state) => state.hideToast);
  const [fontsReady, setFontsReady] = useState(() => !coreRuntime.isRegistered());

  const [lockState, setLockState] = useState(() => ({
    isUnlocked: Platform.OS === 'web' || !storage.getBoolean('require_biometrics'),
    hasPinCode: false,
    showPinUnlock: false,
  }));
  const { isUnlocked, hasPinCode, showPinUnlock } = lockState;
  const bootstrapReady = !loading && !isProfileLoading && fontsReady;
  const sessionMode = getSessionIdentityMode(session);
  const routeTarget = getAuthRouteTarget({
    pathname,
    bootstrapReady,
    sessionMode,
    onboardingCompleted,
    hasActiveCapacity,
    hasSession: !!session,
  });

  const setIsUnlocked = useCallback(
    (val: boolean) => setLockState((prev) => ({ ...prev, isUnlocked: val })),
    [],
  );
  const setHasPinCode = useCallback(
    (val: boolean) => setLockState((prev) => ({ ...prev, hasPinCode: val })),
    [],
  );
  const setShowPinUnlock = useCallback(
    (val: boolean) => setLockState((prev) => ({ ...prev, showPinUnlock: val })),
    [],
  );

  useEffect(() => {
    const checkUserPin = async () => {
      if (session?.user?.id) {
        const pinExists = await accountPin.hasPin(session.user.id);
        setHasPinCode(pinExists);
      } else {
        setHasPinCode(false);
      }
    };
    void checkUserPin();
  }, [session?.user?.id, setHasPinCode]);

  const userId = session?.user?.id;
  const handlePinUnlockSubmit = async (values: any) => {
    if (!userId) return;
    const correct = await accountPin.verifyPin(userId, values.pin);
    if (correct) {
      setIsUnlocked(true);
      setShowPinUnlock(false);
    } else {
      throw new Error('Incorrect PIN code. Please try again.');
    }
  };

  const authenticateBiometrics = useCallback(async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (hasHardware && isEnrolled) {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Unlock Gurudevi Mobile',
          fallbackLabel: 'Use Passcode',
        });
        if (result.success) {
          setIsUnlocked(true);
        }
      } else {
        setIsUnlocked(true);
      }
    } catch (err) {
      console.warn('Biometric auth error:', err);
      setIsUnlocked(true);
    }
  }, [setIsUnlocked]);

  useEffect(() => {
    if (Platform.OS === 'web') return;

    if (storage.getBoolean('require_biometrics')) {
      setTimeout(() => {
        void authenticateBiometrics();
      }, 0);
    }

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && storage.getBoolean('require_biometrics')) {
        setIsUnlocked(false);
        void authenticateBiometrics();
      }
    };
    const appStateSub = AppState.addEventListener('change', handleAppStateChange);

    if (storage.getBoolean('prevent_screen_capture')) {
      void ScreenCapture.preventScreenCaptureAsync();
    }

    return () => {
      appStateSub.remove();
    };
  }, [authenticateBiometrics, setIsUnlocked]);

  useEffect(() => {
    if (!coreRuntime.isRegistered()) {
      return;
    }

    let cancelled = false;
    const timeout = setTimeout(() => {
      if (!cancelled) {
        console.warn('[font bootstrap] timed out, rendering app without waiting longer');
        setFontsReady(true);
      }
    }, 8000);

    void coreRuntime.asset
      .loadAsync(fontAssets)
      .catch((error) => {
        console.warn('[font bootstrap] continuing with fallback fonts', error);
      })
      .finally(() => {
        clearTimeout(timeout);
        if (!cancelled) {
          setFontsReady(true);
        }
      });

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (!bootstrapReady) return;

    // Token-Based Access Control (TOBAC) Route Guard
    if (session?.expires_at) {
      // eslint-disable-next-line no-restricted-syntax
      const isExpired = session.expires_at < Date.now() / 1000;
      if (isExpired && pathname !== '/welcome' && pathname !== '/auth') {
        console.warn('[TOBAC ROUTE GUARD] Session token expired. Redirecting to /welcome');
        router.replace('/welcome');
        return;
      }
    }

    if (routeTarget.redirectTo && pathname !== routeTarget.redirectTo) {
      router.replace(routeTarget.redirectTo);
    }
  }, [bootstrapReady, pathname, routeTarget.redirectTo, router, session, onboardingCompleted]);

  useEffect(() => {
    if (!bootstrapReady) return;

    void SplashScreen.hideAsync().catch((error) => {
      console.warn('[splash] hideAsync failed, continuing anyway', error);
    });
  }, [bootstrapReady]);

  const loadDecisions = useCedarDecisionStore((state) => state.loadDecisions);
  const loadEntitlements = useEntitlementStore((state) => state.loadEntitlements);

  useEffect(() => {
    if (!coreRuntime.isRegistered()) return;

    // Warm Cedar WASM singleton at boot per D4 Section 1
    void warmCedarWasm();

    if (session?.user?.is_anonymous) {
      // Anonymous guests have a Supabase auth identity for conversion and
      // measurement, but no durable Cedar or commercial entitlement scope.
      useEntitlementStore.getState().clearEntitlements();
      useCedarDecisionStore.getState().clearDecisions();
    } else if (session?.user?.id) {
      void loadDecisions(session.user.id, activeBondScopeId);
      void loadEntitlements(session.user.id, {
        activeBondId: activeBondScopeId,
        activeEntityId: activeBond?.entity_id ?? null,
        activeEntityType: activeBond?.entity_type ?? null,
      });
      if (activeBondScopeId) {
        // Refresh is best-effort for offline-first startup. The local Cedar
        // evaluator continues using only a verified last-known-good snapshot.
        void refreshPermissionSnapshotOnServer().catch((error) => {
          console.warn('[authorization] snapshot refresh deferred:', error);
        });
      }
    }
  }, [
    session?.user?.id,
    session?.user?.is_anonymous,
    activeBond,
    activeBondScopeId,
    loadDecisions,
    loadEntitlements,
  ]);

  useQRDeepLink((payload: unknown) => {
    router.push({ pathname: '/qr', params: { payload: JSON.stringify(payload) } });
  });

  if (!bootstrapReady) {
    return (
      <SafeAreaProvider>
        <GluestackUIProvider>
          <FullScreenFallback />
        </GluestackUIProvider>
      </SafeAreaProvider>
    );
  }

  if (!isUnlocked) {
    return (
      <SafeAreaProvider>
        <GluestackUIProvider>
          <Center className="flex-1 bg-obsidian gap-6 p-6">
            <Center className="w-20 h-20 rounded-full bg-slate-900 border border-slate-800 items-center justify-center">
              <Shield size={40} color="#E0E7FF" />
            </Center>
            <View style={{ alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' }}>App Locked</Text>
              <Text style={{ fontSize: 14, color: '#94A3B8', textAlign: 'center' }}>
                Gurudevi Mobile is locked. Authenticate to proceed.
              </Text>
            </View>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => {
                void authenticateBiometrics();
              }}
              style={{
                backgroundColor: '#D4843A',
                paddingVertical: 12,
                paddingHorizontal: 24,
                borderRadius: 12,
                marginTop: 16,
              }}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 }}>Unlock App</Text>
            </TouchableOpacity>

            {hasPinCode && (
              <TouchableOpacity
                accessibilityRole="button"
                onPress={() => setShowPinUnlock(true)}
                style={{ marginTop: 8 }}
              >
                <Text style={{ color: '#D4843A', fontWeight: 'bold', fontSize: 14 }}>
                  Enter PIN instead
                </Text>
              </TouchableOpacity>
            )}

            {showPinUnlock && (
              <AccountPinModal
                isOpen={showPinUnlock}
                mode="verify"
                onClose={() => setShowPinUnlock(false)}
                onSubmit={handlePinUnlockSubmit}
                accountLabel={session?.user?.email}
                allowClose={true}
              />
            )}
          </Center>
        </GluestackUIProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <ErrorBoundary name="Root Shell">
      <GluestackUIProvider>
        <SanctuaryGlobalStyles />
        <FABProvider>
          <Box className="flex-1">
            <ToastProvider>
              <ExternalLinkProvider>
                <SafeAreaProvider>
                  <BootstrapSideEffects />
                  <FeatureProvider>
                    <Stack screenOptions={{ headerShown: false }}>
                      <Stack.Screen name="index" options={{ title: 'Welcome' }} />
                      <Stack.Screen name="welcome" options={{ title: 'Welcome' }} />
                      <Stack.Screen name="auth" options={{ title: 'Sign In' }} />
                      <Stack.Screen name="onboarding" options={{ title: 'Getting Started' }} />
                      <Stack.Screen name="invitation-welcome" options={{ presentation: 'modal' }} />
                      <Stack.Screen name="qr" options={{ title: 'QR Scan' }} />
                      <Stack.Screen name="thuthimal-claim" options={{ title: 'Thuthimal Badge' }} />
                      <Stack.Screen name="public-form/[slug]" options={{ title: 'Form' }} />
                    </Stack>
                  </FeatureProvider>
                  <SyncManager dispatchQueuedMutation={dispatchQueuedMutationToSovereignBus} />
                  <NetworkStatusBanner />
                  <PDPAConsentModal isOpen={!hasDecidedConsent} onClose={() => {}} />
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
    </ErrorBoundary>
  );
}

function RootShell() {
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void bootstrapPlatform()
      .then(() => {
        if (!coreRuntime.isRegistered()) {
          throw new Error('Core runtime failed to register during platform bootstrap.');
        }
        installMobileWorkflowEventBridge();
        void registerBackgroundSync();
        if (!cancelled) setBootstrapped(true);
      })
      .catch((error) => {
        console.warn('[bootstrapPlatform] continuing with fallback startup', error);
        if (!cancelled) setBootstrapped(true);
      });

    void LanguageUtils.init().catch((error) => {
      console.warn('[LanguageUtils.init] continuing without language bootstrap', error);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GlobalProvider>
        {bootstrapped ? (
          <EnvironmentProvider>
            <PowerSyncProvider>
              <AppContent />
            </PowerSyncProvider>
          </EnvironmentProvider>
        ) : (
          <FullScreenFallback />
        )}
      </GlobalProvider>
    </QueryClientProvider>
  );
}

export default RootShell;
