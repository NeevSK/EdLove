import { useEffect, useRef } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { Confetti, type ConfettiMethods } from 'react-native-fast-confetti';
import { useAccessibility } from '../hooks/useAccessibility';
import { color } from './motion';
import { SuccessCheck } from './Success';

type DensityTier = 'low' | 'medium' | 'high' | 'auto';

export interface CelebrationOverlayProps {
  /** Mount to trigger confetti. Set true to fire once. */
  trigger: boolean;
  /** Number of confetti flakes. Default 100. */
  count?: number;
  /** Density tier: 'low'=50, 'medium'=100, 'high'=200, 'auto'=detect device tier. */
  density?: DensityTier;
  /** Gravity constant (higher = faster fall). Default 1.0. */
  gravity?: number;
  /** Custom colors. Defaults to brand palette. */
  colors?: string[];
  /** Called when animation completes. */
  onAnimationEnd?: () => void;
}

/**
 * CelebrationOverlay — one-shot confetti burst for milestone moments.
 *
 * Uses react-native-fast-confetti (Skia Atlas API) for GPU-efficient
 * rendering. Lifecycle-managed: auto-unmounts after animation ends to
 * prevent ghost confetti (invisible rendering draining battery).
 *
 * Reduced-motion: renders SuccessCheck instead of confetti particles.
 *
 * Density tiers: 'low'=50, 'medium'=100, 'high'=200, 'auto'=detect device tier.
 * Auto-detection uses PixelRatio (low-end = < 2.5) and Platform.constants (if available).
 */
function getDensityCount(density: DensityTier): number {
  const presets: Record<Exclude<DensityTier, 'auto'>, number> = {
    low: 50,
    medium: 100,
    high: 200,
  };

  if (density !== 'auto') return presets[density];

  // Auto-detect: low-end devices get fewer particles
  // This is a simple heuristic — for production, consider a device-tier service
  if (Platform.OS === 'web') return presets.medium;

  try {
    // Use PixelRatio as a proxy for device tier
    // @ts-ignore - PixelRatio may not be available in all RN versions
    const pixelRatio = require('react-native').PixelRatio?.get?.() ?? 2;
    return pixelRatio < 2.5 ? presets.low : presets.medium;
  } catch {
    return presets.medium;
  }
}

export function CelebrationOverlay({
  trigger,
  count,
  density = 'auto',
  gravity = 1.0,
  colors = [color.brand.orange, color.brand.peach, color.brand.lightPeach],
  onAnimationEnd,
}: CelebrationOverlayProps) {
  const confettiRef = useRef<ConfettiMethods>(null);
  const { isReduceMotionEnabled } = useAccessibility();

  // Clean up on unmount — reset any running animation to prevent ghost confetti
  useEffect(() => {
    return () => {
      confettiRef.current?.reset();
    };
  }, []);

  if (!trigger) return null;

  // Reduced motion: show static success instead of confetti
  if (isReduceMotionEnabled) {
    return (
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <SuccessCheck size={64} />
      </View>
    );
  }

  const effectiveCount = count ?? getDensityCount(density);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Confetti
        ref={confettiRef}
        count={effectiveCount}
        colors={colors}
        gravity={gravity}
        autoplay
        infinite={false}
        fadeOutOnEnd
        onAnimationEnd={onAnimationEnd}
      />
    </View>
  );
}
