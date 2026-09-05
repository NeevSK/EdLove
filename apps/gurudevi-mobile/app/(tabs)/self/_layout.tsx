import ErrorBoundary, { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { Stack } from 'expo-router';

export { RouteErrorBoundary as ErrorBoundary };

export default function SelfLayout() {
  return (
    <ErrorBoundary name="SelfLayout">
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="ai-assistant" />
        <Stack.Screen name="wisdom/[id]" />
      </Stack>
    </ErrorBoundary>
  );
}
