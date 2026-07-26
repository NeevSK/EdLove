import { AnalyticsProvider } from '@repo/analytics/ui';
import { useAuth, usePermissions } from '@repo/core/logic';
import { useAuthStore } from '@repo/core/store';
import { SyncManager } from '@repo/core/sync';
import { SanctuaryGlobalStyles } from '@repo/ui/components/SanctuaryGlobalStyles';
import { EnvironmentProvider, ExternalLinkProvider } from '@repo/ui/context';
import { FABProvider } from '@repo/ui/context/FABContext';
import { GluestackUIProvider } from '@repo/ui/gluestack';
import { Box, Center, Spinner } from '@repo/ui/primitives';
import { ToastProvider } from '@repo/ui/providers';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { config } from '../../gluestack-ui.config';
import { dispatchQueuedMutationToSovereignBus } from '@/lib/inngestEvents';
import { useAssets } from '@/providers/AssetProvider';
import { DeepLinkProvider } from '@/providers/DeepLinkProvider';

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
          <Spinner size="large" className="text-sanctuarySaffron" />
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
  const { flags } = usePermissions();

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
                    <AnalyticsProvider
                      apiKey={process.env.EXPO_PUBLIC_POSTHOG_API_KEY}
                      enabled={flags?.isAnalyticsEnabled}
                      options={{
                        host: process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
                      }}
                    >
                      <Box className="flex-1">{children}</Box>
                      <SyncManager dispatchQueuedMutation={dispatchQueuedMutationToSovereignBus} />
                    </AnalyticsProvider>
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
