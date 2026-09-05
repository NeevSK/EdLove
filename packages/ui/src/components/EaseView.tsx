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
  const values = useMemo(() => {
    const keys = new Set([...Object.keys(initialAnimate), ...Object.keys(animate)]);
    const result: Record<string, ReturnType<typeof useSharedValue<number>>> = {};
    for (const key of keys) {
      result[key] = useSharedValue(getIdentityValue(key));
    }
    return result;
  }, []);

  // Set initial values
  useEffect(() => {
    for (const [key, sv] of Object.entries(values)) {
      const initVal = initialAnimate[key as keyof AnimateProps];
      if (initVal !== undefined) {
        sv.value = initVal as number;
      }
    }
  }, []);

  // Animate to target values
  useEffect(() => {
    for (const [key, sv] of Object.entries(values)) {
      const targetVal = animate[key as keyof AnimateProps];
      if (targetVal === undefined) continue;

      cancelAnimation(sv);

      if (transition.type === 'none') {
        sv.value = targetVal as number;
        continue;
      }

      if (transition.type === 'spring') {
        sv.value = withSpring(targetVal as number, {
          damping: transition.damping ?? 15,
          stiffness: transition.stiffness ?? 120,
          mass: transition.mass ?? 1,
        });
        continue;
      }

      // timing
      const duration = transition.duration ?? 300;
      const easing = mapEasing(transition.easing);
      const delay = transition.delay ?? 0;

      if (transition.loop) {
        sv.value = withRepeat(
          withTiming(targetVal as number, { duration, easing }, () => {}),
          -1,
          transition.loop === 'reverse',
        );
      } else {
        sv.value = withTiming(targetVal as number, { duration, easing });
      }
    }

    return () => {
      for (const sv of Object.values(values)) {
        cancelAnimation(sv);
      }
    };
  }, [JSON.stringify(animate), JSON.stringify(transition)]);

  const animatedStyle = useAnimatedStyle(() => {
    const result: Record<string, unknown> = {};

    if (values.opacity) result.opacity = values.opacity.value;

    if (
      values.translateX ||
      values.translateY ||
      values.scale ||
      values.scaleX ||
      values.scaleY ||
      values.rotate
    ) {
      const transforms: Record<string, number | string>[] = [];
      if (values.translateX) transforms.push({ translateX: values.translateX.value });
      if (values.translateY) transforms.push({ translateY: values.translateY.value });
      if (values.scaleX) transforms.push({ scaleX: values.scaleX.value });
      else if (values.scale) transforms.push({ scale: values.scale.value });
      if (values.scaleY) transforms.push({ scaleY: values.scaleY.value });
      if (values.rotate) transforms.push({ rotate: `${values.rotate.value}deg` });
      result.transform = transforms;
    }

    if (values.borderRadius) result.borderRadius = values.borderRadius.value;
    if (values.borderWidth) result.borderWidth = values.borderWidth.value;
    if (values.elevation) result.elevation = values.elevation.value;

    return result as ViewStyle;
  });

  return (
    <Animated.View style={[style, animatedStyle]} {...rest}>
      {children}
    </Animated.View>
  );
}
