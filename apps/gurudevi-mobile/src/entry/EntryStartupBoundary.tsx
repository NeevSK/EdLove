import { coreRuntime, deviceAccounts } from '@repo/core';
import { bootstrapPlatform } from '@repo/core/native';
import { BrandPulse, Mascot, MascotProvider } from '@repo/ui';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Text, View, Pressable } from '@repo/ui/primitives';

import { fireflyMascotConfig } from '@/brand/mascotArtwork';

import { handoffNativeSplashAfterCommit } from '@/boot/nativeSplashService';
import { completeEssentialStartup } from '@/boot/startupCoordinator';
import { recordStartupStage } from '@/boot/startupTelemetry';
import { EntryShell } from '@/entry/EntryShell';
import { installGlobalErrorHandlers } from '@/lib/globalErrorHandlers';

type StartupState =
  | { status: 'starting' }
  | { status: 'ready' }
  | { status: 'failed'; error: Error };

function StartupFallback({ error, onRetry }: { error?: Error; onRetry?: () => void }) {
  useEffect(() => {
    return handoffNativeSplashAfterCommit({
      onError: (cause: unknown) => {
        console.warn('[startup] native splash handoff unavailable:', cause);
      },
    });
  }, []);

  return (
    <MascotProvider config={fireflyMascotConfig}>
      <View
        accessibilityRole={error ? 'alert' : 'progressbar'}
        accessibilityLabel={error ? 'Gurudevi could not start' : 'Preparing Gurudevi'}
        style={styles.container}
      >
        {error ? (
          <Mascot mode="offline" state="interrupted" size={120} podVariant="raw" />
        ) : (
          <BrandPulse size={32} tintColor="#D4843A" />
        )}
        <Text style={styles.primaryText}>
          {error ? 'Gurudevi could not finish starting.' : 'Preparing your sanctuary…'}
        </Text>
        {error ? (
          <>
            <Text style={styles.errorMessage}>
              {error.message}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Retry starting Gurudevi"
              onPress={onRetry}
              style={styles.retryButton}
            >
              <Text style={styles.retryButtonText}>Try again</Text>
            </Pressable>
          </>
        ) : null}
      </View>
    </MascotProvider>
  );
}

function startDeferredServices(): void {
  void import('@/lib/inngestEvents')
    .then(({ installMobileWorkflowEventBridge }) => installMobileWorkflowEventBridge())
    .catch((error: unknown) => console.warn('[startup] workflow bridge deferred:', error));
  void import('@/lib/deepLinks/installReferrerBridge')
    .then(({ resolveDeferredInstallIntent }) => resolveDeferredInstallIntent())
    .catch((error: unknown) => console.warn('[startup] deferred install referrer bridge deferred:', error));
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
      onStage: recordStartupStage,
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
  return (
    <StartupFallback
      error={state.status === 'failed' ? state.error : undefined}
      onRetry={() => {
        setState({ status: 'starting' });
        setAttempt((value) => value + 1);
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#20140E',
    flex: 1,
    justifyContent: 'center',
    padding: 32,
  },
  primaryText: {
    color: '#F5EDD6',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  errorMessage: {
    color: '#D8C8B8',
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#D4843A',
    borderRadius: 10,
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  retryButtonText: {
    color: '#20140E',
    fontWeight: '700',
  },
});
