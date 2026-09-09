/**
 * EaseView Adaptor — drop-in replacement for react-native-ease's EaseView.
 *
 * Uses Reanimated under the hood. Provides the same declarative API:
 *   <EaseView initialAnimate={{ scale: 0.8 }} animate={{ scale: 1.0 }} transition={{ type: 'timing', duration: 500 }} />
 *
 * Supports: timing (with loop: 'repeat' | 'reverse'), spring, none.
 */
import { useEffect, useMemo } from 'react';
import { View, type ViewProps, type ViewStyle } from 'react-native';
import Animated, {
  type AnimatedProps,
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

type EasingType = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | [number, number, number, number];

type TimingTransition = {
  type: 'timing';
  duration?: number;
  easing?: EasingType;
  loop?: 'repeat' | 'reverse';
  delay?: number;
};

type SpringTransition = {
  type: 'spring';
  damping?: number;
  stiffness?: number;
  mass?: number;
  delay?: number;
};

type NoneTransition = { type: 'none' };

type SingleTransition = TimingTransition | SpringTransition | NoneTransition;

type AnimateProps = {
  opacity?: number;
  translateX?: number;
  translateY?: number;
  scale?: number;
  scaleX?: number;
  scaleY?: number;
  rotate?: number;
  borderRadius?: number;
  backgroundColor?: string;
  borderWidth?: number;
  borderColor?: string;
  elevation?: number;
};

interface EaseViewProps extends Omit<ViewProps, 'style'> {
  initialAnimate?: AnimateProps;
  animate?: AnimateProps;
  transition?: SingleTransition;
  transformOrigin?: { x?: number; y?: number };
  style?: ViewProps['style'];
}

function mapEasing(easing?: EasingType) {
  if (!easing) return Easing.inOut(Easing.ease);
  if (Array.isArray(easing)) return Easing.bezier(...easing);
  switch (easing) {
    case 'linear':
      return Easing.linear;
    case 'easeIn':
      return Easing.in(Easing.ease);
    case 'easeOut':
      return Easing.out(Easing.ease);
    case 'easeInOut':
      return Easing.inOut(Easing.ease);
    default:
      return Easing.inOut(Easing.ease);
  }
}

function getIdentityValue(key: string): number {
  switch (key) {
    case 'opacity':
      return 1;
    case 'translateX':
    case 'translateY':
    case 'rotate':
    case 'borderRadius':
    case 'borderWidth':
    case 'elevation':
      return 0;
    case 'scale':
    case 'scaleX':
    case 'scaleY':
      return 1;
    default:
      return 0;
  }
}

export function EaseView({
  initialAnimate = {},
  animate = {},
  transition = { type: 'timing', duration: 300 },
  style,
  children,
  ...rest
}: EaseViewProps) {
  const opacity = useSharedValue(initialAnimate.opacity ?? 1);
  const translateX = useSharedValue(initialAnimate.translateX ?? 0);
  const translateY = useSharedValue(initialAnimate.translateY ?? 0);
  const scale = useSharedValue(initialAnimate.scale ?? 1);
  const scaleX = useSharedValue(initialAnimate.scaleX ?? 1);
  const scaleY = useSharedValue(initialAnimate.scaleY ?? 1);
  const rotate = useSharedValue(initialAnimate.rotate ?? 0);
  const borderRadius = useSharedValue(initialAnimate.borderRadius ?? 0);
  const borderWidth = useSharedValue(initialAnimate.borderWidth ?? 0);
  const elevation = useSharedValue(initialAnimate.elevation ?? 0);

  const values = useMemo(
    () => ({
      opacity,
      translateX,
      translateY,
      scale,
      scaleX,
      scaleY,
      rotate,
      borderRadius,
      borderWidth,
      elevation,
    }),
    [
      opacity,
      translateX,
      translateY,
      scale,
      scaleX,
      scaleY,
      rotate,
      borderRadius,
      borderWidth,
      elevation,
    ],
  );

  // Set initial values
  useEffect(() => {
    for (const [key, sv] of Object.entries(values)) {
      const initVal = initialAnimate[key as keyof AnimateProps];
      if (typeof initVal === 'number') {
        sv.value = initVal;
      }
    }
  }, []);

  // Animate to target values
  useEffect(() => {
    for (const [key, sv] of Object.entries(values)) {
      const targetVal = animate[key as keyof AnimateProps];
      if (typeof targetVal !== 'number') continue;

      cancelAnimation(sv);

      if (transition.type === 'none') {
        sv.value = targetVal;
        continue;
      }

      if (transition.type === 'spring') {
        sv.value = withSpring(targetVal, {
          damping: transition.damping ?? 15,
          stiffness: transition.stiffness ?? 120,
          mass: transition.mass ?? 1,
        });
        continue;
      }

      // timing
      const duration = transition.duration ?? 300;
      const easing = mapEasing(transition.easing);

      if (transition.loop) {
        sv.value = withRepeat(
          withTiming(targetVal, { duration, easing }, () => {}),
          -1,
          transition.loop === 'reverse',
        );
      } else {
        sv.value = withTiming(targetVal, { duration, easing });
      }
    }

    return () => {
      for (const sv of Object.values(values)) {
        cancelAnimation(sv);
      }
    };
  }, [
    animate.opacity,
    animate.translateX,
    animate.translateY,
    animate.scale,
    animate.scaleX,
    animate.scaleY,
    animate.rotate,
    animate.borderRadius,
    animate.borderWidth,
    animate.elevation,
    transition.type,
    // @ts-expect-error transition may have optional duration
    transition.duration,
    // @ts-expect-error transition may have optional loop
    transition.loop,
  ]);

  const animatedStyle = useAnimatedStyle(() => {
    const result: Record<string, unknown> = {};

    if (animate.opacity !== undefined || initialAnimate.opacity !== undefined) {
      result.opacity = opacity.value;
    }

    const hasTransform =
      animate.translateX !== undefined ||
      initialAnimate.translateX !== undefined ||
      animate.translateY !== undefined ||
      initialAnimate.translateY !== undefined ||
      animate.scale !== undefined ||
      initialAnimate.scale !== undefined ||
      animate.scaleX !== undefined ||
      initialAnimate.scaleX !== undefined ||
      animate.scaleY !== undefined ||
      initialAnimate.scaleY !== undefined ||
      animate.rotate !== undefined ||
      initialAnimate.rotate !== undefined;

    if (hasTransform) {
      const transforms: Record<string, number | string>[] = [];
      if (animate.translateX !== undefined || initialAnimate.translateX !== undefined) {
        transforms.push({ translateX: translateX.value });
      }
      if (animate.translateY !== undefined || initialAnimate.translateY !== undefined) {
        transforms.push({ translateY: translateY.value });
      }
      if (animate.scaleX !== undefined || initialAnimate.scaleX !== undefined) {
        transforms.push({ scaleX: scaleX.value });
      } else if (animate.scale !== undefined || initialAnimate.scale !== undefined) {
        transforms.push({ scale: scale.value });
      }
      if (animate.scaleY !== undefined || initialAnimate.scaleY !== undefined) {
        transforms.push({ scaleY: scaleY.value });
      }
      if (animate.rotate !== undefined || initialAnimate.rotate !== undefined) {
        transforms.push({ rotate: `${rotate.value}deg` });
      }
      result.transform = transforms;
    }

    if (animate.borderRadius !== undefined || initialAnimate.borderRadius !== undefined) {
      result.borderRadius = borderRadius.value;
    }
    if (animate.borderWidth !== undefined || initialAnimate.borderWidth !== undefined) {
      result.borderWidth = borderWidth.value;
    }
    if (animate.elevation !== undefined || initialAnimate.elevation !== undefined) {
      result.elevation = elevation.value;
    }

    return result as ViewStyle;
  });

  return (
    <Animated.View style={[style, animatedStyle]} {...rest}>
      {children}
    </Animated.View>
  );
}
