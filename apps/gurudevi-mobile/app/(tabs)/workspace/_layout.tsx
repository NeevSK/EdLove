import ErrorBoundary, { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { Stack } from 'expo-router';

export { RouteErrorBoundary as ErrorBoundary };

export default function WorkspaceLayout() {
  return (
    <ErrorBoundary name="WorkspaceLayout">
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="atlas" />
        <Stack.Screen name="commercial/[batchId]" />
        <Stack.Screen name="events" />
        <Stack.Screen name="inventory" />
        <Stack.Screen name="welfare" />
        <Stack.Screen name="peers" />
        <Stack.Screen name="demo-fee" options={{ presentation: 'modal' }} />
        <Stack.Screen name="workforce-role" options={{ presentation: 'modal' }} />
      </Stack>
    </ErrorBoundary>
  );
}
