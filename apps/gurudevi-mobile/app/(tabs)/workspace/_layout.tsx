import ErrorBoundary, { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { useWorld } from '@repo/ui/theme/native';
import { Stack } from 'expo-router';

export { RouteErrorBoundary as ErrorBoundary };

/**
 * The overview sits under every screen of this stack, so a deep link into one of them still has
 * somewhere to go back to (expo-router 58 `anchor`; pass `withAnchor` when navigating in from
 * another stack).
 */
export const unstable_settings = { anchor: 'index' };

export default function WorkspaceLayout() {
  // Pages show the world's floor behind them; a modal sits over a page, so it wears the ground.
  const modal = {
    presentation: 'modal',
    contentStyle: { backgroundColor: useWorld().tokens.ground },
  } as const;
  return (
    <ErrorBoundary name="WorkspaceLayout">
      <Stack
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="atlas" />
        <Stack.Screen name="commercial/[batchId]" />
        <Stack.Screen name="events" />
        <Stack.Screen name="inventory" />
        <Stack.Screen name="welfare" />
        <Stack.Screen name="peers" />
        <Stack.Screen name="demo-fee" options={modal} />
        <Stack.Screen name="workforce-role" options={modal} />
      </Stack>
    </ErrorBoundary>
  );
}
