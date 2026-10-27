import ErrorBoundary, { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { Stack } from 'expo-router';

export { RouteErrorBoundary as ErrorBoundary };

export default function LibraryLayout() {
  return (
    <ErrorBoundary name="LibraryLayout">
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="document-scanner" />
        <Stack.Screen name="contribute" />
        <Stack.Screen name="map" />
        <Stack.Screen name="review" />
        <Stack.Screen name="collections/[id]" />
        <Stack.Screen name="document/[resourceId]" />
        <Stack.Screen name="resource/[resourceId]" />
        <Stack.Screen name="tools/index" />
        <Stack.Screen name="tools/cloud-export" />
        <Stack.Screen name="tools/image-to-pdf" />
        <Stack.Screen name="tools/ocr" />
        <Stack.Screen name="tools/pdf-editor" />
        <Stack.Screen name="tools/spreadsheet" />
        <Stack.Screen name="video/[resourceId]" />
      </Stack>
    </ErrorBoundary>
  );
}
