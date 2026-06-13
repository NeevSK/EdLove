import { router } from 'expo-router';
import { Platform } from 'react-native';

export function safeBack(fallbackHref: string) {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.history.length <= 1) {
    router.replace(fallbackHref);
    return;
  }

  router.back();
}
