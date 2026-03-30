import React from 'react';
import { View } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { 
  GluestackUIProvider, 
  SanctuaryGlobalStyles, 
  FABProvider, 
  ExternalLinkProvider, 
  ToastProvider, 
  EnvironmentProvider,
  Theme,
  Center,
  Spinner
} from '@repo/ui';
import { 
  useAuth,
  SyncManager
} from '@repo/core';
import { AnalyticsProvider } from '@repo/analytics/components';
import { config } from "../../gluestack-ui.config";
import { useAssets } from './AssetProvider';
import { DeepLinkProvider } from './DeepLinkProvider';
import { SafeAreaProvider } from 'react-native-safe-area-context';

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
        <Center sx={{ flex: 1, backgroundColor: Theme.colors.obsidian }}>
          <Spinner size="large" color={Theme.colors.sanctuarySaffron} />
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
                      options={{
                        host: process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
                      }}
                    >
                      <View style={{ flex: 1 }}>{children}</View>
                      <SyncManager />
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
