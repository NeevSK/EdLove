import ErrorBoundary, { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { Stack } from 'expo-router';

export { RouteErrorBoundary as ErrorBoundary };

/**
 * The overview sits under every screen of this stack, so a deep link into one of them still has
 * somewhere to go back to (expo-router 58 `anchor`; pass `withAnchor` when navigating in from
 * another stack).
 */
export const unstable_settings = { anchor: 'index' };

export default function SelfLayout() {
  return (
    <ErrorBoundary name="SelfLayout">
      <Stack
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="ai-assistant" />
        <Stack.Screen name="wisdom/[id]" />
      </Stack>
    </ErrorBoundary>
  );
}
