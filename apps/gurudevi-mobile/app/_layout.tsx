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
  runStorageEvictionScheduler,
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
import { BrandPulse, softCrossfadeScale } from '@repo/ui';
import AccountPinModal from '@repo/ui/components/AccountPinModal';
import ErrorBoundary from '@repo/ui/components/ErrorBoundary';
import NetworkStatusBanner from '@repo/ui/components/NetworkStatusBanner';
import { SanctuaryGlobalStyles } from '@repo/ui/components/SanctuaryGlobalStyles';
import SanctuaryToast from '@repo/ui/components/SanctuaryToast';
import { EnvironmentProvider, ExternalLinkProvider } from '@repo/ui/context';
import { FABProvider } from '@repo/ui/context/FABContext';
import { GluestackUIProvider } from '@repo/ui/gluestack';
import { Shield } from '@repo/ui/icons';
import { Box, Center } from '@repo/ui/primitives';
import { ToastProvider } from '@repo/ui/providers';
import { FeatureProvider } from '@repo/ui/providers/FeatureProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as LocalAuthentication from 'expo-local-authentication';
import { Observe, ObserveErrorBoundary, ObserveInteractiveMarker, ObserveRoot } from 'expo-observe';
import { Stack, usePathname, useRouter } from 'expo-router';
import * as ScreenCapture from 'expo-screen-capture';
import * as SplashScreen from 'expo-splash-screen';
import { installGlobalErrorHandlers } from '../src/lib/globalErrorHandlers';
import { PushNotificationProvider } from '../src/providers/PushNotificationProvider';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
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
import { scheduleNativeSplashHandoff } from '@/boot/nativeSplashHandoff';
import {
  getSessionRouteReadiness,
  hasUsableOfflineCapabilitySnapshot,
} from '@/boot/sessionRouteReadiness';
import { completeEssentialStartup } from '@/boot/startupCoordinator';
import PDPAConsentModal from '@/components/PDPAConsentModal';
import { PWAInstallBanner } from '@/components/web/PWAInstallBanner';
import { fontAssets } from '@/constants/Fonts';
import {
  dispatchQueuedMutationToSovereignBus,
  installMobileWorkflowEventBridge,
} from '@/lib/inngestEvents';
import { DeepLinkProvider } from '@/providers/DeepLinkProvider';

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

type BootState =
  | { phase: 'registering-runtime' }
  | { phase: 'ready' }
  | { phase: 'failed'; error: Error };

function FullScreenFallback({ error, onRetry }: { error?: Error; onRetry?: () => void }) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
        backgroundColor: '#0F131C',
      }}
    >
      <BrandPulse size={28} tintColor="#D4843A" accessibilityLabel="Preparing Gurudevi" />
      <Text style={{ marginTop: 16, textAlign: 'center', fontSize: 14, color: '#F5EDD6' }}>
        {error ? 'Gurudevi could not finish starting.' : 'Preparing your sanctuary…'}
      </Text>
      {error && (
        <>
          <Text style={{ marginTop: 8, textAlign: 'center', fontSize: 12, color: '#B7C0D1' }}>
            {error.message}
          </Text>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={onRetry}
            style={{
              backgroundColor: '#D4843A',
              borderRadius: 12,
              marginTop: 20,
              paddingHorizontal: 20,
              paddingVertical: 12,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Try again</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

function BootstrapSideEffects() {
  const currentUser = useStore((state) => state.user);
  const analyticsEnabled = useFeatureStore((state) => state.flags.isAnalyticsEnabled);
  const hasDecidedConsent = useConsentStore((state) => state.hasDecidedConsent);
  const analyticsConsentGranted = useConsentStore((state) => state.analyticsConsentGranted);

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

    // Defer heavy telemetry init off TTI — Observe stays immediate for perf truth,
    // Sentry/PostHog wait for idle after markInteractive (saves 80-150ms on cold start).
    // Keep globalErrorHandlers (app/_layout.tsx:624) for immediate crash capture.
    const idle =
      (globalThis as unknown as { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number })
        .requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 1500) as unknown as number);
    const cancelIdle =
      (globalThis as unknown as { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback ??
      ((id: number) => clearTimeout(id as unknown as NodeJS.Timeout));

    const idleId = idle(() => {
      try {
        initSentry();
      } catch (e) {
        console.warn('[Sentry] deferred init failed:', e);
      }

      const posthogApiKey = process.env.EXPO_PUBLIC_POSTHOG_API_KEY;
      const posthogEnabled = process.env.EXPO_PUBLIC_POSTHOG_ENABLED !== 'false';
      if (posthogApiKey && posthogEnabled && analyticsEnabled) {
        const posthogHost = process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com';
        void initPostHog(posthogApiKey, { host: posthogHost })
          .then(() => {
            trackProductEvent('app_started', undefined, {
              platform:
                Platform.OS === 'ios' || Platform.OS === 'android' || Platform.OS === 'web'
                  ? Platform.OS
                  : 'unknown',
            });
          })
          .catch((e) => console.warn('[PostHog] deferred init failed:', e));
      }
    });

    return () => {
      try {
        cancelIdle(idleId);
      } catch {}
    };
  }, [analyticsEnabled, hasDecidedConsent, analyticsConsentGranted]);

  useEffect(() => {
    // Expo Observe — TTI/TTR + per-route, OTel-native, production truth for T1/T3 (see EXPO_OBSERVE_RUNBOOK.md)
    // Keep dispatchingEnabled true for perf data (not PII); consent gates PostHog/Sentry only.
    try {
      Observe.configure({
        environment: process.env.EXPO_PUBLIC_APP_ENV ?? process.env.NODE_ENV ?? 'production',
        sampleRate: 0.2,
        dispatchInDebug: false,
        dispatchingEnabled: true,
        integrations: { expoRouter: true },
      });
    } catch (e) {
      console.warn('[Observe] configure failed:', e);
    }
  }, []);

  // Run storage eviction scheduler once on app foreground (after consent is established).
  // This reclaims SQLite file size and MMKV storage for low-device constraint cases.
  void runStorageEvictionScheduler();

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
  const { session, loading, isProfileResolving, profileError, refreshProfile } = useAuth();
  const onboardingCompleted = useStore((state) => state.onboardingCompleted);
  const hasLiveCapacity = useStore((state) => Boolean(state.activeBond?.capacity));
  const activeBond = useStore((state) => state.activeBond);
  const activeBondScopeId = useStore((state) => state.activeBond?.id ?? null);
  const clearCedarDecisions = useCedarDecisionStore((state) => state.clearDecisions);
  usePolicyVersionInvalidation(clearCedarDecisions);
  const hasDecidedConsent = useConsentStore((state) => state.hasDecidedConsent);
  const toast = useStore((state) => state.toast);
  const hideToast = useStore((state) => state.hideToast);

  const [lockState, setLockState] = useState(() => ({
    isUnlocked: Platform.OS === 'web' || !storage.getBoolean('require_biometrics'),
    hasPinCode: false,
    showPinUnlock: false,
  }));
  const { isUnlocked, hasPinCode, showPinUnlock } = lockState;
  const manifestLoaded = useEntitlementStore((state) => state.manifestLoaded);
  const readiness = useEntitlementStore((state) => state.readiness);
  const snapshotUserId = useEntitlementStore((state) => state.snapshotUserId);
  const entitlementSnapshot = useMemo(
    () => ({
      manifestLoaded,
      readiness,
      snapshotUserId,
    }),
    [manifestLoaded, readiness, snapshotUserId],
  );
  // Session restoration is local; identity and fresh capabilities may require
  // the network. An offline return is permitted only from a verified, local,
  // user-scoped entitlement snapshot — never just a stale profile object.
  const hasCachedCapabilities = hasUsableOfflineCapabilitySnapshot({
    sessionUserId: session?.user?.id,
    ...entitlementSnapshot,
  });
  const { routeGuardReady, hasActiveCapacity, isCapabilityResolutionBlocked } =
    getSessionRouteReadiness({
      isSessionLoading: loading,
      isProfileResolving,
      hasProfileError: Boolean(profileError),
      hasSession: Boolean(session),
      hasCachedCapabilities,
      hasLiveCapacity,
    });
  const sessionMode = getSessionIdentityMode(session);
  const routeTarget = getAuthRouteTarget({
    pathname,
    bootstrapReady: routeGuardReady,
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

    void coreRuntime.asset.loadAsync(fontAssets).catch((error) => {
      console.warn('[font bootstrap] continuing with fallback fonts', error);
    });
  }, []);

  useEffect(() => {
    if (!routeGuardReady) return;

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
  }, [routeGuardReady, pathname, routeTarget.redirectTo, router, session, onboardingCompleted]);

  useEffect(
    () =>
      scheduleNativeSplashHandoff({
        requestFrame: requestAnimationFrame,
        cancelFrame: cancelAnimationFrame,
        hide: () => SplashScreen.hideAsync(),
        onError: (error) => {
          console.warn('[splash] hideAsync failed, continuing anyway', error);
        },
      }),
    [],
  );

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
                  {routeGuardReady && <ObserveInteractiveMarker />}
                  <FeatureProvider>
                    <Stack screenOptions={{ headerShown: false, ...softCrossfadeScale }}>
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
                  <NetworkStatusBanner />
                  {isCapabilityResolutionBlocked && (
                    <View
                      accessibilityRole="alert"
                      style={{
                        marginHorizontal: 16,
                        marginBottom: 12,
                        padding: 14,
                        borderRadius: 12,
                        backgroundColor: '#2A1B12',
                      }}
                    >
                      <Text style={{ color: '#FDE7D2', fontSize: 14 }}>
                        We could not restore your account capabilities. Your local data remains
                        safe.
                      </Text>
                      <TouchableOpacity
                        accessibilityRole="button"
                        accessibilityLabel="Retry restoring account capabilities"
                        onPress={() => {
                          void refreshProfile();
                        }}
                        style={{ alignSelf: 'flex-start', marginTop: 10 }}
                      >
                        <Text style={{ color: '#F4B66E', fontWeight: '700' }}>Retry</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  <PDPAConsentModal
                    isOpen={routeGuardReady && !hasDecidedConsent}
                    onClose={() => {}}
                  />
                  <SyncManager dispatchQueuedMutation={dispatchQueuedMutationToSovereignBus} />
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

function SuspenseFallback() {
  return <BrandPulse size={40} />;
}

function RootShell() {
  const [bootState, setBootState] = useState<BootState>({ phase: 'registering-runtime' });
  const [bootAttempt, setBootAttempt] = useState(0);

  useEffect(() => {
    installGlobalErrorHandlers();
  }, []);

  useEffect(() => {
    let cancelled = false;

    setBootState({ phase: 'registering-runtime' });

    void (async () => {
      try {
        // This is the hard boot boundary. Nothing that can read coreRuntime is
        // rendered until this completes successfully.
        await completeEssentialStartup({
          bootstrapPlatform,
          isRuntimeRegistered: () => coreRuntime.isRegistered(),
          loadCatalog: () => import('@/boot/registerAppCatalog'),
          installWorkflowBridge: installMobileWorkflowEventBridge,
        });

        if (cancelled) return;
        setBootState({ phase: 'ready' });

        try {
          // These services must never decide whether first render is possible.
          injectPostHog(initTracker);
          void import('@/lib/googleSignIn')
            .then(({ configureGoogleOneTap }) => configureGoogleOneTap())
            .catch((error) => {
              console.warn('[GoogleSignIn] deferred configuration failed:', error);
            });
          void import('@/lib/backgroundSync')
            .then(({ registerBackgroundSync }) => registerBackgroundSync())
            .catch((error) => {
              console.warn('[BackgroundSync] deferred registration failed:', error);
            });
          void import('@/lib/storageEvictionTask')
            .then(({ registerStorageEvictionTask }) => registerStorageEvictionTask())
            .catch((error) => {
              console.warn('[StorageEvictionTask] deferred registration failed:', error);
            });
          void import('@/utils/LanguageUtils')
            .then(({ LanguageUtils }) => LanguageUtils.init())
            .catch((error) => {
              console.warn('[LanguageUtils.init] continuing without language bootstrap', error);
            });
        } catch (error) {
          console.warn('[boot] deferred startup service failed:', error);
        }
      } catch (error) {
        console.error('[boot] core startup failed:', error);
        if (!cancelled) {
          setBootState({
            phase: 'failed',
            error: error instanceof Error ? error : new Error('Unknown startup failure.'),
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [bootAttempt]);

  return (
    <ObserveRoot>
      <ObserveErrorBoundary>
        <QueryClientProvider client={queryClient}>
          {bootState.phase === 'ready' ? (
            <GlobalProvider>
              <EnvironmentProvider>
                <DeepLinkProvider>
                  <PushNotificationProvider>
                    <Suspense fallback={<SuspenseFallback />}>
                      <AppContent />
                    </Suspense>
                  </PushNotificationProvider>
                </DeepLinkProvider>
              </EnvironmentProvider>
            </GlobalProvider>
          ) : (
            <FullScreenFallback
              error={bootState.phase === 'failed' ? bootState.error : undefined}
              onRetry={
                bootState.phase === 'failed'
                  ? () => setBootAttempt((attempt) => attempt + 1)
                  : undefined
              }
            />
          )}
        </QueryClientProvider>
      </ObserveErrorBoundary>
    </ObserveRoot>
  );
}

export default RootShell;
