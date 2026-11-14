import * as Haptics from 'expo-haptics';
import { Accelerometer } from 'expo-sensors';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

export interface SomaticShakeOptions {
  /** Whether the accelerometer listener is actively monitoring. Defaults to true. */
  enabled?: boolean;
  /** Magnitude threshold in g-force to classify as a shake. Default: 2.2g. */
  threshold?: number;
  /** Milliseconds to wait before accepting another shake event. Default: 4000ms. */
  cooldownMs?: number;
  /** Callback invoked when a shake is confirmed. */
  onShake: () => void;
}

/**
 * useSomaticShake
 *
 * Somatic human-computer interaction hook that detects physical device shaking
 * and absorbs the kinetic impact with gentle haptics before triggering decompression.
 *
 * Grounded in local-first physics: zero network dependencies, 100% on-device.
 */
export function useSomaticShake({
  enabled = true,
  threshold = 2.2,
  cooldownMs = 4000,
  onShake,
}: SomaticShakeOptions): void {
  const lastShakeTimeRef = useRef<number>(0);
  const consecutiveSpikesRef = useRef<number>(0);
  const onShakeRef = useRef(onShake);
  onShakeRef.current = onShake;

  useEffect(() => {
    // Accelerometer is unavailable or restricted in non-HTTPS mobile browsers.
    if (Platform.OS === 'web' || !enabled) {
      return;
    }

    let isMounted = true;
    let subscription: { remove: () => void } | null = null;

    void (async () => {
      try {
        const available = await Accelerometer.isAvailableAsync();
        if (!available || !isMounted) return;

        // Sample at 100ms intervals (10Hz) — optimal battery footprint and gesture detection
        Accelerometer.setUpdateInterval(100);

        subscription = Accelerometer.addListener(({ x, y, z }) => {
          const now = Date.now();
          if (now - lastShakeTimeRef.current < cooldownMs) {
            return;
          }

          // Calculate acceleration magnitude vector in Gs (earth gravity = 1.0)
          const magnitude = Math.sqrt(x * x + y * y + z * z);

          if (magnitude > threshold) {
            consecutiveSpikesRef.current += 1;

            // Require at least 2 consecutive spike frames (200ms) to reject sudden drops or table knocks
            if (consecutiveSpikesRef.current >= 2) {
              lastShakeTimeRef.current = now;
              consecutiveSpikesRef.current = 0;

              // Absorb kinetic shock with soft dampening haptic wave
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});

              onShakeRef.current();
            }
          } else {
            // Decay spike counter on calm frame
            consecutiveSpikesRef.current = Math.max(0, consecutiveSpikesRef.current - 1);
          }
        });
      } catch (err) {
        // Sensor failure is non-fatal; sanctuary fails safe and silent
        console.warn('[useSomaticShake] accelerometer subscription failed:', err);
      }
    })();

    return () => {
      isMounted = false;
      if (subscription) {
        subscription.remove();
      }
    };
  }, [enabled, threshold, cooldownMs]);
}
