import { useUIStore } from '@repo/core/store';
import { BrandPulse } from '@repo/ui';
import ErrorBoundary, { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import { Button, Text } from '@repo/ui/components/native';
import { alpha } from '@repo/ui/theme';
import { useWorld } from '@repo/ui/theme/native';
import { View } from 'react-native';

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
  const ground = useWorld().tokens.ground;

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
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          paddingHorizontal: 24,
          backgroundColor: alpha(ground, 0.94),
        }}
      >
        <BrandPulse accessibilityLabel="Sanctuary Pulse Breathing Space Active" />
        <Text kind="title" align="center" style={{ marginTop: 14 }}>
          Sanctuary Pulse Active
        </Text>
        <Text kind="body" tone="soft" align="center">
          Breathe in rhythm with the gentle lantern.
        </Text>
        <Button
          label="Return to App"
          variant="primary"
          accessibilityLabel="Return to Sanctuary"
          onPress={handleReturn}
          style={{ marginTop: 18 }}
        />
      </View>
    </ErrorBoundary>
  );
}
