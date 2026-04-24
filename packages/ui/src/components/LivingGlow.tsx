import React, { useEffect } from 'react';
import { ViewProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withTiming,
  useSharedValue,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { Box } from '../gluestack';

interface LivingGlowProps extends ViewProps {
  children?: React.ReactNode;
  active?: boolean;
  duration?: number;
  glowColor?: string;
  size?: number;
  className?: string;
}

/**
 * LivingGlow - Pulses with "Restorative Energy"
 *
 * Philosophy: Focal points in the Sanctuary should not be static.
 * They should have a "Breath-like" pulse that signifies life.
 */
export function LivingGlow({
  children,
  active = true,
  duration = 2000,
  glowColor,
  size,
  style,
  className,
  ...props
}: LivingGlowProps) {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    if (active) {
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.4, { duration, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      );
    } else {
      opacity.value = 0;
    }
  }, [active, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    shadowColor: glowColor || (active ? '#FFC107' : 'transparent'), // Fallback to saffron if active
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: opacity.value,
    shadowRadius: size ? size / 4 : 10,
    elevation: active ? 5 : 0,
    ...(size ? { width: size, height: size } : {}),
  }));

  return (
    <Animated.View style={[animatedStyle, style]} className={className} {...props}>
      {children ||
        (size ? (
          <Box
            className="rounded-full"
            style={{
              width: size,
              height: size,
              backgroundColor: glowColor || '#FFC107',
            }}
          />
        ) : null)}
    </Animated.View>
  );
}
