import 'react-native-url-polyfill/auto';
import '../src/i18n/config';
import '@repo/ui/global.css';

import * as SplashScreen from 'expo-splash-screen';
import { Observe, ObserveRoot } from 'expo-observe';

import { EntryStartupBoundary } from '@/entry/EntryStartupBoundary';

void SplashScreen.preventAutoHideAsync().catch(() => {
  // The visible startup boundary owns recovery if the native call is unavailable.
});

try {
  Observe.configure({
    dispatchInDebug: false,
    dispatchingEnabled: true,
    environment: process.env.EXPO_PUBLIC_APP_ENV ?? process.env.NODE_ENV ?? 'production',
    integrations: { expoRouter: true },
    sampleRate: 0.2,
  });
} catch (error) {
  console.warn('[observe] configuration unavailable:', error);
}

/** Expo Router's root is intentionally composition-only. */
export default function RootLayout() {
  return (
    <ObserveRoot>
      <EntryStartupBoundary />
    </ObserveRoot>
  );
}
