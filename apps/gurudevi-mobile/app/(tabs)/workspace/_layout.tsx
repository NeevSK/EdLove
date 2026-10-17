import ErrorBoundary, { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { Stack } from 'expo-router';

export { RouteErrorBoundary as ErrorBoundary };

export default function WorkspaceLayout() {
  return (
    <ErrorBoundary name="WorkspaceLayout">
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="editorial" options={{ title: 'Editorial' }} />
        <Stack.Screen name="events" />
        <Stack.Screen name="inventory" />
        <Stack.Screen name="welfare" />
        <Stack.Screen name="peers" />
        <Stack.Screen name="principal" />
        <Stack.Screen name="founder" />
        <Stack.Screen name="guardian" />
        <Stack.Screen name="guardian/students" />
        <Stack.Screen name="guardian/[studentId]" />
        <Stack.Screen name="guardian/events" />
        <Stack.Screen name="guardian/notifications" />
        <Stack.Screen name="guardian/bridge" />
        <Stack.Screen name="classroom/index" />
        <Stack.Screen name="classroom/[classroomId]/index" />
        <Stack.Screen name="classroom/[classroomId]/attendance" />
        <Stack.Screen name="classroom/[classroomId]/gradebook" />
        <Stack.Screen name="classroom/student/[classroomId]" />
        <Stack.Screen name="classroom/reflect" />
        <Stack.Screen name="demo-fee" options={{ presentation: 'modal' }} />
        <Stack.Screen name="workforce-role" options={{ presentation: 'modal' }} />
      </Stack>
    </ErrorBoundary>
  );
}
