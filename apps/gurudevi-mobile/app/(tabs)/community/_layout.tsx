import ErrorBoundary, { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { Stack } from 'expo-router';

export { RouteErrorBoundary as ErrorBoundary };

export default function CommunityLayout() {
  return (
    <ErrorBoundary name="CommunityLayout">
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="announcements" />
        <Stack.Screen name="groups" />
        <Stack.Screen name="direct-messages" />
        <Stack.Screen name="chat/[conversationId]" />
        <Stack.Screen name="direct-messages/[conversationId]" />
        <Stack.Screen name="groups/[groupId]" />
        <Stack.Screen name="profile/[id]" />
      </Stack>
    </ErrorBoundary>
  );
}
