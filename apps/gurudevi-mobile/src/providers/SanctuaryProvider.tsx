import { useAuth } from '@repo/core/logic';
import { useAuthStore } from '@repo/core/store';
import { SyncManager } from '@repo/core/sync';
import { registerTokenResolver, registerActiveBondIdResolver } from '@repo/core/api/clientRuntime';
import { SanctuaryGlobalStyles } from '@repo/ui/components/SanctuaryGlobalStyles';
import { BrandPulse } from '@repo/ui';
import { EnvironmentProvider, ExternalLinkProvider } from '@repo/ui/context';
import { FABProvider } from '@repo/ui/context/FABContext';
import { GluestackUIProvider } from '@repo/ui/gluestack';
import { Box, Center } from '@repo/ui/primitives';
import { ToastProvider } from '@repo/ui/providers';
import { AppLifecycle } from '@repo/core/hooks/useAppLifecycle';
import * as Sentry from '@sentry/react-native';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { dispatchQueuedMutationToSovereignBus } from '@/lib/inngestEvents';
import { useAssets } from '@/providers/AssetProvider';
import { DeepLinkProvider } from '@/providers/DeepLinkProvider';
import { config } from '../../gluestack-ui.config';

const queryClient = new QueryClient();

/**
 * AssetLoaderWatcher
 *
 * Shows a loading splash until:
 *  1. Fonts are loaded (expo-font)
 *  2. Auth session is resolved (Supabase)
 *  3. Zustand store is fully hydrated from MMKV (Fix 6: Race Condition)
 *
 * The `isStoreHydrated` gate prevents ReBAC permission contexts from
 * being evaluated with empty bond arrays during app bootstrap.
 */
function AssetLoaderWatcher({ children }: { children: React.ReactNode }) {
  const { fontsLoaded } = useAssets();
  const { loading } = useAuth();
  const isStoreHydrated = useAuthStore((s) => s.isStoreHydrated);

  if (!fontsLoaded || loading || !isStoreHydrated) {
    return (
      <SafeAreaProvider>
        <Center className="flex-1 bg-obsidian">
          <BrandPulse size={48} tintColor="#D4843A" />
        </Center>
      </SafeAreaProvider>
    );
  }

  return <>{children}</>;
}

interface SanctuaryProviderProps {
  children: React.ReactNode;
}

export function SanctuaryProvider({ children }: SanctuaryProviderProps) {
  // Register oRPC client resolvers for automatic auth header injection
  React.useEffect(() => {
    registerTokenResolver(async () => {
      const { session } = await useAuth().getAuthSession();
      return session?.access_token ?? null;
    });

    registerActiveBondIdResolver(async () => {
      return useAuthStore.getState().activeBondId ?? null;
    });
  }, []);

  // Initialize AppState listener and unhandled rejection handler on mount
  React.useEffect(() => {
    // ─── Unhandled Promise Rejection Handler ──────────────────────────────
    const handleUnhandledRejection = (reason: any) => {
      console.error('[UnhandledRejection]', reason);
      // In production, send to Sentry
      if (typeof Sentry !== 'undefined') {
        Sentry.captureException(reason);
      }
    };

    if (typeof process !== 'undefined' && process.on) {
      process.on('unhandledRejection', handleUnhandledRejection);
    }

    // ─── AppState Listener ────────────────────────────────────────────────
    const appStateCleanup = AppLifecycle.onAppStateChange((status) => {
      if (status === 'active') {
        // App came to foreground - trigger sync
        console.log('[AppLifecycle] App became active - foreground sync');
        // Could trigger foreground sync here
      } else if (status === 'background') {
        console.log('[AppLifecycle] App went to background - persisting state');
        // Persist critical state before background
      }
    });

    return () => {
      if (typeof process !== 'undefined' && process.off) {
        process.off('unhandledRejection', handleUnhandledRejection);
      }
      appStateCleanup();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <EnvironmentProvider>
        <GluestackUIProvider config={config}>
          <SanctuaryGlobalStyles />
          <AssetLoaderWatcher>
            <FABProvider>
              <DeepLinkProvider>
                <ToastProvider>
                  <ExternalLinkProvider>
                    <Box className="flex-1">{children}</Box>
                    <SyncManager dispatchQueuedMutation={dispatchQueuedMutationToSovereignBus} />
                  </ExternalLinkProvider>
                </ToastProvider>
              </DeepLinkProvider>
            </FABProvider>
          </AssetLoaderWatcher>
        </GluestackUIProvider>
      </EnvironmentProvider>
    </QueryClientProvider>
  );
}
