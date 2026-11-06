import ErrorBoundary, { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { Stack } from 'expo-router';

export { RouteErrorBoundary as ErrorBoundary };

export default function ModalLayout() {
  return (
    <ErrorBoundary name="ModalLayout">
      <Stack screenOptions={{ presentation: 'modal', headerShown: false }}>
        <Stack.Screen name="create-form" />
      </Stack>
    </ErrorBoundary>
  );
}
