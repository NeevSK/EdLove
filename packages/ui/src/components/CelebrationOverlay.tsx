import { useVisualCapabilities } from '@repo/ui/context/VisualCapabilities';
import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
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
 * Density tiers remain an explicit product choice; auto is bounded by the resolved capability.
 */
function getRequestedCount(density: DensityTier, maxCelebrationParticles: number): number {
  const presets: Record<Exclude<DensityTier, 'auto'>, number> = {
    low: 50,
    medium: 100,
    high: 200,
  };

  return density === 'auto' ? maxCelebrationParticles : presets[density];
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
  const { allowSubtleAnimation, maxCelebrationParticles } = useVisualCapabilities();

  // Clean up on unmount — reset any running animation to prevent ghost confetti
  useEffect(() => {
    return () => {
      confettiRef.current?.reset();
    };
  }, []);

  if (!trigger) return null;

  // Reduced motion: show static success instead of confetti
  if (isReduceMotionEnabled || !allowSubtleAnimation) {
    return (
      <View style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}>
        <SuccessCheck size={64} />
      </View>
    );
  }

  const effectiveCount = Math.min(
    count ?? getRequestedCount(density, maxCelebrationParticles),
    maxCelebrationParticles,
  );

  return (
    <View style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}>
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
