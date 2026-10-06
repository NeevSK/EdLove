import { useVisualCapabilities } from '@repo/ui/context/VisualCapabilities';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useAccessibility } from '../hooks/useAccessibility';
import { SuccessCheck, SuccessGlow } from './Success';

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
 * CelebrationOverlay — milestone celebration overlay.
 * Uses native SVG + Reanimated SuccessGlow / SuccessCheck for crash-proof,
 * 60fps rendering without legacy Skia 2.x codegen conflicts.
 */
export function CelebrationOverlay({
  trigger,
  onAnimationEnd,
}: CelebrationOverlayProps) {
  const { isReduceMotionEnabled } = useAccessibility();
  const { allowSubtleAnimation } = useVisualCapabilities();

  useEffect(() => {
    if (trigger && onAnimationEnd) {
      const timer = setTimeout(() => {
        onAnimationEnd();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [trigger, onAnimationEnd]);

  if (!trigger) return null;

  if (isReduceMotionEnabled || !allowSubtleAnimation) {
    return (
      <View style={[StyleSheet.absoluteFill, styles.center, { pointerEvents: 'none' }]}>
        <SuccessCheck size={64} />
      </View>
    );
  }

  return (
    <View style={[StyleSheet.absoluteFill, styles.center, { pointerEvents: 'none' }]}>
      <SuccessGlow size={80} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
