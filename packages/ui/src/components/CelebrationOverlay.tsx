import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
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
 * CelebrationOverlay — milestone celebration overlay.
 * Uses the simple native SVG checkmark for success feedback.
 */
export function CelebrationOverlay({ trigger, onAnimationEnd }: CelebrationOverlayProps) {
  useEffect(() => {
    if (trigger && onAnimationEnd) {
      const timer = setTimeout(() => {
        onAnimationEnd();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [trigger, onAnimationEnd]);

  if (!trigger) return null;

  return (
    <View style={[StyleSheet.absoluteFill, styles.center, { pointerEvents: 'none' }]}>
      <SuccessCheck size={64} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
