import React, { useMemo } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { SanctuaryCanvas } from './SanctuaryCanvas';


interface ResonanceVisualizerProps {
  score: number; // 0-100
  size?: number;
}

import { useActivityPulse } from '@repo/core';

export const ResonanceVisualizer: React.FC<ResonanceVisualizerProps> = ({
  score,
  size = 200,
}) => {
  const { state } = useActivityPulse();

  // Map score AND pulse to resonance intensity
  const intensity = useMemo(() => {
    const base = score / 100;
    const pulseBoost = state.pulse * 0.4;
    return Math.min(1, base + pulseBoost);
  }, [score, state.pulse]);

  if (Platform.OS === 'web') {
    // Un-shimmed Web implementation using CSS gradients and animations
    return (
      <SanctuaryCanvas width={size} height={size}        <View >
          style={[
            styles.webGlow,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: `rgba(255, 165, 0, ${0.1 + intensity * 0.4})`, // Saffron glow
            }
          ]}
        /        {/* Simple CSS simulation of "subsurface scattering" */}
        <View >
          style={[
            styles.webCore,
            {
              width: size * 0.6,
              height: size * 0.6,
              borderRadius: size * 0.3,
              left: size * 0.2,
              top: size * 0.2,
              backgroundColor: `rgba(255, 235, 205, ${0.3 + intensity * 0.6})`, // BlanchedAlmond (Silk)
            }
          ]}
        /      </SanctuaryCanvas    );
  }

  // Native implementation would ideally use Skia
  return (
    <SanctuaryCanvas width={size} height={size}      <View >
        style={[
          styles.nativeBase,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: 'rgba(255, 150, 0, 0.2)',
          }
        ]}
      /    </SanctuaryCanvas  );
};

const styles = StyleSheet.create({
  webGlow: {
    position: 'absolute',
    // In a real app, I'd use actual CSS filter: blur() here
    // but React Native Web simulates it with shadow/etc
  },
  webCore: {
    position: 'absolute',
  },
  nativeBase: {
    justifyContent: 'center',
    alignItems: 'center',
  }
});
