import type { LayoutChangeEvent } from 'react-native';

export interface LayoutRecord {
  width: number;
  height: number;
  time: number;
  deltaH: number;
  deltaW: number;
}

/**
 * createLayoutSentinel
 *
 * Pure factory creating an onLayout handler with circuit breaker tripwire against
 * Fabric / Yoga layout oscillation loops.
 * Detects sign-reversing dimension deltas (Δh_t * Δh_{t-1} < 0) within a short window,
 * which indicates an onLayout -> setState -> style change cycle that locks up the native UI thread.
 *
 * In production, returns the provided callback directly with zero overhead.
 */
export function createLayoutSentinel(
  componentName: string,
  onLayout?: (event: LayoutChangeEvent) => void,
  maxOscillations = 3,
  windowMs = 150
): (event: LayoutChangeEvent) => void {
  // In production, bypass all tracking with zero runtime overhead
  if (process.env.NODE_ENV === 'production') {
    return onLayout ?? (() => {});
  }

  const history: LayoutRecord[] = [];
  let tripped = false;

  return (event: LayoutChangeEvent) => {
    if (tripped) {
      // Once tripped, circuit breaker remains open to prevent freezing the native thread
      return;
    }

    const { width, height } = event.nativeEvent.layout;
    const now = Date.now();
    const last = history[history.length - 1];

    if (last) {
      const timeDiff = now - last.time;

      // Reset if layout event happened outside the oscillation burst window
      if (timeDiff > windowMs) {
        history.length = 0;
      }

      const deltaH = height - last.height;
      const deltaW = width - last.width;

      // Ignore micro-jitter (< 0.5px)
      const isMeaningfulH = Math.abs(deltaH) >= 0.5;
      const isMeaningfulW = Math.abs(deltaW) >= 0.5;

      if (isMeaningfulH || isMeaningfulW) {
        history.push({ width, height, time: now, deltaH, deltaW });

        // Keep at most 6 history records
        if (history.length > 6) {
          history.shift();
        }

        // Count alternating direction flips (sign changes in delta)
        let oscillations = 0;
        for (let i = 1; i < history.length; i++) {
          const prev = history[i - 1]!;
          const curr = history[i]!;

          const hFlipped = prev.deltaH !== 0 && curr.deltaH !== 0 && prev.deltaH * curr.deltaH < 0;
          const wFlipped = prev.deltaW !== 0 && curr.deltaW !== 0 && prev.deltaW * curr.deltaW < 0;

          if (hFlipped || wFlipped) {
            oscillations++;
          }
        }

        if (oscillations >= maxOscillations) {
          tripped = true;
          console.error(
            `🚨 [LayoutLoopSentinel] Cyclic layout loop detected in "${componentName}"!\n` +
              `Layout oscillated ${oscillations} times within ${timeDiff}ms (height/width bouncing).\n` +
              `Halting onLayout dispatch to prevent native Fabric/Yoga thread deadlock.\n` +
              `Remediation: Guard onLayout setState calls with Math.abs(prev - next) > EPSILON, or remove circular layout dependencies.`
          );
          return;
        }
      }
    } else {
      history.push({ width, height, time: now, deltaH: 0, deltaW: 0 });
    }

    onLayout?.(event);
  };
}
