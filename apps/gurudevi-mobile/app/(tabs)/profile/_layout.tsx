import ErrorBoundary, { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { Stack } from 'expo-router';

export { RouteErrorBoundary as ErrorBoundary };

export default function ProfileLayout() {
  return (
    <ErrorBoundary name="ProfileLayout">
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="mute-hub" />
        <Stack.Screen name="privacy-ledger" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="full/[id]" />
        <Stack.Screen name="public/[id]" />
      </Stack>
    </ErrorBoundary>
  );
}
