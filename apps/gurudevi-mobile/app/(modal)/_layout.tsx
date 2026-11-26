import ErrorBoundary, { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { Stack } from 'expo-router';
import { SHEET_SCREEN } from '@/navigation/sheetScreen';

export { RouteErrorBoundary as ErrorBoundary };

export default function ModalLayout() {
  return (
    <ErrorBoundary name="ModalLayout">
      <Stack
        screenOptions={{
          ...SHEET_SCREEN,
          sheetAllowedDetents: [0.85, 1],
          headerShown: false,
        }}
      >
        <Stack.Screen name="create-form" />
      </Stack>
    </ErrorBoundary>
  );
}
