import ErrorBoundary, { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { Stack } from 'expo-router';

export { RouteErrorBoundary as ErrorBoundary };

export default function LibraryLayout() {
  return (
    <ErrorBoundary name="LibraryLayout">
      <Stack
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="shelf" />
        <Stack.Screen name="item/[id]" />
      </Stack>
    </ErrorBoundary>
  );
}
