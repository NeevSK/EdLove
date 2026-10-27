import { useUIStore } from '@repo/core/store';
import { BrandPulse } from '@repo/ui';
import ErrorBoundary, { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { Center, Pressable, Text } from '@repo/ui/primitives';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

export { RouteErrorBoundary as ErrorBoundary };

/**
 * PulseRoute (/pulse)
 *
 * Dedicated route host for the Sanctuary Pulse somatic breathing space.
 * Awakened by deep links (gurudevi://pulse), iOS Back Tap, or Action Button.
 * Directly triggers the overlay and automatically pops back on overlay dismissal
 * to eliminate double-layer screen clutter.
 */
export default function PulseRoute() {
  const router = useRouter();
  const isBreathingOpen = useUIStore((s) => s.isBreathingOpen);
  const setBreathingOpen = useUIStore((s) => s.setBreathingOpen);
  const hasOpenedRef = useRef(false);

  const handleReturn = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }, [router]);

  useEffect(() => {
    // Open the breathing space immediately upon mounting
    setBreathingOpen(true);
    hasOpenedRef.current = true;
  }, [setBreathingOpen]);

  useEffect(() => {
    // When the overlay closes after having been opened, automatically navigate back
    if (hasOpenedRef.current && !isBreathingOpen) {
      handleReturn();
    }
  }, [isBreathingOpen, handleReturn]);

  return (
    <ErrorBoundary name="PulseRoute">
      <View style={styles.container}>
        <Center className="flex-1 px-6">
          <BrandPulse accessibilityLabel="Sanctuary Pulse Breathing Space Active" />
          <Text className="mt-6 text-center text-lg font-semibold text-phase-text-primary">
            Sanctuary Pulse Active
          </Text>
          <Text className="mt-2 text-center text-sm text-phase-text-secondary">
            Breathe in rhythm with the gentle lantern.
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Return to Sanctuary"
            className="mt-8 rounded-full bg-phase-interactive px-6 py-3"
            onPress={handleReturn}
          >
            <Text className="font-semibold text-white">Return to App</Text>
          </Pressable>
        </Center>
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(26, 16, 11, 0.98)',
  },
});
