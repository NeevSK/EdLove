import { networkManager } from '@repo/core/logic/managers/NetworkManager';
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
  const update = () => setOnline(networkManager.getSnapshot().status !== 'offline');
  const unsubscribe = networkManager.subscribe(update);
  update();
  return unsubscribe;
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});
