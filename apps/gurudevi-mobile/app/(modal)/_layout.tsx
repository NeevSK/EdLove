import ErrorBoundary, { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { Stack } from 'expo-router';

export { RouteErrorBoundary as ErrorBoundary };

export default function ModalLayout() {
  return (
    <ErrorBoundary name="ModalLayout">
      <Stack screenOptions={{ presentation: 'modal', headerShown: false }}>
        <Stack.Screen name="create-group" />
        <Stack.Screen name="create-post" />
        <Stack.Screen name="create-form" />
        <Stack.Screen name="app-settings" />
      </Stack>
    </ErrorBoundary>
  );
}
