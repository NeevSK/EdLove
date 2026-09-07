import { coreRuntime, deviceAccounts } from '@repo/core';
import { bootstrapPlatform } from '@repo/core/native';
import { BrandPulse } from '@repo/ui';
import { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { completeEssentialStartup } from '@/boot/startupCoordinator';
import { EntryShell } from '@/entry/EntryShell';
import { installGlobalErrorHandlers } from '@/lib/globalErrorHandlers';

type StartupState = { status: 'starting' } | { status: 'ready' } | { status: 'failed'; error: Error };

function StartupFallback({ error, onRetry }: { error?: Error; onRetry?: () => void }) {
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      void import('expo-splash-screen').then(({ hideAsync }) => hideAsync());
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <View
      accessibilityRole={error ? 'alert' : 'progressbar'}
      accessibilityLabel={error ? 'Gurudevi could not start' : 'Preparing Gurudevi'}
      style={{ alignItems: 'center', backgroundColor: '#20140E', flex: 1, justifyContent: 'center', padding: 32 }}
    >
      <BrandPulse size={32} tintColor="#D4843A" />
      <Text style={{ color: '#F5EDD6', fontSize: 16, marginTop: 16, textAlign: 'center' }}>
        {error ? 'Gurudevi could not finish starting.' : 'Preparing your sanctuary…'}
      </Text>
      {error ? (
        <>
          <Text style={{ color: '#D8C8B8', fontSize: 13, marginTop: 8, textAlign: 'center' }}>
            {error.message}
          </Text>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Retry starting Gurudevi"
            onPress={onRetry}
            style={{ backgroundColor: '#D4843A', borderRadius: 10, marginTop: 20, paddingHorizontal: 20, paddingVertical: 12 }}
          >
            <Text style={{ color: '#20140E', fontWeight: '700' }}>Try again</Text>
          </TouchableOpacity>
        </>
      ) : null}
    </View>
  );
}

function startDeferredServices(): void {
  void import('@/lib/inngestEvents')
    .then(({ installMobileWorkflowEventBridge }) => installMobileWorkflowEventBridge())
    .catch((error: unknown) => console.warn('[startup] workflow bridge deferred:', error));
  void import('@/lib/googleSignIn')
    .then(({ configureGoogleOneTap }) => configureGoogleOneTap())
    .catch((error: unknown) => console.warn('[startup] Google Sign-In deferred:', error));
  void import('@/lib/backgroundSync')
    .then(({ registerBackgroundSync }) => registerBackgroundSync())
    .catch((error: unknown) => console.warn('[startup] background sync deferred:', error));
}

export function EntryStartupBoundary() {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<StartupState>({ status: 'starting' });

  useEffect(() => {
    installGlobalErrorHandlers();
    let cancelled = false;

    void completeEssentialStartup({
      bootstrapPlatform,
      isRuntimeRegistered: () => coreRuntime.isRegistered(),
      loadCatalog: async () => {
        const { registerAppCatalog } = await import('@/boot/registerAppCatalog');
        return { registerAppCatalog };
      },
      initializeDeviceAccounts: () => deviceAccounts.initialize(),
    })
      .then(() => {
        if (cancelled) return;
        setState({ status: 'ready' });
        startDeferredServices();
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        setState({
          status: 'failed',
          error: cause instanceof Error ? cause : new Error('Unknown startup failure.'),
        });
      });

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  if (state.status === 'ready') return <EntryShell />;
  return <StartupFallback error={state.status === 'failed' ? state.error : undefined} onRetry={() => {
    setState({ status: 'starting' });
    setAttempt((value) => value + 1);
  }} />;
}
