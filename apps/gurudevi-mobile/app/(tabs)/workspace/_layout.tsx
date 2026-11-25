import { sizeClassOf } from '@repo/core/flows/navigationPolicy';
import ErrorBoundary, { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { useWorld } from '@repo/ui/theme/native';
import { Slot, Stack, usePathname } from 'expo-router';
import { useWindowDimensions, View } from 'react-native';
import { ContainedModalProvider } from 'react-native-screens';
import { SHEET_SCREEN } from '@/navigation/sheetScreen';
import WorkspaceDispatcher from './index';

export { RouteErrorBoundary as ErrorBoundary };

/**
 * The overview sits under every screen of this stack, so a deep link into one of them still has
 * somewhere to go back to (expo-router 58 `anchor`; pass `withAnchor` when navigating in from
 * another stack).
 */
export const unstable_settings = { anchor: 'index' };

export default function WorkspaceLayout() {
  const t = useWorld().tokens;
  const { width } = useWindowDimensions();
  const pathname = usePathname();
  const isRegular = sizeClassOf(width) === 'regular';

  // Pages show the world's floor behind them; sheets wear the ground with native detents.
  const sheetOptions = {
    ...SHEET_SCREEN,
    contentStyle: { backgroundColor: t.ground },
  } as const;

  if (isRegular) {
    const atRoot = pathname === '/workspace' || pathname === '/workspace/';
    return (
      <ErrorBoundary name="WorkspaceLayout">
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <View
            style={{
              width: 360,
              borderRightWidth: 1,
              borderRightColor: t.line,
            }}
          >
            <WorkspaceDispatcher />
          </View>
          <ContainedModalProvider containerId="workspace-detail" style={{ flex: 1 }}>
            {atRoot ? null : <Slot />}
          </ContainedModalProvider>
        </View>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary name="WorkspaceLayout">
      <Stack
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="atlas" />
        <Stack.Screen name="commercial/[batchId]" />
        <Stack.Screen name="events" />
        <Stack.Screen name="inventory" />
        <Stack.Screen name="welfare" />
        <Stack.Screen name="peers" />
        <Stack.Screen name="demo-fee" options={sheetOptions} />
        <Stack.Screen name="workforce-role" options={sheetOptions} />
      </Stack>
    </ErrorBoundary>
  );
}
