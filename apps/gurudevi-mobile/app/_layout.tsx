import 'react-native-url-polyfill/auto';
import '../src/i18n/config';
import '@repo/ui/global.css';

import { Observe, ObserveRoot } from 'expo-observe';
import * as SplashScreen from 'expo-splash-screen';

import { EntryStartupBoundary } from '@/entry/EntryStartupBoundary';

// Native-owned transition: the visible React boot surface is already mounted
// before the handoff service releases this splash.
SplashScreen.setOptions({ duration: 220, fade: true });

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
