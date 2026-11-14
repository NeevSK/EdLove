import ErrorBoundary, { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { Stack } from 'expo-router';

export { RouteErrorBoundary as ErrorBoundary };

export default function CommunityLayout() {
  return (
    <ErrorBoundary name="CommunityLayout">
      <Stack
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="feed" />
        <Stack.Screen name="notices" />
        <Stack.Screen name="groups" />
        <Stack.Screen name="group/[id]" />
        <Stack.Screen name="messages" />
      </Stack>
    </ErrorBoundary>
  );
}
