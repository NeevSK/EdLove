import { AnalyticsProvider } from '@repo/analytics/ui';
import { SyncManager } from '@repo/core/sync';
import { usePermissions } from '@repo/core/logic';
import { useAuth } from '@repo/core/logic';

import { EnvironmentProvider, ExternalLinkProvider } from '@repo/ui/context';
import { GluestackUIProvider } from '@repo/ui/gluestack';
import { Box } from '@repo/ui/primitives';
import { Center, Spinner } from '@repo/ui/primitives';
import { ToastProvider } from '@repo/ui/providers';
import { SanctuaryGlobalStyles } from '@repo/ui/components/SanctuaryGlobalStyles';
import { FABProvider } from '@repo/ui/context/FABContext';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { config } from '../../gluestack-ui.config';
import { dispatchQueuedMutationToInngest } from '../lib/inngestEvents';
import { useAssets } from './AssetProvider';
import { DeepLinkProvider } from './DeepLinkProvider';

const queryClient = new QueryClient();

/**
 * AssetLoaderWatcher
 * Shows a loading splash until fonts and session are resolved.
 */
function AssetLoaderWatcher({ children }: { children: React.ReactNode }) {
  const { fontsLoaded } = useAssets();
  const { loading } = useAuth();

  if (!fontsLoaded || loading) {
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
                      <SyncManager dispatchQueuedMutation={dispatchQueuedMutationToInngest} />
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
