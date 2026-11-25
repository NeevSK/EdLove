import type { ReactNode } from 'react';

const animationIdentity = (value: unknown) => value;

export const useSharedValue = <T>(initial: T) => {
  let val = initial;
  return {
    get value() {
      return val;
    },
    set value(v: T) {
      val = v;
    },
    get: () => val,
    set: (v: T) => {
      val = v;
    },
  };
};

export const useAnimatedStyle = () => ({});
export const useDerivedValue = <T>(fn: () => T) => ({
  get value() {
    return fn();
  },
  get: fn,
  set: () => undefined,
});

export const withTiming = animationIdentity;
export const withDelay = (_delay: number, animation: unknown) => animation;
export const withSequence = (...animations: unknown[]) => animations[animations.length - 1];
export const withSpring = animationIdentity;
export const withRepeat = (animation: unknown) => animation;
export const cancelAnimation = () => undefined;

/** @deprecated Use scheduleOnRN from react-native-worklets in modern Reanimated 4 code */
export const runOnJS = <T extends (...args: never[]) => unknown>(fn: T) => fn;

export const Easing = {
  linear: (value: number) => value,
  ease: (value: number) => value,
  bezier: () => (value: number) => value,
  in: (value: unknown) => value,
  out: (value: unknown) => value,
  inOut: (value: unknown) => value,
};

const createAnimationBuilder = () => {
  const builder: Record<string, unknown> = {
    duration: () => builder,
    delay: () => builder,
    springify: () => builder,
    damping: () => builder,
    stiffness: () => builder,
    mass: () => builder,
    withInitialValues: () => builder,
    withTargetValues: () => builder,
    build: () => ({}),
  };
  return builder;
};

export const FadeIn = createAnimationBuilder();
export const FadeOut = createAnimationBuilder();
export const FadeInDown = createAnimationBuilder();
export const FadeInUp = createAnimationBuilder();
export const FadeOutDown = createAnimationBuilder();
export const FadeOutUp = createAnimationBuilder();
export const SlideInDown = createAnimationBuilder();
export const SlideInUp = createAnimationBuilder();
export const SlideInLeft = createAnimationBuilder();
export const SlideInRight = createAnimationBuilder();
export const SlideOutDown = createAnimationBuilder();
export const SlideOutUp = createAnimationBuilder();
export const SlideOutLeft = createAnimationBuilder();
export const SlideOutRight = createAnimationBuilder();
export const ZoomIn = createAnimationBuilder();
export const ZoomOut = createAnimationBuilder();
export const Layout = createAnimationBuilder();
export const LinearTransition = createAnimationBuilder();

export const SharedTransitionBoundary = ({ children }: { isActive?: boolean; children?: ReactNode }) => children ?? null;

export const SharedTransition = {
  custom: () => createAnimationBuilder(),
  fadeContent: () => createAnimationBuilder(),
  progressAnimation: () => createAnimationBuilder(),
  defaultTransitionType: () => createAnimationBuilder(),
  duration: () => createAnimationBuilder(),
};

const Animated = {
  View: 'Animated.View',
  Text: 'Animated.Text',
  Image: 'Animated.Image',
  ScrollView: 'Animated.ScrollView',
  createAnimatedComponent: <T>(component: T) => component,
  SharedTransitionBoundary,
};

export default Animated;
