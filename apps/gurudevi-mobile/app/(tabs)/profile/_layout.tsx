import ErrorBoundary, { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { Stack } from 'expo-router';

export { RouteErrorBoundary as ErrorBoundary };

export const unstable_settings = { anchor: 'index' };

export default function ProfileLayout() {
  return (
    <ErrorBoundary name="ProfileLayout">
      <Stack
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}
      >
        <Stack.Screen name="index" />
      </Stack>
    </ErrorBoundary>
  );
}
