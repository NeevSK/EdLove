import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SURFACE_REFRESH_RATES, SurfaceType } from '../../core/soul/TimeLayer';
import type { TrubeRenderPlan } from '../../core/types';

interface PerformanceOverlayProps {
  plan: TrubeRenderPlan;
  surfaceName: string;
}

export function PerformanceOverlay({ plan, surfaceName }: PerformanceOverlayProps) {
  const skipRate = SURFACE_REFRESH_RATES[surfaceName as SurfaceType] || 1;
  const targetFps = Math.round(60 / skipRate);

  return (
    <View style={styles.container} pointerEvents="none"      <View style={styles.badge}        <Text style={styles.label}>BACKEND</Text        <Text style={[styles.value, { color: plan.backend === 'native-vulkan' ? '#4ade80' : '#60a5fa' }]}          {plan.backend.toUpperCase()}
        </Text      </View
      <View style={styles.badge}        <Text style={styles.label}>SURFACE</Text        <Text style={styles.value}>{surfaceName.toUpperCase()}</Text      </View
      <View style={styles.badge}        <Text style={styles.label}>TARGET</Text        <Text style={styles.value}>{targetFps} FPS (Skip: {skipRate}f)</Text      </View
      <View style={styles.badge}        <Text style={styles.label}>SIGNAL</Text        <Text style={styles.value}>ENTROPY_LIVING_TSL</Text      </View    </View  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 999,
    gap: 4,
  },
  badge: {
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#facc15',
  },
  label: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  value: {
    color: '#ffffff',
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
});
