import * as Haptics from 'expo-haptics';
import { Accelerometer } from 'expo-sensors';
import React from 'react';
import { act, create } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSomaticShake } from '@/somatic/useSomaticShake';

vi.mock('expo-sensors', () => ({
  Accelerometer: {
    isAvailableAsync: vi.fn(),
    setUpdateInterval: vi.fn(),
    addListener: vi.fn(),
  },
}));

vi.mock('expo-haptics', () => ({
  impactAsync: vi.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: { Medium: 'medium' },
}));

function TestSomaticHarness({
  enabled = true,
  threshold = 2.2,
  cooldownMs = 4000,
  onShake,
}: {
  enabled?: boolean;
  threshold?: number;
  cooldownMs?: number;
  onShake: () => void;
}) {
  useSomaticShake({ enabled, threshold, cooldownMs, onShake });
  return null;
}

describe('useSomaticShake hook', () => {
  let sensorListener:
    | ((measurement: { x: number; y: number; z: number; timestamp: number }) => void)
    | null = null;
  const mockRemove = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    sensorListener = null;
    vi.mocked(Accelerometer.isAvailableAsync).mockResolvedValue(true);
    vi.mocked(Accelerometer.addListener).mockImplementation((listener) => {
      sensorListener = listener;
      return { remove: mockRemove };
    });
  });

  it('does not register accelerometer listener when enabled is false', async () => {
    const onShake = vi.fn();
    act(() => {
      create(<TestSomaticHarness enabled={false} onShake={onShake} />);
    });

    await Promise.resolve();

    expect(Accelerometer.addListener).not.toHaveBeenCalled();
    expect(sensorListener).toBeNull();
  });

  it('attaches listener and filters out sub-threshold motions', async () => {
    const onShake = vi.fn();
    act(() => {
      create(<TestSomaticHarness enabled={true} threshold={2.2} onShake={onShake} />);
    });

    await Promise.resolve();
    await Promise.resolve();

    expect(Accelerometer.setUpdateInterval).toHaveBeenCalledWith(100);
    expect(Accelerometer.addListener).toHaveBeenCalled();
    expect(sensorListener).not.toBeNull();

    // Normal earth gravity (stationary): x=0, y=1, z=0 -> magnitude = 1.0 < 2.2
    sensorListener!({ x: 0, y: 1, z: 0, timestamp: 1 });
    sensorListener!({ x: 0, y: 1, z: 0, timestamp: 2 });

    expect(onShake).not.toHaveBeenCalled();
    expect(Haptics.impactAsync).not.toHaveBeenCalled();
  });

  it('triggers onShake and haptic absorption after 2 consecutive spike frames', async () => {
    const onShake = vi.fn();
    act(() => {
      create(
        <TestSomaticHarness enabled={true} threshold={2.0} cooldownMs={3000} onShake={onShake} />,
      );
    });

    await Promise.resolve();
    await Promise.resolve();

    // Frame 1: spike (x=2, y=2, z=1 -> magnitude = 3.0 > 2.0)
    sensorListener!({ x: 2, y: 2, z: 1, timestamp: 1 });
    expect(onShake).not.toHaveBeenCalled(); // Requires 2 consecutive frames to confirm

    // Frame 2: second spike confirming physical shake
    sensorListener!({ x: 2, y: 2, z: 1, timestamp: 2 });
    expect(onShake).toHaveBeenCalledTimes(1);
    expect(Haptics.impactAsync).toHaveBeenCalled();
  });

  it('removes accelerometer subscription upon unmount', async () => {
    const onShake = vi.fn();
    let renderer: any;
    act(() => {
      renderer = create(<TestSomaticHarness enabled={true} onShake={onShake} />);
    });

    await Promise.resolve();
    await Promise.resolve();

    act(() => {
      renderer.unmount();
    });

    expect(mockRemove).toHaveBeenCalled();
  });
});
