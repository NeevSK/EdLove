import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { LayoutChangeEvent } from 'react-native';
import { createLayoutSentinel } from '../LayoutLoopSentinel';

describe('LayoutLoopSentinel (G1 scenario & boundary)', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  const createLayoutEvent = (width: number, height: number): LayoutChangeEvent => ({
    nativeEvent: {
      layout: { x: 0, y: 0, width, height },
    },
  } as LayoutChangeEvent);

  it('allows normal monotonic layout expansion without tripping', () => {
    const onLayout = vi.fn();
    const handler = createLayoutSentinel('Accordion', onLayout, 3, 200);

    // Simulate monotonic expansion (e.g. accordion opening: 50 -> 100 -> 150 -> 200)
    handler(createLayoutEvent(100, 50));
    handler(createLayoutEvent(100, 100));
    handler(createLayoutEvent(100, 150));
    handler(createLayoutEvent(100, 200));

    expect(onLayout).toHaveBeenCalledTimes(4);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('trips the circuit breaker on oscillating alternating layout loop', () => {
    const onLayout = vi.fn();
    const handler = createLayoutSentinel('ProblematicCard', onLayout, 3, 500);

    // Simulate oscillating layout loop (alternating directions: 100 -> 120 -> 100 -> 120 -> 100)
    // 1. Initial
    handler(createLayoutEvent(100, 100));
    // 2. Increase (+20)
    handler(createLayoutEvent(100, 120));
    // 3. Decrease (-20) -> Oscillation 1
    handler(createLayoutEvent(100, 100));
    // 4. Increase (+20) -> Oscillation 2
    handler(createLayoutEvent(100, 120));
    // 5. Decrease (-20) -> Oscillation 3 -> Trips sentinel!
    handler(createLayoutEvent(100, 100));

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('[LayoutLoopSentinel] Cyclic layout loop detected in "ProblematicCard"')
    );

    // Any subsequent calls should be dropped by open circuit breaker
    const callsBefore = onLayout.mock.calls.length;
    handler(createLayoutEvent(100, 120));
    expect(onLayout.mock.calls.length).toBe(callsBefore);
  });

  it('resets oscillation counter if layouts occur outside burst window', () => {
    const onLayout = vi.fn();
    // windowMs = 50
    const handler = createLayoutSentinel('LazyCard', onLayout, 3, 50);

    handler(createLayoutEvent(100, 100));
    handler(createLayoutEvent(100, 120));
    handler(createLayoutEvent(100, 100));

    // Wait until burst window passes
    const originalDateNow = Date.now;
    try {
      Date.now = () => originalDateNow() + 200;
      handler(createLayoutEvent(100, 120));
      handler(createLayoutEvent(100, 100));
      // Should not trip because the burst window expired and reset
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    } finally {
      Date.now = originalDateNow;
    }
  });
});
