import { tokens } from '@repo/ui/tokens';
import React, { useEffect } from 'react';
import { Platform, type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useAccessibility } from '../hooks/useAccessibility';
import { Mascot } from './Mascot';
import { duration, scale } from './motion';

export type BrandPulseProps = {
  /** Diameter in px. Defaults to the standard inline-loader size. */
  size?: number;
  /** Preserves contrast when the loader sits on a colored surface. */
  tintColor?: string;
  className?: string;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

/**
 * The small, living loading signal. It is Firefly rather than a logo so a wait
 * feels like a guide holding the person's place, not a branded interruption.
 */
export function BrandPulse({
  size = 28,
  tintColor = tokens.colors.primary,
  className,
  style,
  accessibilityLabel = 'Loading',
}: BrandPulseProps) {
  const content = <Mascot glowColor={tintColor} mode="glowing" size={size} />;
  const pulse = useSharedValue(1);
  const { isReduceMotionEnabled } = useAccessibility();

  useEffect(() => {
    if (isReduceMotionEnabled) {
      pulse.value = 1;
      return;
    }

    pulse.value = withRepeat(
      withSequence(
        withTiming(scale.breatheMax, { duration: duration.breathe / 2 }),
        withTiming(scale.breatheMin, { duration: duration.breathe / 2 }),
      ),
      -1,
      false,
    );

    return () => {
      pulse.value = 1;
    };
  }, [isReduceMotionEnabled, pulse]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 0.74 + (pulse.value - scale.breatheMin) * 8.7,
    transform: [{ scale: pulse.value }],
  }));
  const accessibilityProps = {
    accessible: true,
    accessibilityRole: 'progressbar' as const,
    accessibilityLabel,
    accessibilityState: { busy: true },
  };

  if (Platform.OS !== 'web') {
    return (
      <View {...accessibilityProps} className={className} style={[styles.wrap, style]}>
        <Animated.View style={animatedStyle}>
          {content}
        </Animated.View>
      </View>
    );
  }

  return (
    <View {...accessibilityProps} className={className} style={[styles.wrap, style]}>
      <style>{`
        @keyframes firefly-loader-breathe {
          0%, 100% { opacity: 0.74; transform: scale(${scale.breatheMin}); }
          50% { opacity: 1; transform: scale(${scale.breatheMax}); }
        }
        .firefly-loader { animation: firefly-loader-breathe ${duration.breathe}ms ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .firefly-loader { animation: none; } }
      `}</style>
      <div className="firefly-loader">{content}</div>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
