import { queryClientConfig } from '@repo/core/effect/bindings/queryClient';
import { networkMonitor } from '@repo/core/platform/drivers/networkMonitor';
import { focusManager, onlineManager, QueryClient } from '@tanstack/react-query';
import { AppState, Platform } from 'react-native';

if (Platform.OS !== 'web') {
  focusManager.setEventListener((setFocused) => {
    const subscription = AppState.addEventListener('change', (state) =>
      setFocused(state === 'active'),
    );
    if (typeof AppState.currentState === 'string') setFocused(AppState.currentState === 'active');
    return () => subscription.remove();
  });
}

onlineManager.setEventListener((setOnline) => {
  // TanStack's online flag schedules reads; it is not mutation permission.
  // Unknown must still allow a request attempt so startup cannot pause forever.
  const update = () => setOnline(networkMonitor.getSnapshot().status !== 'offline');
  const unsubscribe = networkMonitor.subscribe(update);
  update();
  return unsubscribe;
});

// Retry, backoff and failure feedback come from core, the same on every platform.
export const queryClient = new QueryClient(
  queryClientConfig({
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  }),
);
